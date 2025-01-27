export class ChatBubbleManager {
    constructor(containerId) {
        this.container = document.querySelector(`${containerId}`)

        if (!this.container) {
            console.error(`HandManager: Element with ID '${containerId}' not found.`)
            return
        }
    }

    show(seat, text) {
        this.container.setAttribute("seat", seat)
        this.container.querySelector("div").innerText = text
        this.container.classList.remove("hidden")
    }

    hide(){
        this.container.classList.add("hidden")
    }
}

export default new ChatBubbleManager("#chat_bubble")