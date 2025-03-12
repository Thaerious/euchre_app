import EventEmitter from "./modules/Event_Emitter.js";

export default class HandManager extends EventEmitter {
    constructor(seat) {
        super();
        this.seat = seat
    }

    get count() {
        const cards = document.querySelectorAll(`.hand[seat='${this.seat}']`);
        return cards.length
    }

    enable() {
        const cards = document.querySelectorAll(`.hand[seat='${this.seat}']`);
        for (const card of cards) {
           card.classList.add("enabled")
        }
    }

    disable() {
        const cards = document.querySelectorAll(`.hand[seat='${this.seat}']`);
        for (const card of cards) {
           card.classList.remove("enabled")
        }
    }

    clear() {
        const table = document.querySelector("#game-board")
        const cards = document.querySelectorAll(`.hand[seat='${this.seat}']`);

        for (const card of cards) {
            table.removeChild(card);
        }        
    }

    fill(face, count) {
        this.clear()
        for (let i = 0; i < count; i++) {
            this.addCard(face)
        }
    }

    addCards(cards) {
        for (const card of cards) {
            this.addCard(card)
        }
    }

    addCard(face) {
        let cardIndex = this.count
        const table = document.querySelector("#game-board")
        const card = document.createElement("div")
        card.classList.add("card")
        card.classList.add("hand")
        card.setAttribute("seat", this.seat)
        card.setAttribute("index", cardIndex)
        card.setAttribute("face", face)
        card.style.setProperty("--card_index", cardIndex)
        table.appendChild(card)
        
        this.calcOffset()

        card.addEventListener("click", () => {
            this.emit("selected", card.getAttribute("face"))
        })   
    }

    calcOffset() {
        let n = this.count
        let offset = -1 - ((n - 1) * 0.5)
        document.documentElement.style.setProperty(`--hand_${this.seat}_offset`, `${offset}`);
    }

    reIndex() {
        let cards = document.querySelectorAll(`.hand[seat='${this.seat}']`);
        let i = 0
        for (let card of cards) {
            card.style.setProperty("--card_index", i++)
        }
    }

    getCard(face = null) {
        if (face !== null) {
            const q = `.hand[seat='${this.seat}'][face='${face}']`
            return document.querySelector(q);
        } else {
            const q = `.hand[seat='${this.seat}']`
            return document.querySelector(q);
        }
    }

    setPlayed(card) {
        card.classList.remove("hand")
        card.classList.add("played")
        this.reIndex()
        this.calcOffset()
    }

    /**
     * @param {number} count
     */
    set tricks(count) {        
        const tricksElement = document.querySelector(`.tricks[seat='${this.seat}']`);
        tricksElement.setAttribute("value", count)
    }
}


