import getSeat from "../getSeat.js"

export default class ChatBubbleManager {
    constructor() {
        this.timeout = null
        this.element = document.getElementById("chat-bubble")

        if (!this.element) {
            console.error(`HandManager: Element with ID '${elementID}' not found.`)
            return
        }
    }

    setSnapshot(snapshot) {
        if (![1, 2, 3, 4, 5].has(snapshot.state)) return
        if (snapshot.last_action == "play") return
        if (snapshot.last_player == null) return
        this.bubbleMessage(snapshot)
    }

    bubbleMessage(snapshot) {
        if (snapshot.last_player != snapshot.for_player) {
            const seat = getSeat(snapshot.last_player, snapshot.for_player)
            this.showFade(seat, `${snapshot.last_action} ${snapshot.last_data ?? ""}`)
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