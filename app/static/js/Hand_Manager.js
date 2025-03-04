export default class HandManager {
    constructor(containerId = "#hand_0") {
        this.container = document.querySelector(containerId);

        if (!this.container) {
            console.error(`HandManager: Container with ID '${containerId}' not found.`);
            return;
        }
        this.events = {};
    }

    on(event, listener) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
    }

    emit(event, ...args) {
        if (this.events[event]) {
            this.events[event].forEach(listener => listener(...args));
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

            img.addEventListener("click", () => {
                this.emit("selected", card)
            })               
        }
    }
}


