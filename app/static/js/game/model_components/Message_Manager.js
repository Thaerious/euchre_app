export default class MessageManager {
    constructor(elementID = "message") {
        this.container = document.getElementById(elementID);
    }

    show(text) {
        this.container.innerText = text
        this.container.classList.remove("is_hidden")
    }

    hide(){
        this.container.classList.add("is_hidden")
    }    
}