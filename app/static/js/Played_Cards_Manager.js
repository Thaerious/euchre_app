
export default class PlayedCardsManager {
    constructor() {
        this.nextZ = 1;
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

