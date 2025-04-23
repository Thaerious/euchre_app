import getSeat from "../getSeat.js";

export default class PlayedCardsManager {
    constructor() {
        this.nextZ = 1;
    }

    setSnapshot(snapshot) {
        this.clear()
        if ([5, 6].has(snapshot.state)) {
            const trick = this.getTrick(snapshot)
            trick.forEach((card, seat) => {
                this.setCard(seat, card)
            });
        }
    }

    /**
     * Returns the most recent trick as an object mapping each seat to its played card.
     */
    getTrick(snapshot) {
        const result = []        
        snapshot.order.forEach((pindex, i) => {
            const seat = getSeat(pindex, snapshot.for_player)
            result[seat] = snapshot.tricks.at(-1)[i]
        });
        return result
    }

    clear() {
        this.nextZ = 1;
        const cards = document.querySelectorAll(".played")

        for (const card of cards) {
            card.remove()
        }
    }

    setCard(seat, face) {
        const table = document.querySelector("#game-board")
        const card = document.createElement("div")
        card.classList.add("card")
        card.classList.add("played")
        card.setAttribute("face", face)
        card.setAttribute("seat", seat)
        card.style.zIndex = `${this.nextZ++}`
        table.appendChild(card)
    }
}

