export class ChatBubbleManager {
    constructor(containerId) {
        this.container = document.querySelector(`${containerId}`)
        this.currentSeat = null

        if (!this.container) {
            console.error(`HandManager: Element with ID '${containerId}' not found.`)
            return
        }
    }

    show(seat, text) {
        if (this.currentSeat !== null) {
            this.container.classList.remove(`seat_${this.currentSeat}`)
        }
        
        this.currentSeat = seat
        this.container.classList.add(`seat_${this.currentSeat}`)
        this.container.classList.remove("hidden")
        this.container.querySelector("div").innerText = text
    }

    hide(){
        this.container.classList.add("hidden")
    }
}

export default new ChatBubbleManager("#chat_bubble")