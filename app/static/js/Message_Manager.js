export default class MessageManager {
    constructor(containerId = "#message") {
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