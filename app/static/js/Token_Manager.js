export default class TokenManager {
    constructor(containerId) {
        this.makerToken = document.querySelector(`#maker_token`);
        this.dealerToken = document.querySelector(`#dealer_token`);
    }

    showMaker(seat, suit) {
        this.makerToken.classList.remove("hidden")
        this.makerToken.setAttribute("seat", seat)
        this.makerToken.setAttribute("suit", suit)
    }

    showDealer(seat) {
        this.dealerToken.classList.remove("hidden")
        this.dealerToken.setAttribute("seat", seat)
    }

    hide(){
        this.makerToken.classList.add("hidden")
        this.dealerToken.classList.add("hidden")
    }    
}