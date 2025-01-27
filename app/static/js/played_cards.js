

export class PlayedCardsManager {
    constructor(elementId) {
        this.container = document.querySelector(`${elementId}`);
    
        if (!this.container) {
            console.error(`PlayedCardsManager: Container with ID '${elementId}' not found.`);
            return;
        }
    }

    hideAll() {
        const cards = this.container.querySelectorAll(".card")
        for (const card of cards) {
            card.classList.add("hidden")
        }
    }

    setCard(seat, card) {
        const cards = this.container.querySelectorAll(".card")

        if (card == "") {
            cards[seat].classList.add("hidden")
        } else {
            cards[seat].src = `../static/images/cards/large/${card}.png`;
            cards[seat].classList.remove("hidden")
        }
    }
}

export default new PlayedCardsManager("#played");

