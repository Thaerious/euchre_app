export class MessageManager {
    constructor(containerId) {
        this.container = document.querySelector(`${containerId}`);
}

    show(text) {
        this.container.innerText = text
        this.container.classList.remove("hidden")
    }

    hide(){
        this.container.classList.add("hidden")
    }    
}

export default new MessageManager("#message")