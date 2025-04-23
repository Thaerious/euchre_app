import getSeat from "../getSeat.js";

export default class TokenManager {
    constructor() {
        this.makerToken = document.getElementById(`maker_token`);
        this.dealerToken = document.getElementById(`dealer_token`);
    }

    setSnapshot(snapshot) {
        if (snapshot.state > 0) {
            const dealerSeat = getSeat(snapshot.dealer, snapshot.for_player)
            this.showDealer(dealerSeat)
        } else {
            this.dealerToken.classList.add("is_hidden")
        }

        if ([2, 4, 5, 6].has(snapshot.state)) {
            const makerSeat = getSeat(snapshot.maker, snapshot.for_player)
            this.showMaker(makerSeat, snapshot.trump)
        } else {
            this.makerToken.classList.add("is_hidden")
        }
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
}