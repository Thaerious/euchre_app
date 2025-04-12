import UpCardManager from "./Up_Card_Manager.js"
import HandManager from "./Hand_Manager.js"
import TokenManager from "./Token_Manager.js"
import ChatBubbleManager from "./Chat_Bubble_Manager.js"
import MessageManager from "./Message_Manager.js"
import PlayedCardsManager from "./Played_Cards_Manager.js"
import ButtonManager from "./Button_Manager.js"
import EventEmitter from "../modules/Event_Emitter.js"

Array.prototype.has = function (value) {
    return this.indexOf(value) >= 0
};

export default class ViewModel extends EventEmitter{
    constructor() {
        super()
        this.snapshot = null

        // Load components
        this.chatBubble = new ChatBubbleManager()
        this.message = new MessageManager()
        this.tokens = new TokenManager()
        this.played = new PlayedCardsManager()
        this.suitButtons = new ButtonManager("suit-button-container", this)
        this.actionButtons = new ButtonManager("action-button-container", this)
        this.hands = [
            new HandManager(0, this),
            new HandManager(1, null),
            new HandManager(2, null),
            new HandManager(3, null)
        ]
        this.upcard = new UpCardManager()
        this.alertDialog = document.querySelector("alert-dialog")
    }
    
    alert(message) {
        this.alertDialog.show(message)
    }

    playCardAnimation(hand, face, swap) {
        const card = this.hands[0].getCard(face)
        
        if (swap) {
            const handCard = this.viewModel.hands[hand].getCard(face)
            handCard.setAttribute("face", this.viewModel.upcard.face)
            this.viewModel.upcard.face = "back"
        } else {
            this.hands[0].setPlayed(card) 
        }
    }

    enableAllActions() {
        this.actionButtons.disable([])
    }

    showMessage(message) {
        if (message !== "") this.message.show(message)        
    }
    
    showButtons(buttons) {
        this.actionButtons.showButtons(buttons)        
    }

    hideButtons() {
        this.message.hide()
        this.actionButtons.hide()
        this.suitButtons.hide()       
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