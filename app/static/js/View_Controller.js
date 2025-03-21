


export default class ViewController {
    constructor(viewModel, gameIO) {
        this.gameIO = gameIO
        this.viewModel = viewModel       
        this.snapQ = []
        this._snapIndex = -1
        this.paused = true
        this.isRunning = false

        gameIO.on("snapshot", async snapshot => {
            console.log(`${snapshot.serial_id}: ${snapshot.last_player ?? "server"} ${snapshot.last_action}`)
        });
        gameIO.on("snapshot", async snapshot => this.enqueue(snapshot))     
        
        gameIO.on("error", async (error) => {
            console.log(`Caught EuchreException: ${error.message}`); 
            await this.viewModel.update(this.snapshot, true)
            this.viewModel.message.show(error.message);            
        });

        document.querySelector("#next_snap").addEventListener("click", () => {
            this.next()
        });

        document.querySelector("#snap_index").addEventListener("click", () => {
            this.go(this.snapIndex)
        });      

        document.querySelector("#prev_snap").addEventListener("click", () => {
            document.querySelector("#run_queue").classList.remove("disabled")
            document.querySelector("#pause_queue").classList.add("disabled")            
            this.paused = true            
            this.prev()
        });    
        
        document.querySelector("#run_queue").addEventListener("click", async () => {
            document.querySelector("#run_queue").classList.add("disabled")
            document.querySelector("#pause_queue").classList.remove("disabled")
            this.paused = false
            this.run()
        });          

        document.querySelector("#pause_queue").addEventListener("click", () => {
            document.querySelector("#run_queue").classList.remove("disabled")
            document.querySelector("#pause_queue").classList.add("disabled")            
            this.paused = true
        });                  
   
        this.viewModel.actionButtons.on("pass", () => {
            gameIO.doAction("pass", this.viewModel.suitButtons.getSuit())
        });
    
        this.viewModel.actionButtons.on("make", () => {
            gameIO.doAction("make", this.viewModel.suitButtons.getSuit())
        });
    
        this.viewModel.actionButtons.on("alone", () => {
            gameIO.doAction("alone", this.viewModel.suitButtons.getSuit())
        });
    
        this.viewModel.actionButtons.on("order", () => {
            gameIO.doAction("order", null)
        });

        this.viewModel.actionButtons.on("continue", () => {
            this.next()
        });        
        
        this.viewModel.hands[0].on("selected", (card) => {
            switch (this.snapshot.state) {
                case 2:
                    gameIO.doAction("up", card)
                    break;
                case 5:
                    console.log("do action")
                    gameIO.doAction("play", card)
                    break;
            }
        });
    }

    get snapIndex() {
        return this._snapIndex
    }

    set snapIndex(value) {
        if (value < 0) {
            this._snapIndex = 0;
        } else if (value >= this.snapQ.length) {
            this._snapIndex = this.snapQ.length - 1;
        } else {
            this._snapIndex = value;
        }

        this.updateButtons()  
        
        if (this._snapIndex == this.snapQ.length - 1) {
            this.gameIO.enabled = true
        } else {
            this.gameIO.enabled = false
        }
    }

    updateButtons() {
        document.querySelector("#prev_snap").classList.remove("disabled")
        document.querySelector("#next_snap").classList.remove("disabled")

        if (this.snapIndex <= 0) {
            document.querySelector("#prev_snap").classList.add("disabled")
        }
        if (this.snapIndex >= this.snapQ.length - 1) {
            document.querySelector("#next_snap").classList.add("disabled")
        }   

        document.querySelector("#snap_index").innerText = `${this.snapIndex}/${this.snapQ.length - 1}`
    }

    get snapshot() {
        if (this.snapQ.length == 0) throw new Error("No items in snap queue.");
        return this.snapQ[this.snapIndex]
    }

    async enqueue(snapshot) {
        // don't queue old snapshots
        if (this.snapQ.length > 0 && snapshot.serial_id <= this.snapQ.at(-1).serial_id) return
        this.snapQ.push(snapshot)
        this.saveHistory()
        this.updateButtons()  
        await this.run()
    }

    async run() {
        if (this.isRunning) return
        this.isRunning = true
        while (!this.paused) {
            if (this.snapIndex >= this.snapQ.length - 1) break
            await this.next();
        }
        this.isRunning = false
    }

    async loadHistory() {
        console.log("loadHistory()")
        const _history = localStorage.getItem("history")
        const snapHistory = JSON.parse(_history)
        for (const snap of snapHistory) {
            this.snapQ.push(snap)
        }

        this._snapIndex = this.snapQ.length - 1        
        if (this.snapIndex >= 0) {
            await this.viewModel.update(this.snapshot)
        }
    }

    saveHistory() {
        localStorage.removeItem("history")
        const history_json = JSON.stringify(this.snapQ)
        localStorage.setItem("history", history_json)
    }        

    list() {
        for (let i = 0; i < this.snapQ.length; i++) {
            const snap = this.snapQ[i]
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
        await this.viewModel.update(this.snapshot, true)
    }

    async next() {
        if (this.snapIndex >= this.snapQ.length - 1) return
        this.snapIndex += 1
        console.log(`${this.snapIndex}: ${this.snapshot.serial_id} state ${this.snapshot.state}`)
        await this.viewModel.update(this.snapshot)
    }

    async runQueue() {
        while (this.snapIndex < this.snapQ.length - 1) {
            await this.next()
        }
    }

    async go(index) {
        if (index < 0) index = 0
        if (index > this.snapQ.length - 1) index = this.snapQ.length - 1
        this.snapIndex = index
        await this.viewModel.update(this.snapshot, true)        
    }    
}