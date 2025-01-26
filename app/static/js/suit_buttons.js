export class SuitButtonManager {
    constructor(containerId) {
        this.container = document.querySelector(`#${containerId}`);
        const buttons = this.container.querySelectorAll("button")
    
        if (!this.container) {
            console.error(`SuitButtonManager: Container with ID '${containerId}' not found.`);
            return;
        }

        for (const button of buttons) {
            button.addEventListener("click", () => {
                this.clear()
                button.classList.add("selected")   
                this.emit("change", this.getSuit())
            })
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

    getSuit() {
        const buttons = this.container.querySelectorAll("button");
        for (const button of buttons) {
            if (button.classList.contains("selected")) {
                return button.innerText
            }            
        }
        return null
    }

    clear() {
        const buttons = this.container.querySelectorAll("button");
        buttons.forEach(button => button.classList.remove("selected"));
    }

    disable(suit) {
        const button = this.container.querySelector(`#suit_${suit}`);
        button.classList.add("disabled")
    }

    hide() {
        this.container.classList.add("hidden");
    }

    show() {
        this.container.classList.remove("hidden");
    }    
}

export const suitButtons = new SuitButtonManager("suit_container");