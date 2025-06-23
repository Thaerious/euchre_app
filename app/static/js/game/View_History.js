import EventEmitter from "../modules/Event_Emitter.js";

export default class ViewHistory extends EventEmitter {
    constructor(viewModel) {
        super()
        this.viewModel = viewModel        
        this.snapHistory = []   // An array of all snapshots, the tail is the most recent
        this._snapIndex = -1    // The currently displayed snapshot from snapHistory
        this.paused = false     // When true update view with queued snapshots
        this.isRunning = false  // Semaphore around the run loop, prevents update race condition
    }

    // getter/setter for pause, changes view state of queue buttons
    get paused() {
        return this._paused
    }

    set paused(value) {
        this._paused = value
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
    }

    async run() {
        if (this.isRunning) return
        this.isRunning = true
        while (!this.paused) {
            if (this.snapIndex >= this.snapHistory.length - 1) {
                // Stop the loop when caught up
                break
            }
            await this.next();
        }
        this.isRunning = false
    }

    async prev() {
        if (this.snapIndex > 0) this.snapIndex -= 1
        this.emit("load", this.snapshot)
    }

    async next() {
        if (this.snapIndex >= this.snapHistory.length - 1) return
        this.snapIndex += 1
        await this.emit("load", this.snapshot)
        return new Promise(resolve => setTimeout(resolve, 1000));
    }

    async enqueue(snapshot) {
        // don't queue old snapshots
        const lastHash = this.snapHistory.at(-1)?.hash
        if (lastHash !== snapshot.hash) {
            this.snapHistory.push(snapshot)
            this.save()
            await this.run() // Won't run when paused
        }
    }

    save() {
        const history_json = JSON.stringify(this.snapHistory)
        localStorage.setItem("history", history_json)
    }

    async load() {
        const token = this.viewModel.gameToken

        // Clear local history for new games.
        if (localStorage.getItem("history-for") != token) {
            localStorage.setItem("history", "[]")
            localStorage.setItem("history-for", token)
            return
        }

        const history = localStorage.getItem("history")
        this.snapHistory = JSON.parse(history)
        this.snapIndex = this.snapHistory.length - 1

        if (history.length > 0) {
            this.emit("load", this.snapshot)
        }
    }
}