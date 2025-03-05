
export default class PlayedCardsManager {
    constructor(elementId = "#played") {
        this.container = document.querySelector(`${elementId}`);
        this.nextZ = 1;

        if (!this.container) {
            console.error(`PlayedCardsManager: Container with ID '${elementId}' not found.`);
            return;
        }
    }

    hide() {
        const cards = this.container.querySelectorAll(".card")
        for (const card of cards) {
            card.classList.add("hidden")
            card.style.zIndex = "0"
        }
        this.nextZ = 1
    }

    setCard(seat, card) {
        const cards = this.container.querySelectorAll(".card")
        cards[seat].setAttribute("face", card)        
        cards[seat].style.zIndex = `${this.nextZ++}`
        cards[seat].classList.remove("hidden")
    }
}

