import EventEmitter from "../modules/Event_Emitter.js";

export default class ViewHistory extends EventEmitter {
    constructor(gameIO, viewModel) {
        super()
        this.gameIO = gameIO
        this.viewModel = viewModel        
        this.snapHistory = []   // An array of all snapshots, the tail is the most recent
        this._snapIndex = -1    // The currently displayed snapshot from snapHistory
        this.paused = false     // When true update view with queued snapshots
        this.isRunning = false  // Semaphore around the run loop, prevents update race condition

        // Websocket incoming events.
        this.gameIO.on("snapshot", async snapshot => {
            console.log(`${snapshot.hash.substring(0, 8)}:Snapshot`)
            this.enqueue(snapshot)
        });
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

    async run() {
        if (this.isRunning) return
        this.isRunning = true
        while (!this.paused) {
            if (this.snapIndex >= this.snapHistory.length - 1) break
            await this.next();
        }
        this.isRunning = false
    }

    async prev() {
        if (this.snapIndex > 0) this.snapIndex -= 1
        console.log(`${this.snapIndex}: ${this.snapshot.serial_id} state ${this.snapshot.state}`)
        this.emit("load", this.snapshot)
    }

    async next() {
        if (this.snapIndex >= this.snapHistory.length - 1) return
        this.snapIndex += 1
        console.log(`${this.snapshot.hash.substring(0, 8)}: state ${this.snapshot.state}`)
        this.emit("update", this.snapshot)
    }

    get snapshot() {
        if (this.snapHistory.length == 0) throw new Error("No items in snap queue.");
        return this.snapHistory[this.snapIndex]
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

    addButtonListeners() {
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

    }

    async enqueue(snapshot) {
        // don't queue old snapshots
        const lastHash = this.snapHistory.at(-1)?.hash
        if (lastHash !== snapshot.hash) {
            this.snapHistory.push(snapshot)
            this.save()
            this.updateButtons()
            await this.run()
        }
    }

    save() {
        const history_json = JSON.stringify(this.snapHistory)
        localStorage.setItem("history", history_json)
    }

    async loadHistory() {
        const token = this.viewModel.gameToken

        if (localStorage.getItem("history-for") != token) {
            // Clear local history for new games.
            localStorage.setItem("history", "[]")
            localStorage.setItem("history-for", token)
            return
        }

        const history = localStorage.getItem("history")
        this.snapHistory = JSON.parse(history)
        this._snapIndex = this.snapHistory.length - 1

        if (history.length > 0) {
            this.emit("load", this.snapshot)
        }
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
}