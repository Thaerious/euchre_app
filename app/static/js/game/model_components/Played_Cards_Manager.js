import getSeat from "../getSeat.js";

export default class PlayedCardsManager {
    constructor() {
        this.nextZ = 1;
    }

    set snapshot(snapshot) {
        // show played cards
        this.clear()
        if ([5, 6].has(snapshot.state)) {
            let current_trick = snapshot.tricks.at(-1)

            let pindex = snapshot.lead
            let seat = getSeat(pindex, snapshot.for_player)

            for (let card of current_trick) {
                this.setCard(seat, card)
                if (++seat > 3) seat = 0
            }
        }
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

