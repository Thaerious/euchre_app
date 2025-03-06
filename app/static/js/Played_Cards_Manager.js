
export default class PlayedCardsManager {
    constructor() {
        this.nextZ = 1;
    }

    hide() {
        for (let seat = 0; seat < 4; seat++) {
            const card = document.querySelector(`#played_${seat}`)
            card.classList.add("hidden")
        }
    }

    setCard(seat, face) {
        const card = document.querySelector(`#played_${seat}`)
        card.setAttribute("face", face)        
        card.style.zIndex = `${this.nextZ++}`
        card.classList.remove("hidden")
    }
}

