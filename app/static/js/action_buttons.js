export class ActionButtonManager {
    constructor(containerId) {
        this.container = document.querySelector(`#${containerId}`);
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

    setButtons(buttonData) {
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }

        for (const data of buttonData) {
            const button = document.createElement('button');
            button.id = (`button_${data.name}`)
            button.classList.add("styled_button")
            button.classList.add("action_button")
            button.innerText = data.name
            data.action = data.action ?? data.name.toLowerCase()
            button.setAttribute("data-action", data.action);
            this.container.appendChild(button)

            if (data.disable) this.disable(data.name)

            button.addEventListener("click", () => {
                this.emit(button.getAttribute("data-action"))
            });
        }

        this.show()
    }

    disable(name) {
        this.container.querySelector(`#button_${name}`)?.classList.add("disabled")
    }

    enableAll() {
        const buttons = this.container.querySelectorAll("button")

        for (const button of buttons) {
            button.classList.remove("disabled")
        }        
    }

    enable(name) {
        this.container.querySelector(`#button_${name}`)?.classList.remove("disabled")
    }

    hide() {
        this.container.classList.add("hidden");
    }

    show() {
        this.container.classList.remove("hidden");
    }
}

export default new ActionButtonManager("action_container");