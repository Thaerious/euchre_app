import UpCardManager from "./Up_Card_Manager.js"
import HandManager from "./Hand_Manager.js"
import SuitButtonManager from "./Suit_Button_Manager.js"
import TokenManager from "./Token_Manager.js"
import ChatBubbleManager from "./Chat_Bubble.js"
import MessageManager from "./Message_Manager.js"
import PlayedCardsManager from "./Played_Cards_Manager.js"
import ActionButtonManager from "./Action_Button_Manager.js"

Array.prototype.has = function (value) {
    return this.indexOf(value) >= 0
};

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

export default class ViewManager {
    constructor() {
        this.busy = false
        this.paused = false
        this.snapQ = []
        this.snapshot = null

        this.chatBubble = new ChatBubbleManager()
        this.message = new MessageManager()
        this.tokens = new TokenManager()
        this.played = new PlayedCardsManager()
        this.suitButtons = new SuitButtonManager()
        this.actionButtons = new ActionButtonManager()
        this.hand = new HandManager()
        this.upcard = new UpCardManager()

        this.actionButtons.on("continue", async () => {
            this.paused = false
            await this.run_queue()
        })

        this.suitButtons.on("change", suit => {
            this.actionButtons.enableAll()
        });
    }

    stop() {
        clearInterval(this.interval)
    }

    async enqueue(snapshot) {
        this.snapQ.push(snapshot)
        await this.run_queue()
    }

    async run_queue() {
        if (!this.busy) {
            this.busy = true
            while (this.snapQ.length > 0 && !this.paused) {
                this.snapshot = this.snapQ.shift()
                await this.updateView(this.snapshot)
            }
            this.busy = false
        }
    }

    report(snapshot) {
        console.log(
            snapshot.last_player,
            snapshot.last_action,
            snapshot.state
        )
    }

    resetView() {
        this.chatBubble.hide()
        this.message.hide()
        this.tokens.hide()
        this.played.hide()
        this.suitButtons.hide()
        this.actionButtons.hide()
        this.hand.clear()
        this.upcard.showBack()
    }

    async updateView(snapshot) {
        this.report(snapshot)
        this.resetView()

        // Set names in player icons
        for (const player of snapshot.players) {
            const seat = this.getSeat(player.index, snapshot.for_player)
            this.setName(seat, player.name)
        }

        if (snapshot.state == 7) return;

        // set the tokens        
        if (snapshot.state > 0) {
            const dealerSeat = this.getSeat(snapshot.dealer, snapshot.for_player)
            this.tokens.showDealer(dealerSeat)
        }

        if ([2, 4, 5, 6].has(snapshot.state)) {
            const makerSeat = this.getSeat(snapshot.maker, snapshot.for_player)
            this.tokens.showMaker(makerSeat, snapshot.trump)
        }

        // set the hand cards
        this.hand.setCards(snapshot.hand)

        // set opponents cards in hand
        for (let p = 0; p < 4; p++) {
            let seat = this.getSeat(p, snapshot.for_player)
            if (seat == 0) continue
            this.setBacks(seat, snapshot.players[p].hand_size)
        }

        // set score cards
        if ([0, 2].has(snapshot.for_player)) {
            this.setScore(0, snapshot.score[0])
            this.setScore(1, snapshot.score[1])
        } else {
            this.setScore(1, snapshot.score[0])
            this.setScore(0, snapshot.score[1])
        }

        // set tricks
        for (const player of snapshot.players) {
            const seat = this.getSeat(player.index, snapshot.for_player)
            this.setTricks(seat, player.tricks)
        }

        // display upcard
        if ([1, 2, 3, 4].has(snapshot.state)) {
            if (snapshot.up_card !== null) {
                this.upcard.show(snapshot.up_card)
            } else {
                this.upcard.showBack()
            }
        } else {
            this.upcard.hide()
        }

        // show played cards
        this.played.hide()
        if ([5, 6].has(snapshot.state)) {
            let current_trick = snapshot.tricks.at(-1)
            let cards_played = current_trick.length

            for (let index = 0; index < cards_played; index++) {
                let pindex = (snapshot.lead + index) % 4
                const seat = this.getSeat(pindex, snapshot.for_player)
                const player = snapshot.players[pindex]
                if (player.played.length == 0) continue
                this.played.setCard(seat, player.played.at(-1))
            }
        }

        // if (snapshot.last_player !== null) {
        //     if (snapshot.last_player !== snapshot.for_player && snapshot.state < 5) {
        //         const seat = this.getSeat(snapshot.last_player, snapshot.for_player)
        //         chatBubble.show(seat, snapshot.last_action)
        //     }

        //     await delay(1000)
        //     chatBubble.hide()
        // }

        if (snapshot.current_player === snapshot.for_player) {
            this.updateViewForPlayer(snapshot)
        } else {
            await this.pauseForContinue(snapshot)
        }

        // if (snapshot.state == 6 ) {
        //     await this.pauseForContinue(snapshot, "Trick Finished")
        // }
        // else if (snapshot.state == 7 ) {
        //     await this.pauseForContinue(snapshot, "Hand Finished")
        // }        
        // else if (snapshot.current_player === snapshot.for_player) {
        //     this.updateViewForPlayer(snapshot)
        // }
    }

