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

class ViewManager {
    constructor() {
        this.busy = false
        this.paused = false
        this.snapQ = []

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
            snapshot.hash,
            snapshot.state
        )
    }

    async updateView(snapshot) {
        this.report(snapshot)

        this.setTricks(0, 0)
        this.setTricks(1, 0)
        this.setTricks(2, 0)
        this.setTricks(3, 0)

        // Set names in player icons
        for (const player of snapshot.players) {
            const seat = this.getSeat(player.index, snapshot.for_player)
            this.setName(seat, player.name)
        }

        // set buttons based on state
        SuitButtonManager.clear()
        SuitButtonManager.hide()
        actionButtons.hide()
        chatBubble.hide()
        playedCards.hideAll()
        message.hide()

        if (snapshot.state == 7) {
            return;
        }

        // set the tokens
        tokens.hide()
        const dealerSeat = this.getSeat(snapshot.dealer, snapshot.for_player)
        
        if (snapshot.state > 0) {
            tokens.showDealer(dealerSeat)
        }

        if ([2, 4, 5, 6].has(snapshot.state)) {
            const makerSeat = this.getSeat(snapshot.maker, snapshot.for_player)            
            tokens.showMaker(makerSeat, snapshot.trump)
        }

        // set the hand cards
        hand.setCards(snapshot.hand)
        this.setBacks(1)
        this.setBacks(2)
        this.setBacks(3)

        // set score cards
        document.querySelector("#score_0").setAttribute("data-value", snapshot.score[0])
        document.querySelector("#score_1").setAttribute("data-value", snapshot.score[1])

        // set tricks
        for (const player of snapshot.players) {
            const seat = this.getSeat(player.index, snapshot.for_player)
            setTricks(seat, player.tricks)
        }

        // show start button for new game
        if (snapshot.state === 0) {
            actionButtons.setButtons([
                { "name": "Start" }
            ])
            return
        }

        // show played cards
        if ([5, 6].has(snapshot.state)) {
            for (let index = 0; index < 4; index++) {
                const seat = this.getSeat(index, snapshot.for_player)
                const player = snapshot.players[index]
                playedCards.setCard(seat, player.played)
            }
        }

        // display upcard
        if ([1, 2, 3, 4].has(snapshot.state)) {
            if (snapshot.up_card !== null) {
                upCard.show(snapshot.up_card)
            } else {
                upCard.showBack()
            }
        } else {
            upCard.hide()
        }

        if (snapshot.last_player !== null) {
            if (snapshot.last_player !== snapshot.for_player && snapshot.state < 5) {
                const seat = this.getSeat(snapshot.last_player, snapshot.for_player)
                chatBubble.show(seat, snapshot.last_action)
            }

            await delay(1000)
            chatBubble.hide()
        }

        if (snapshot.state == 6) {
            this.pauseForContinue(snapshot)
        }
        else if (snapshot.active_player === snapshot.for_player) {
            this.updateViewForPlayer(snapshot)
        }
    }

    pauseForContinue(snapshot) {
        this.paused = true

        if (snapshot.tricks.length < 5) {
            message.show("Trick Complete")
        } else {
            message.show("Hand Finished")
        }

        actionButtons.setButtons([
            { "name": "Continue" }
        ])
    }

    updateViewForPlayer(snapshot) {
        switch (snapshot.state) {
            case 1:
                actionButtons.setButtons([
                    { "name": "Pass" },
                    { "name": "Order" },
                    { "name": "Alone" },
                ])
                break
            case 2:
                message.show("Choose a Card to Swap")
                actionButtons.setButtons([
                    { "name": "Down" }
                ])
                hand.enable()
                break
            case 3: {
                actionButtons.setButtons([
                    { "name": "Pass" },
                    { "name": "Make", "disable": true },
                    { "name": "Alone", "disable": true },
                ])
                let card = snapshot.down_card
                let suit = card[card.length - 1]
                SuitButtonManager.disable(suit)
                SuitButtonManager.show()
            } break
            case 4: {
                actionButtons.setButtons([
                    { "name": "Make", "disable": true },
                    { "name": "Alone", "disable": true },
                ])
                let card = snapshot.down_card
                let suit = card[card.length - 1]
                SuitButtonManager.disable(suit)
                SuitButtonManager.show()
            } break
            case 5:
                message.show("Play a Card")
                hand.enable()
                actionButtons.hide()
                break
        }
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
            if (i++ < trickCount) trick.style.display = "block"
            else trick.style.display = "none"
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

export default new ViewManager()