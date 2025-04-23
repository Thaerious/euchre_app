export default class MessageManager {
    constructor() {
        this.container = document.getElementById("message");
    }

    show(text) {
        this.container.innerText = text
        this.container.classList.remove("is_hidden")
    }

    hide(){
        this.container.classList.add("is_hidden")
    }    
}