    async pauseForContinue(snapshot, message = "") {
        this.paused = true
        if (message !== "") this.message.show(message)

        this.actionButtons.setButtons([
            { "name": "Continue" }
        ])

        await new Promise(resolve => {
            this.actionButtons.once("continue", resolve);
        });
    }

    updateViewForPlayer(snapshot) {
        switch (snapshot.state) {
            case 1:
                this.actionButtons.setButtons([
                    { "name": "Pass" },
                    { "name": "Order" },
                    { "name": "Alone" },
                ])
                break
            case 2:
                this.message.show("Choose a Card to Swap")
                this.actionButtons.setButtons([
                    { "name": "Down" }
                ])
                this.hand.enable()
                break
            case 3: {
                this.actionButtons.setButtons([
                    { "name": "Pass" },
                    { "name": "Make", "disable": true },
                    { "name": "Alone", "disable": true },
                ])
                let card = snapshot.down_card
                let suit = card[card.length - 1]
                this.suitButtons.disable(suit)
                this.suitButtons.show()
            } break
            case 4: {
                this.actionButtons.setButtons([
                    { "name": "Make", "disable": true },
                    { "name": "Alone", "disable": true },
                ])
                let card = snapshot.down_card
                let suit = card[card.length - 1]
                this.suitButtons.disable(suit)
                this.suitButtons.show()
            } break
            case 5:
                this.message.show("Play a Card")
                this.hand.enable()
                this.actionButtons.hide()
                break
        }
    }

    setScore(team, value) {
        document.querySelector(`#score_${team}`).setAttribute("data-value", value)
    }

    setBacks(seat, count) {
        const element = document.querySelector(`#hand_${seat} > .cards`)
        while (element.childElementCount > count) {
            element.removeChild(element.firstChild)
        }

        while (element.childElementCount < count) {
            const img = document.createElement("img")
            img.classList.add("card")
            img.src = "../static/images/cards/large/back.png"
            element.appendChild(img)
        }
    }

    setName(seat, text) {
        const ele = document.querySelector(`.player_icon[seat='${seat}']`)
        ele.innerText = text
    }

    setTricks(seat, trickCount) {
        let i = 0
        const trickElements = document.querySelectorAll(`#hand_${seat} .tricks .trick`)

        for (const trick of trickElements) {
            if (i++ < trickCount) trick.classList.remove("hidden")
            else trick.classList.add("hidden")
        }
    }

    // Translate a player index to a seat index
    getSeat(pindex, forPlayer) {
        return (pindex + 4 - forPlayer) % 4
    }

    // Translate a seat index to a player index
    getIndex(seat, forPlayer) {
        return (seat + forPlayer) % 4
    }
}