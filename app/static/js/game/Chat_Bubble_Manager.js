export default class ChatBubbleManager {
    constructor(elementID = "chat-bubble") {
        this.timeout = null
        this.element = document.getElementById(elementID)

        if (!this.element) {
            console.error(`HandManager: Element with ID '${elementID}' not found.`)
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
        this.element.setAttribute("seat", seat)
        this.element.querySelector("div").innerText = text
        this.element.classList.remove("is_hidden")
        this.element.classList.remove("fade-out")        
    }

    hide(){
        this.element.classList.add("fade-out")
    }
}