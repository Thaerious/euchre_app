import UpCardManager from "./Up_Card_Manager.js"
import HandManager from "./Hand_Manager.js"
import TokenManager from "./Token_Manager.js"
import ChatBubbleManager from "./Chat_Bubble_Manager.js"
import MessageManager from "./Message_Manager.js"
import PlayedCardsManager from "./Played_Cards_Manager.js"
import ButtonManager from "./Button_Manager.js"

Array.prototype.has = function (value) {
    return this.indexOf(value) >= 0
};

export default class ViewModel{
    constructor() {
        this.snapshot = null

        // Load components
        this.chatBubble = new ChatBubbleManager()
        this.message = new MessageManager()
        this.tokens = new TokenManager()
        this.played = new PlayedCardsManager()
        this.suitButtons = new ButtonManager("suit-button-container")
        this.actionButtons = new ButtonManager("action-button-container")
        this.hands = [new HandManager(0), new HandManager(1), new HandManager(2), new HandManager(3)]
        this.upcard = new UpCardManager()
        this.alert = document.querySelector("alert-dialog")

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

    get seat() {
        const seat = document.querySelector("#game-board").getAttribute("seat")
        return parseInt(seat)
    }

    get gameToken() {
        return document.querySelector("#game-board").getAttribute("game-token")
    }

    get exitButton() {
        return document.querySelector("#exit_button")
    }

    get rulesButton() {
        return document.querySelector("#rules_button")
    }
}