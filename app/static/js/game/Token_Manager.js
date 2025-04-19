export default class TokenManager {
    constructor() {
        this.makerToken = document.getElementById(`maker_token`);
        this.dealerToken = document.getElementById(`dealer_token`);
    }

    showMaker(seat, suit) {
        this.makerToken.classList.remove("is_hidden")
        this.makerToken.setAttribute("seat", seat)
        this.makerToken.setAttribute("suit", suit)
    }

    showDealer(seat) {
        this.dealerToken.classList.remove("is_hidden")
        this.dealerToken.setAttribute("seat", seat)
    }

    hide(){
        this.makerToken.classList.add("is_hidden")
        this.dealerToken.classList.add("is_hidden")
    }    
}