export default class UpCardManager {
    show(face) {
        const card = document.querySelector("#upcard")
        card.setAttribute("face", face)    
        card.classList.remove("hidden");
    }
    
    hide() {
        this.container.classList.add("hidden");
    }    
}

