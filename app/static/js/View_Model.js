import UpCardManager from "./Up_Card_Manager.js"
import HandManager from "./Hand_Manager.js"
import SuitButtonManager from "./Suit_Button_Manager.js"
import TokenManager from "./Token_Manager.js"
import ChatBubbleManager from "./Chat_Bubble_Manager.js"
import MessageManager from "./Message_Manager.js"
import PlayedCardsManager from "./Played_Cards_Manager.js"
import ActionButtonManager from "./Action_Button_Manager.js"

Array.prototype.has = function (value) {
    return this.indexOf(value) >= 0
};

export default class ViewModel {
    constructor() {
        this.snapshot = null

        this.chatBubble = new ChatBubbleManager()
        this.message = new MessageManager()
        this.tokens = new TokenManager()
        this.played = new PlayedCardsManager()
        this.suitButtons = new SuitButtonManager()
        this.actionButtons = new ActionButtonManager()
        this.hands = [new HandManager(0), new HandManager(1), new HandManager(2), new HandManager(3)]
        this.upcard = new UpCardManager()

        this.suitButtons.on("change", () => {
            this.actionButtons.enableAll()
        });

        // Animation when a player plays a card
        this.hands[0].on("selected", (face) => {
            if (this.snapshot.current_player != this.snapshot.for_player) return;
            const card = this.hands[0].getCard(face)

            switch (this.snapshot.state) {
                case 2:
                    this.swapUpCard(face)
                    break                
                case 5:
                    this.hands[0].setPlayed(card)            
                    break                
            }            
        });
    }

    // Main entry point for view controller
    async update(snapshot, doLoad = false) {
        if (snapshot.state == 1 && snapshot.last_action == "continue") {
            this.snapshot = snapshot
            await this.loadView()
        }

        if (this.snapshot == null || doLoad) {
            this.snapshot = snapshot
            await this.loadView()
        }
        else {
            this.snapshot = snapshot
            await this.updateView()
        }

        // if (this.snapshot.last_player == this.snapshot.for_player) return
        // if (this.snapshot.last_action == "continue") return
        return new Promise(resolve => setTimeout(resolve, 1000));
    } 

    async updateView() {
        this.message.hide()
        this.suitButtons.hide()
        this.actionButtons.hide()
        await this.clearHandIf5()
        await this.displayUpcard()
        await this.playCardIf()
        this.updateTokens()
        this.updateScore()
        this.updateTricks()
        this.bubbleIf()    
        await this.pauseOn6()
        this.updateViewForPlayer()
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
            card = this.hands[seat].getCard(this.snapshot.last_data)        
        } else {
            card = this.hands[seat].getCard()        
            card.setAttribute("face", this.snapshot.last_data)            
        }
        
        this.hands[seat].setPlayed(card)
    }

    async loadView() {
        this.setNames()
        this.message.hide()
        this.tokens.hide()
        this.played.clear()
        this.suitButtons.hide()
        this.actionButtons.hide()
        this.hands[0].clear()
        this.upcard.show("back")      
        this.updateTokens()

        if (this.snapshot.state == 7) return;

        this.setCards()
        this.updateScore()
        this.updateTricks()
        await this.displayUpcard()
        this.setPlayedCards()
        await this.updateViewForPlayer()
        await this.pauseOn6()
        this.bubbleIf()
    }

    setPlayedCards() {
        // show played cards
        this.played.clear()
        if ([5, 6].has(this.snapshot.state)) {
            let current_trick = this.snapshot.tricks.at(-1)
            
            let pindex = this.snapshot.lead
            let seat = this.getSeat(pindex, this.snapshot.for_player)

            for (let card of current_trick) {
                this.played.setCard(seat, card)
                if (++seat > 3) seat = 0
            }
        }        
    }

    setCards() {
        this.hands[0].addCards(this.snapshot.hand) // set the hand cards
        
        // set opponents cards in hand
        for (let p = 1; p < 4; p++) {
            let seat = this.getSeat(p, this.snapshot.for_player)
            this.hands[seat].fill("back", this.snapshot.players[p].hand_size)
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
            this.tokens.showDealer(dealerSeat)
        }

        if ([2, 4, 5, 6].has(this.snapshot.state)) {
            const makerSeat = this.getSeat(this.snapshot.maker, this.snapshot.for_player)
            this.tokens.showMaker(makerSeat, this.snapshot.trump)
        }        
    }

    updateTricks() {
        for (const player of this.snapshot.players) {
            const seat = this.getSeat(player.index, this.snapshot.for_player)
            this.hands[seat].tricks = player.tricks
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
        this.played.clear();
    }

    async pauseOn6() {
        if (this.snapshot.state != 6) return
        await this.pauseForContinue()
    }    

    async displayUpcard() {
        // display upcard
        if ([1, 2, 3, 4].has(this.snapshot.state)) {
            if (this.snapshot.up_card !== null) {
                this.upcard.show(this.snapshot.up_card)
            } else {
                this.upcard.show("back")
            }
        } else {
            this.upcard.hide()
        }        
    }

    async pauseForContinue(message = "") {
        this.paused = true
        if (message !== "") this.message.show(message)

        this.actionButtons.setButtons([
            { "name": "Continue" }
        ])

        await new Promise(resolve => {
            this.actionButtons.once("continue", resolve);
        });
    }

    updateViewForPlayer() {
        if (this.snapshot.current_player != this.snapshot.for_player) return
        setTimeout(() => this.doUpdateViewForPlayer(), 1000)
    }

    doUpdateViewForPlayer() {
        this.message.hide()
        this.actionButtons.hide()
        this.suitButtons.hide()       

        switch (this.snapshot.state) {
            case 1:
                this.actionButtons.setButtons([
                    { "name": "Pass" },
                    { "name": "Order" },
                    { "name": "Alone" },
                ])
                break
            case 2:
                this.message.show("Choose a Card to Swap")
                this.actionButtons.setButtons([
                    { "name": "Down" }
                ])
                this.hands[0].enable()
                break
            case 3: {
                this.actionButtons.setButtons([
                    { "name": "Pass" },
                    { "name": "Make", "disable": true },
                    { "name": "Alone", "disable": true },
                ])
                let card = this.snapshot.down_card
                let suit = card[card.length - 1]
                this.suitButtons.disable(suit)
                this.suitButtons.show()
            } break
            case 4: {
                this.actionButtons.setButtons([
                    { "name": "Make", "disable": true },
                    { "name": "Alone", "disable": true },
                ])
                let card = this.snapshot.down_card
                let suit = card[card.length - 1]
                this.suitButtons.disable(suit)
                this.suitButtons.show()
            } break
            case 5:
                this.message.show("Play a Card")
                this.hands[0].enable()
                this.actionButtons.hide()
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
            this.chatBubble.showFade(seat, `${this.snapshot.last_action} ${this.snapshot.last_data ?? ""}`)
        }        
    }    

    swapUpCard(face) {
        const handCard = this.hands[0].getCard(face)
        handCard.setAttribute("face", this.upcard.face)
        this.upcard.face = "back"
    }
}