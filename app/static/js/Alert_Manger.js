export default class AlertManager {
    constructor() {
        this.container = document.getElementById("alert");
        this.message = document.getElementById("alert-message");
        this.button = document.getElementById("alert-button");
    }

    show(text, cb = undefined) {
        this.message.innerText = text
        this.container.classList.remove("is-hidden")

        if (cb == undefined) {
            this.button.addEventListener("click", () => this.hide(), { once: true })
        } else {
            this.button.addEventListener("click", () => cb(), { once: true })
        }
    }

    hide(){
        this.container.classList.add("is-hidden")
    }    
}