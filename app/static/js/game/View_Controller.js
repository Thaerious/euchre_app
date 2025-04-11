import ViewUpdate from "./View_Update.js"

export default class ViewController {
    // This class is the glue between the ViewModel and the this.gameIO
    // It listens for events emitted from either the ViewModel or this.gameIO and updates
    // the other objects accordingly.
    // It will also change the state of the ViewModel based on ViewModel events.

    constructor(viewModel, gameIO) {
        this.gameIO = gameIO
        this.viewModel = viewModel
        this.viewUpdate = new ViewUpdate(viewModel)

        this.snapHistory = []   // An array of all snapshots, the tail is the most recent
        this._snapIndex = -1    // The currently displayed snapshot from snapHistory
        this.paused = false     // When true update view with queued snapshots
        this.isRunning = false  // Semaphore around the run loop, prevents update race condition

        this.addListeners()
    }

    addListeners() {
        // Websocket event for a new snapshot.
        this.gameIO.on("snapshot", async snapshot => {
            console.log(`${snapshot.serial_id}: ${snapshot.last_player ?? "server"} ${snapshot.last_action}`)
            this.enqueue(snapshot)
        });

        // Websocket event for server side errors.
        this.gameIO.on("error", async (error) => {
            console.log(`Caught EuchreException: ${error.message}`);
            await this.viewUpdate.update(this.snapshot, true)
            this.viewModel.message.show(error.message);
        });

        // Changing a suit button will enable action buttons
        this.viewModel.suitButtons.on("change-suit", () => {
            this.viewModel.actionButtons.enableAll()
        });

        // Snapshot Queue button listeners
        document.querySelector("#next_snap").addEventListener("click", () => {
            this.next()
        });

        document.querySelector("#snap_index").addEventListener("click", () => {
            this.go(this.snapIndex)
        });

        document.querySelector("#prev_snap").addEventListener("click", () => {
            this.paused = true
            this.prev()
        });

        document.querySelector("#run_queue").addEventListener("click", async () => {
            this.paused = false
            this.run()
        });

        document.querySelector("#pause_queue").addEventListener("click", () => {
            this.paused = true
        });

        // Event listeners
        this.viewModel.actionButtons.on("pass", () => {
            this.gameIO.doAction("pass", null)
        });

        this.viewModel.actionButtons.on("make", () => {
            this.gameIO.doAction("make", this.viewModel.suitButtons.getSuit())
        });

        this.viewModel.actionButtons.on("alone", () => {
            this.gameIO.doAction("alone", this.viewModel.suitButtons.getSuit())
        });

        this.viewModel.actionButtons.on("order", () => {
            this.gameIO.doAction("order", null)
        });

        this.viewModel.actionButtons.on("continue", () => {
            this.next()
        });

        // Hand card listeners
        this.viewModel.hands[0].on("selected", (card) => {
            switch (this.snapshot.state) {
                case 2:
                    this.gameIO.doAction("up", card)
                    break;
                case 5:
                    console.log("do action")
                    this.gameIO.doAction("play", card)
                    break;
            }
        });

        // Menu Listeners
        this.viewModel.exitButton.addEventListener("click", async () => {
            const response = await fetch("/exit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }
            })

            if (response.redirected) {
                window.location.href = response.url;
            }
        });
        this.viewModel.rulesButton.addEventListener("click", () => { });
    }

    async loadHistory() {
        const token = this.viewModel.gameToken

        if (localStorage.getItem("history-for") != token) {
            // Clear local history for new games.
            localStorage.setItem("history", [])
            localStorage.setItem("history-for", token)
            return
        }

        const _history = localStorage.getItem("history")
        this.snapHistory = JSON.parse(_history)
        this._snapIndex = this.snapHistory.length - 1
        this.viewUpdate.load(this.snapHistory.at(-1))
    }

    async run() {
        if (this.isRunning) return
        this.isRunning = true
        while (!this.paused) {
            if (this.snapIndex >= this.snapHistory.length - 1) break
            await this.next();
        }
        this.isRunning = false
    }

    // getter/setter for pause, changes view state of queue buttons
    get paused() {
        return this._paused
    }

    set paused(value) {
        this._paused = value

        if (value) {
            document.querySelector("#run_queue").classList.remove("disabled")
            document.querySelector("#pause_queue").classList.add("disabled")
        } else {
            document.querySelector("#run_queue").classList.add("disabled")
            document.querySelector("#pause_queue").classList.remove("disabled")
        }
    }

    // getter/setter for currently displayed snapshot
    get snapIndex() {
        return this._snapIndex
    }

    set snapIndex(value) {
        if (value < 0) {
            this._snapIndex = 0;
        } else if (value >= this.snapHistory.length) {
            this._snapIndex = this.snapHistory.length - 1;
        } else {
            this._snapIndex = value;
        }
        this.updateButtons()
    }

    updateButtons() {
        document.querySelector("#prev_snap").classList.remove("disabled")
        document.querySelector("#next_snap").classList.remove("disabled")

        if (this.snapIndex <= 0) {
            document.querySelector("#prev_snap").classList.add("disabled")
        }
        if (this.snapIndex >= this.snapHistory.length - 1) {
            document.querySelector("#next_snap").classList.add("disabled")
        }

        document.querySelector("#snap_index").innerText = `${this.snapIndex}`
    }

    get snapshot() {
        if (this.snapHistory.length == 0) throw new Error("No items in snap queue.");
        return this.snapHistory[this.snapIndex]
    }

    async enqueue(snapshot) {
        // don't queue old snapshots
        console.log("Enqueue", snapshot.serial_id)
        if (this.snapHistory.length > 0 && snapshot.serial_id <= this.snapHistory.at(-1).serial_id) return
        this.snapHistory.push(snapshot)
        this.saveHistory()
        this.updateButtons()
        await this.run()
    }

    saveHistory() {
        localStorage.removeItem("history")
        const history_json = JSON.stringify(this.snapHistory)
        localStorage.setItem("history", history_json)
    }

    list() {
        for (let i = 0; i < this.snapHistory.length; i++) {
            const snap = this.snapHistory[i]
            if (i == this.snapIndex) {
                console.log(`>[${i}:${snap.serial_id}]`, snap.last_player, snap.last_action, snap.state)
            } else {
                console.log(` [${i}:${snap.serial_id}]`, snap.last_player, snap.last_action, snap.state)
            }
        }
    }

    async prev() {
        if (this.snapIndex > 0) this.snapIndex -= 1
        console.log(`${this.snapIndex}: ${this.snapshot.serial_id} state ${this.snapshot.state}`)
        await this.viewUpdate.load(this.snapshot)
    }

    async next() {
        if (this.snapIndex >= this.snapHistory.length - 1) return
        this.snapIndex += 1
        console.log(`${this.snapIndex}: ${this.snapshot.serial_id} state ${this.snapshot.state}`)
        await this.viewUpdate.update(this.snapshot)
    }

    async runQueue() {
        while (this.snapIndex < this.snapHistory.length - 1) {
            await this.next()
        }
    }

    async go(index) {
        if (index < 0) index = 0
        if (index > this.snapHistory.length - 1) index = this.snapHistory.length - 1
        this.snapIndex = index
        await this.viewUpdate.update(this.snapshot, true)
    }
}