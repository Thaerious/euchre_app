export default class ChatBubbleManager {
    constructor(containerId = "#chat_bubble") {
        this.container = document.querySelector(`${containerId}`)

        if (!this.container) {
            console.error(`HandManager: Element with ID '${containerId}' not found.`)
            return
        }
    }

    showFade(seat, text) {
        this.show(seat, text)
        setTimeout(() => {
            this.hide() 
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