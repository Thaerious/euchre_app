import UpCardManager from "./model_components/Up_Card_Manager.js"
import HandManager from "./model_components/Hand_Manager.js"
import TokenManager from "./model_components/Token_Manager.js"
import ChatBubbleManager from "./model_components/Chat_Bubble_Manager.js"
import MessageManager from "./model_components/Message_Manager.js"
import PlayedCardsManager from "./model_components/Played_Cards_Manager.js"
import ButtonManager from "./model_components/Button_Manager.js"
import EventEmitter from "../modules/Event_Emitter.js"
import ScoreboardManager from "./model_components/Scoreboard_Manager.js"
import ScoreManager from "./model_components/Score_Manager.js"
import NameManager from "./model_components/Name_Manager.js"
import IntegratedButtonManager from "./model_components/Integrated_Button_Manager.js"

Array.prototype.has = function (value) {
    return this.indexOf(value) >= 0
};

class Hands extends Array {
    constructor(eventSource, messageMgr) {
        super()
        this[0] = new HandManager(0, messageMgr, eventSource)
        this[1] = new HandManager(1, null, null)
        this[2] = new HandManager(2, null, null)
        this[3] = new HandManager(3, null, null)        
    }

    setSnapshot(snapshot) {
        for (const hand of this) {
            hand.setSnapshot(snapshot)
        }
    }
}

export default class ViewModel extends EventEmitter{
    constructor() {
        super()
        this.snapshot = null

        // Load components
        this.messageMgr = new MessageManager()
        this.chatBubble = new ChatBubbleManager()
        this.tokens = new TokenManager()
        this.played = new PlayedCardsManager()
        this.suitButtons = new ButtonManager("suit-button-container", this, {dataFieldID: "suit"})
        this.actionButtons = new ButtonManager("action-button-container", this)
        this.scoreboardManager = new ScoreboardManager(this)
        this.hands = new Hands(this, this.messageMgr)
        this.upcard = new UpCardManager()
        this.alertDialog = document.querySelector("alert-dialog")
        this.scoreManager = new ScoreManager()
        this.nameManager = new NameManager()
        this.integratedButtonManager = new IntegratedButtonManager(this)
    }

    /**
     * For each property on this object, check if it has a 'snapshot' setter.
     * If so, set its 'snapshot' to the provided value.
     */
    async setSnapshot(snapshot) {
        this.messageMgr.hide()

        for (const prop of Object.getOwnPropertyNames(this)) {   
            const obj = this[prop]
            if (obj && typeof obj["setSnapshot"] === "function") {
                await obj["setSnapshot"](snapshot)
            }
        }
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