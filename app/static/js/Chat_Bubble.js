export default class ChatBubbleManager {
    constructor(containerId = "#chat_bubble") {
        this.timeout = null
        this.container = document.querySelector(`${containerId}`)

        if (!this.container) {
            console.error(`HandManager: Element with ID '${containerId}' not found.`)
            return
        }
    }

    showFade(seat, text) {
        if (this.timeout != null) {
            clearTimeout(this.timeout)
        }

        this.show(seat, text)
        this.timeout = setTimeout(() => {
            this.hide()
            this.timeout = null
        }, 2000);
    }

    show(seat, text) {
        this.container.setAttribute("seat", seat)
        this.container.querySelector("div").innerText = text
        this.container.classList.remove("hidden")
        this.container.classList.remove("fade-out")        
    }

    hide(){
        this.container.classList.add("fade-out")
    }
}