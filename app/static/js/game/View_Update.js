import playable_suits from "./playable_suits.js"

export default class View_Update {
    constructor(viewModel) {
        this.viewModel = viewModel
    }

    set snapshot(snapshot) {
        this.setNames()
        this.updateActionButtons()
    }

    async loadView() {


        if (this.snapshot.state == 7) return;

        this.updateScore()
        this.updateTricks()
        await this.displayUpcard()
        this.setPlayedCards()
        this.updateActionButtons()
        await this.pauseOn6()
        this.bubbleIf()

        if (this.snapshot.state == 0) {
            this.alert.show("Game Over", () => {
                window.location = "/lobby"
            })
        }
    }

    async playCardIf() {
        if (![5, 6].has(this.snapshot.state)) return
        if (this.snapshot.last_action != "play") return
        if (this.snapshot.last_player == this.snapshot.for_player) return
        this.playCard()
    }

    async playCard() {
        let seat = this.getSeat(this.snapshot.last_player, this.snapshot.for_player)
        let card = null

        if (seat == 0) {
            card = this.viewModel.hands[seat].getCard(this.snapshot.last_data)
        } else {
            card = this.viewModel.hands[seat].getCard()
            card.setAttribute("face", this.snapshot.last_data)
        }

        this.viewModel.hands[seat].setPlayed(card)
    }

    setPlayedCards() {
        // show played cards
        this.viewModel.played.clear()
        if ([5, 6].has(this.snapshot.state)) {
            let current_trick = this.snapshot.tricks.at(-1)

            let pindex = this.snapshot.lead
            let seat = this.getSeat(pindex, this.snapshot.for_player)

            for (let card of current_trick) {
                this.viewModel.played.setCard(seat, card)
                if (++seat > 3) seat = 0
            }
        }
    }

    setNames() {
        // Set names in player icons
        for (const player of this.snapshot.players) {
            const seat = this.getSeat(player.index, this.snapshot.for_player)
            this.setName(seat, player.name)
        }
    }

    updateTokens() {
        if (this.snapshot.state > 0) {
            const dealerSeat = this.getSeat(this.snapshot.dealer, this.snapshot.for_player)
            this.viewModel.tokens.showDealer(dealerSeat)
        }

        if ([2, 4, 5, 6].has(this.snapshot.state)) {
            const makerSeat = this.getSeat(this.snapshot.maker, this.snapshot.for_player)
            this.viewModel.tokens.showMaker(makerSeat, this.snapshot.trump)
        }
    }

    updateTricks() {
        for (const player of this.snapshot.players) {
            const seat = this.getSeat(player.index, this.snapshot.for_player)
            this.viewModel.hands[seat].tricks = player.tricks
        }
    }

    updateScore() {
        // set score cards
        if ([0, 2].has(this.snapshot.for_player)) {
            this.setScore(0, this.snapshot.score[0])
            this.setScore(1, this.snapshot.score[1])
        } else {
            this.setScore(1, this.snapshot.score[0])
            this.setScore(0, this.snapshot.score[1])
        }
    }

    async clearHandIf5() {
        if (this.snapshot.state != 5) return
        if (this.snapshot.last_action != "continue") return
        this.viewModel.played.clear();
    }

    async pauseOn6() {
        if (this.snapshot.state != 6) return
        await this.pauseForContinue()
    }

    async displayUpcard() {
        // display upcard
        if ([1, 2, 3, 4].has(this.snapshot.state)) {
            if (this.snapshot.up_card !== null) {
                this.viewModel.upcard.show(this.snapshot.up_card)
            } else {
                this.viewModel.upcard.show("back")
            }
        } else {
            this.viewModel.upcard.hide()
        }
    }

    pauseForContinue(message = "") {
        if (message !== "") this.viewModel.message.show(message);
        this.viewModel.actionButtons.showButtons(["continue"]);
    
        return new Promise((resolve) => {
            this.viewModel.once("continue", () => {
                this.viewModel.actionButtons.hideButtons()
                console.log("Resolve in view update")
                resolve(); 
            });
        });
    }

    updateActionButtons() {
        if (this.snapshot.current_player != this.snapshot.for_player) {
            this.viewModel.actionButtons.hideButtons()
            this.viewModel.suitButtons.hideContainer()
            this.viewModel.message.hide()
            return
        }

        this.viewModel.suitButtons.clearSelected()

        switch (this.snapshot.state) {
            case 1:
                this.viewModel.actionButtons.showButtons("pass", "order", "alone")
                break
            case 2:
                this.viewModel.message.show("Swap a Card")
                this.viewModel.actionButtons.showButtons(["down"])
                this.viewModel.hands[0].enable()
                break
            case 3: {
                this.viewModel.actionButtons.showButtons("pass", "make", "alone")
                this.viewModel.actionButtons.disable("make")
                let card = this.snapshot.down_card
                let suit = card[card.length - 1]
                this.viewModel.suitButtons.disable(suit)
                this.viewModel.suitButtons.showContainer()

                this.viewModel.once("change-suit", () => {
                    this.viewModel.actionButtons.disable([])
                });

            } break
            case 4: {
                his.viewModel.actionButtons.showButtons("make", "alone")
                let card = this.snapshot.down_card
                let suit = card[card.length - 1]
                this.viewModel.suitButtons.disable(suit)
                this.viewModel.suitButtons.showContainer()
            } break
            case 5:
                this.viewModel.message.show("Play a Card")    
                const suits = playable_suits(this.snapshot)
                this.viewModel.hands[0].enable(suits)
                this.viewModel.actionButtons.hideButtons()
                break
        }
    }

    setScore(team, value) {
        if (value < 5) {
            document.querySelector(`#score_${team} .top`).setAttribute("face", "back")
        }
        else if (team == 0) {
            document.querySelector(`#score_${team} .top`).setAttribute("face", "5♥")
        }
        else if (team == 1) {
            document.querySelector(`#score_${team} .top`).setAttribute("face", "5♠")
        }

        document.querySelector(`#score_${team}`).setAttribute("score", value)
    }

    setName(seat, text) {
        const ele = document.querySelector(`.player-icon[seat='${seat}']`)
        ele.innerText = text
    }

    // Translate a player index to a seat index
    getSeat(pindex, forPlayer) {
        return (pindex + 4 - forPlayer) % 4
    }

    // Translate a seat index to a player index
    getIndex(seat, forPlayer) {
        return (seat + forPlayer) % 4
    }
}