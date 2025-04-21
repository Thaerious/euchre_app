import { getPindex } from "../getSeat.js"
import playable_suits from "../playable_suits.js"

export default class HandManager {
    constructor(seat, eventSource) {
        this.seat = seat
        this.eventSource = eventSource
    }

    set snapshot(snapshot) {    
        if (this.seat === 0) {
            this.clear()
            this.addCards(snapshot.hand)

            if (snapshot.state == 2) {
                this.enable()
            }
            else if (snapshot.state == 5) {
                const suits = playable_suits(snapshot)
                this.enable(suits)            
            }
        }
        else {
            const player_index = getPindex(this.seat, snapshot.for_player)
            this.fill("back", snapshot.players[player_index].hand_size)
        }
    }

    get count() {
        const cards = document.querySelectorAll(`.hand[seat='${this.seat}']`);
        return cards.length
    }

    enable(suits = ["♠", "♥", "♦", "♣"]) {
        const cards = document.querySelectorAll(`.hand[seat='${this.seat}']`);

        for (const card of cards) {
            const suit = card.getAttribute("face").at(-1)
            if (suits.indexOf(suit) != -1) {
                card.classList.add("enabled")
            }
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

        if (this.eventSource !== null) {
            card.addEventListener("click", () => {
                this.eventSource.emit("card-selected", card.getAttribute("face"))
            })
        }
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


