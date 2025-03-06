import EventEmitter from "./modules/Event_Emitter.js";

export default class HandManager extends EventEmitter {
    constructor(handIndex) {
        super();
        this.handIndex = handIndex
    }

    get count() {
        const cards = document.querySelectorAll(`.card[hand='${this.handIndex}']`);
        return cards.length
    }

    enable() {
        const cards = document.querySelectorAll(`.card[hand='${this.handIndex}']`);
        for (const card of cards) {
           card.classList.add("enabled")
        }
    }

    disable() {
        const cards = document.querySelectorAll(`.card[hand='${this.handIndex}']`);
        for (const card of cards) {
           card.classList.remove("enabled")
        }
    }

    clear() {
        const table = document.querySelector("#table")
        const cards = document.querySelectorAll(`.card[hand='${this.handIndex}']`);

        for (const card of cards) {
            table.removeChild(card);
        }        
    }

    fill(face, count) {
        this.clear()
        for (let i = 0; i < count; i++) {
            this.setCard(face)
        }
    }

    setCards(cards) {
        for (const card of cards) {
            this.setCard(card)
        }
    }

    setCard(face) {
        let cardIndex = this.count
        const table = document.querySelector("#table")
        const card = document.createElement("div")
        card.classList.add("card")
        card.setAttribute("hand", this.handIndex)        
        card.setAttribute("index", cardIndex)
        card.setAttribute("face", face)
        card.style.setProperty("--card_index", cardIndex)
        table.appendChild(card)

        let n = this.count
        let offset = -1 - ((n - 1) * 0.5)
        document.documentElement.style.setProperty('--hand_0_offset', `${offset}`);

        card.addEventListener("click", () => {
            this.emit("selected", card)
        })   
    }

    set tricks(count) {
        let i = 0;
        const tricksElement = document.querySelector(`#tricks_${this.handIndex}`);

        for (const trick of tricksElement.querySelectorAll(".trick")) {
            if (i++ < count) trick.style.display = "block";
            else trick.style.display = "none";
        }
    }
}


