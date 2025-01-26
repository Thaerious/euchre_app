export class UpCardManager {
    constructor(elementId) {
        this.container = document.querySelector(`${elementId}`);
    
        if (!this.container) {
            console.error(`UpCardManager: Element with ID '${elementId}' not found.`);
            return;
        }        
    }

    show(card) {
        this.container.classList.remove("hidden");
        const img = document.querySelector("#upcard");
        img.src = `../static/images/cards/large/${card}.png`;    
    }
    
    back() {
        this.show()
        const img = document.querySelector("#upcard");
        img.src = `../static/images/cards/large/back.png`;    
    }
    
    hide() {
        this.container.classList.add("hidden");
    }    
}

export const upCard = new UpCardManager("#upcard");