import EventEmitter from "./modules/Event_Emitter.js";

export default class HandManager extends EventEmitter {
    constructor(containerId = "#hand_0") {
        super();
        this.container = document.querySelector(containerId);
        this.cards = []

        if (!this.container) {
            console.error(`HandManager: Container with ID '${containerId}' not found.`);
            return;
        }
    }

    enable() {
        const innerContainer = this.container.querySelector(".cards");
        innerContainer.classList.add("enabled")
    }

    disable() {
        const innerContainer = this.container.querySelector(".cards");
        innerContainer.classList.remove("enabled")
    }

    setTricks(trickCount) {
        let i = 0;
        const tricksElement = document.querySelector(`#hand_0 > .tricks`);

        for (const trick of tricksElement.querySelectorAll(".trick")) {
            if (i++ < trickCount) trick.style.display = "block";
            else trick.style.display = "none";
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

    clear() {
        const cardContainer = this.container.querySelector(`.cards`);
        this.cards = []

        while (cardContainer.firstChild) {
            cardContainer.removeChild(cardContainer.firstChild);
        }        
    }

    setCards(cards) {
        const cardContainer = this.container.querySelector(`.cards`);

        for (const card of cards) {
            if (this.cards.includes(card)) continue
            this.cards.push(card)

            const img = document.createElement('img');
            img.src = `../static/images/cards/large/${card}.png`;
            img.classList.add("card")
            img.dataset.card = card
            cardContainer.appendChild(img)

            img.addEventListener("click", () => {
                this.cards = this.cards.filter(c => c !== card);
                this.emit("selected", card)
            })               
        }
    }
}


