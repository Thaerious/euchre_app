export class HandManager {
    constructor(containerId) {
        this.container = document.querySelector(`${containerId}`);

        if (!this.container) {
            console.error(`HandManager: Container with ID '${containerId}' not found.`);
            return;
        }
    }

    setTricks(userIndex, trickCount) {
        let i = 0;
        const tricksElement = this.container.querySelectorAll(`.tricks`);

        for (const trick of tricksElement.querySelectorAll(".trick")) {
            if (i++ < trickCount) trick.style.display = "block";
            else trick.style.display = "none";
        }
    }

    setCards(cards) {
        const cardContainer = this.container.querySelector(`.cards`);

        while (cardContainer.firstChild) {
            cardContainer.removeChild(cardContainer.firstChild);
        }

        for (const card of cards) {
            const img = document.createElement('img');
            img.src = `../static/images/cards/large/${card}.png`;
            img.classList.add("card")
            img.dataset.card = card
            cardContainer.appendChild(img)
        }
    }
}

export default new HandManager("#hand_0");