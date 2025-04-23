export default class ViewController {
    // This class is the glue between the ViewModel and the this.gameIO
    // It listens for events emitted from either the ViewModel or this.gameIO and updates
    // the other objects accordingly.
    // It will also change the state of the ViewModel based on ViewModel events.
    constructor(viewModel, viewHistory,  gameIO) {
        this.viewModel = viewModel
        this.viewHistory = viewHistory
        this.gameIO = gameIO
        this.addListeners()
    }

    addListeners() {
        this.gameIO.on("exception", async ex => {
            this.viewModel.alertDialog.show(ex.message)
        });

        // Events for view history
        this.viewHistory.on("load", async snapshot => {
            console.log(`load ${snapshot.hash.substring(0, 8)}: state ${snapshot.state}`)
            await this.viewModel.setSnapshot(snapshot);
        })

        // Websocket event for server side errors.
        this.gameIO.on("error", async (error) => {
            console.log(`Caught EuchreException: ${error.message}`);
            await this.viewUpdate.update(this.snapshot, true)
            this.viewModel.message.show(error.message);
        });

        // Changing a suit button will enable action buttons
        this.viewModel.on("change-suit", () => {
            this.viewModel.actionButtons.enableAll()
        });
        
        // Event listeners
        this.viewModel.on("pass", () => {
            this.gameIO.doAction("pass", null)
        });

        this.viewModel.on("make", () => {
            const selected = this.viewModel.suitButtons.selected
            if (selected.length == 0) throw Exception("No suit selected")
            const suit = selected[0].dataset.suit

            this.gameIO.doAction("make", suit)
        });

        this.viewModel.on("alone", () => {
            const selected = this.viewModel.suitButtons.selected
            if (selected.length == 0) throw Exception("No suit selected")
            const suit = selected[0].dataset.suit

            this.gameIO.doAction("alone", suit)
        });

        this.viewModel.on("order", () => {
            this.gameIO.doAction("order", null)
        });       

        // Animation when a player plays a card
        this.viewModel.on("card-selected", (face) => {
            const snapshot = this.viewHistory.snapshot
            if (snapshot.current_player != snapshot.for_player) return;
            this.viewModel.playCardAnimation(0, face)
        });

        // Hand card listeners
        this.viewModel.on("card-selected", (card) => {
            const snapshot = this.viewHistory.snapshot

            switch (snapshot.state) {
                case 2:
                    this.gameIO.doAction("up", card)
                    break;
                case 5:
                    this.gameIO.doAction("play", card)
                    break;
            }
        });

        this.viewModel.on("exit", this.doExit);
        this.viewModel.exitButton.addEventListener("click", this.doExit);           
        this.viewModel.rulesButton.addEventListener("click", () => { });
    }   

    async doExit() {
        const response = await fetch("/exit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.redirected) {
            window.location.href = response.url;
        }       
    }
}