export default class UpCardManager {
    constructor(elementID = "upcard") {
        this.card = document.getElementById(elementID)
    }

    show(face) {
        this.card.setAttribute("face", face)    
        this.card.classList.remove("is_hidden");
    }
    
    hide() {
        this.card.classList.add("is_hidden");
    }    
    
    get face() {
        return this.card.getAttribute("face")
    }

    set face(value) {
        this.card.setAttribute("face", value)
    }
}

