export default class MessageManager {
    constructor(elementID = "message") {
        this.container = document.getElementById(elementID);
    }

    show(text) {
        this.container.innerText = text
        this.container.classList.remove("is-hidden")
    }

    hide(){
        this.container.classList.add("is-hidden")
    }    
}