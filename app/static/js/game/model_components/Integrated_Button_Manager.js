import playableSuits from "../playable_suits.js"

export default class IntegratedButtonManager {
    constructor(viewModel) {
        this.viewModel = viewModel
    }

    async setSnapshot(snapshot) {
        this.updateButtons(snapshot)

        if (snapshot.state == 6) {
            await this.pauseForContinue()
        }
    }

    pauseForContinue(message = "") {
        if (message !== "") this.viewModel.messageMgr.show(message);
        this.viewModel.actionButtons.showButtons(["continue"]);

        return new Promise((resolve) => {
            this.viewModel.once("continue", () => {
                this.viewModel.actionButtons.hideButtons()
                resolve();
            });
        });
    }

    updateButtons(snapshot) {
        if (snapshot.current_player != snapshot.for_player) {
            this.viewModel.actionButtons.hideButtons()
            this.viewModel.suitButtons.hideContainer()
            this.viewModel.messageMgr.hide()
            return
        }

        this.viewModel.suitButtons.clearSelected()

        switch (snapshot.state) {
            case 1:
                this.viewModel.actionButtons.showButtons("pass", "order", "alone")
                break
            case 2:
                this.viewModel.messageMgr.show("Swap a Card")
                this.viewModel.actionButtons.showButtons(["down"])
                this.viewModel.hands[0].enable()
                break
            case 3: {
                this.viewModel.actionButtons.showButtons("pass", "make", "alone")
                this.viewModel.actionButtons.disable("make")
                let card = snapshot.down_card
                let suit = card[card.length - 1]
                this.viewModel.suitButtons.disable(suit)
                this.viewModel.suitButtons.showContainer()

                this.viewModel.once("change-suit", () => {
                    this.viewModel.actionButtons.disable([])
                });

            } break
            case 4: {
                his.viewModel.actionButtons.showButtons("make", "alone")
                let card = snapshot.down_card
                let suit = card[card.length - 1]
                this.viewModel.suitButtons.disable(suit)
                this.viewModel.suitButtons.showContainer()
            } break
            case 5:
                this.viewModel.actionButtons.hideButtons()
                break
        }
    }
}