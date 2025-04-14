import ViewUpdate from "./View_Update.js"

export default class ViewController {
    // This class is the glue between the ViewModel and the this.gameIO
    // It listens for events emitted from either the ViewModel or this.gameIO and updates
    // the other objects accordingly.
    // It will also change the state of the ViewModel based on ViewModel events.
    constructor(viewModel, viewHistory, gameIO) {
        this.viewModel = viewModel
        this.viewHistory = viewHistory
        this.gameIO = gameIO
        this.viewUpdate = new ViewUpdate(viewModel)
        this.addListeners()
    }

    addListeners() {
        this.gameIO.on("exception", async ex => {
            this.viewModel.alert(ex.message)
        });

        // Events for view history
        this.viewHistory.on("load", async snapshot => {
            console.log(`load ${snapshot.hash.substring(0, 8)}: state ${snapshot.state}`)
            await this.viewUpdate.load(snapshot)
        })

        // Events for view history
        this.viewHistory.on("update", async snapshot => {
            console.log(`update ${snapshot.hash.substring(0, 8)}: state ${snapshot.state}`)
            await this.viewUpdate.update(snapshot)
        })

        // Websocket event for server side errors.
        this.gameIO.on("error", async (error) => {
            console.log(`Caught EuchreException: ${error.message}`);
            await this.viewUpdate.update(this.snapshot, true)
            this.viewModel.message.show(error.message);
        });

        // Changing a suit button will enable action buttons
        this.viewModel.on("change-suit", () => {
            this.viewModel.enableAllActions()
        });
        
        // Event listeners
        this.viewModel.on("pass", () => {
            this.gameIO.doAction("pass", null)
        });

        this.viewModel.on("make", () => {
            this.gameIO.doAction("make", this.viewModel.suitButtons.getSuit())
        });

        this.viewModel.on("alone", () => {
            this.gameIO.doAction("alone", this.viewModel.suitButtons.getSuit())
        });

        this.viewModel.on("order", () => {
            this.gameIO.doAction("order", null)
        });

        this.viewModel.on("continue", () => {
            this.next()
        });

        // Animation when a player plays a card
        this.viewModel.on("card-selected", (face) => {
            const snapshot = this.viewUpdate.snapshot
            if (snapshot.current_player != snapshot.for_player) return;
            this.viewModel.playCardAnimation(0, face)
        });

        // Hand card listeners
        this.viewModel.on("card-selected", (card) => {
            const snapshot = this.viewUpdate.snapshot

            switch (snapshot.state) {
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
}