
export default class PlayedCardsManager {
    constructor(elementId = "#played") {
        this.container = document.querySelector(`${elementId}`);
        this.nextZ = 1;

        if (!this.container) {
            console.error(`PlayedCardsManager: Container with ID '${elementId}' not found.`);
            return;
        }
    }

    hideAll() {
        const cards = this.container.querySelectorAll(".card")
        for (const card of cards) {
            card.classList.add("hidden")
            card.style.zIndex = "0"
        }
        this.nextZ = 1
    }

    setCard(seat, card) {
        const cards = this.container.querySelectorAll(".card")
        cards[seat].src = `../static/images/cards/large/${card}.png`;
        cards[seat].classList.remove("hidden")
        cards[seat].style.zIndex = `${this.nextZ++}`
    }
}

