export default class UpCardManager {
    constructor() {
        this.card = document.getElementById("upcard")
    }

    setSnapshot(snapshot) {
        if ([1, 2, 3, 4].has(snapshot.state)) {
            if (snapshot.up_card !== null) {
                this.show(snapshot.up_card)
            } else {
                this.show("back")
            }
        } else {
            this.hide()
        }        
    }

    show(face) {
        this.card.setAttribute("face", face)    
        this.card.classList.remove("is_hidden");
    }
    
    hide() {
        this.card.classList.add("is_hidden");
    }    
}

