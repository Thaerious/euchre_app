export default class View_Update{
    constructor(viewModel) {
        this.viewModel = viewModel
    }

    async load(snapshot) {
        this.snapshot = snapshot
        console.log(`ViewUpdate.load ${snapshot.hash.substring(0, 8)}:Snapshot`)
        await this.loadView()
    }

    // Main entry point for view controller
    async update(snapshot, doLoad = false) {
        if (snapshot.state == 1 && snapshot.last_action == "continue") {
            this.snapshot = snapshot
            await this.loadView()
        }

        this.snapshot = snapshot
        await this.updateView()
    } 

    async loadView() {
        this.setNames()
        this.viewModel.message.hide()
        this.viewModel.tokens.hide()
        this.viewModel.played.clear()
        this.viewModel.suitButtons.hide()
        this.viewModel.actionButtons.hide()
        this.viewModel.hands[0].clear()
        this.viewModel.upcard.show("back")      
        this.updateTokens()

        if (this.snapshot.state == 7) return;

        this.setCards()
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

    async updateView() {
        this.viewModel.message.hide()
        this.viewModel.suitButtons.hide()
        this.viewModel.actionButtons.hide()
        await this.clearHandIf5()
        await this.displayUpcard()
        await this.playCardIf()
        this.updateTokens()
        this.updateScore()
        this.updateTricks()
        this.bubbleIf()
        await this.pauseOn6()
        this.updateActionButtons()

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

    setCards() {
        this.viewModel.hands[0].addCards(this.snapshot.hand) // set the hand cards
        
        // set opponents cards in hand
        for (let p = 0; p < 4; p++) {
            if (p == this.snapshot.for_player) continue
            let seat = this.getSeat(p, this.snapshot.for_player)
            this.viewModel.hands[seat].fill("back", this.snapshot.players[p].hand_size)
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

    async pauseForContinue(message = "") {
        this.paused = true
        if (message !== "") this.viewModel.showMessage(message)

        this.viewModel.showButtons(["continue"])

        await new Promise(resolve => {
            this.viewModel.once("continue", resolve);
        });
    }

    updateActionButtons() {
        if (this.snapshot.current_player != this.snapshot.for_player) return
        setTimeout(() => this.doUpdateActionButtons(), 1000)
    }

    doUpdateActionButtons() {
        this.viewModel.hideButtons()

        switch (this.snapshot.state) {
            case 1:
                this.viewModel.actionButtons.showButtons(["pass", "order", "alone"])
                break
            case 2:
                this.viewModel.message.show("Swap a Card")
                this.viewModel.actionButtons.showButtons(["down"])
                this.viewModel.hands[0].enable()
                break
            case 3: {
                this.viewModel.actionButtons.showButtons(["pass", "make", "alone"])
                let card = this.snapshot.down_card
                let suit = card[card.length - 1]
                this.viewModel.suitButtons.disable(suit)
                this.viewModel.suitButtons.show()
            } break
            case 4: {
                his.viewModel.actionButtons.showButtons(["make", "alone"])
                let card = this.snapshot.down_card
                let suit = card[card.length - 1]
                this.viewModel.suitButtons.disable(suit)
                this.viewModel.suitButtons.show()
            } break
            case 5:
                this.viewModel.message.show("Play a Card")
                this.viewModel.hands[0].enable()
                this.viewModel.actionButtons.hide()
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

    bubbleIf() {
        if (![1, 2, 3, 4, 5].has(this.snapshot.state)) return
        if (this.snapshot.last_action == "play") return
        if (this.snapshot.last_player == null) return
        this.bubbleMessage()
    }

    bubbleMessage() {
        if (this.snapshot.last_player != this.snapshot.for_player) {
            const seat = this.getSeat(this.snapshot.last_player, this.snapshot.for_player)      
            this.viewModel.chatBubble.showFade(seat, `${this.snapshot.last_action} ${this.snapshot.last_data ?? ""}`)
        }        
    }    
}