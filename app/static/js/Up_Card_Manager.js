export default class UpCardManager {
    show(face) {
        this.card = document.querySelector("#upcard")
        this.card.setAttribute("face", face)    
        this.card.classList.remove("hidden");
    }
    
    hide() {
        this.card.classList.add("hidden");
    }    
}

