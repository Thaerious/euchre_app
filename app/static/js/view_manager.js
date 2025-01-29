import upCard from "./up_card.js"
import hand from "./hand.js"
import actionButtons from "./action_buttons.js"
import suitButtons from "./suit_buttons.js"
import playedCards from "./played_cards.js"
import chatBubble from "./chat_bubble.js"
import message from "./message.js"

Array.prototype.has = function (value) {
    return this.indexOf(value) >= 0
};

function setTricks(seat, trickCount) {
    let i = 0
    const trickElements = document.querySelectorAll(`#hand_${seat} .tricks .trick`)

    for (const trick of trickElements) {
        if (i++ < trickCount) trick.style.display = "block"
        else trick.style.display = "none"
    }
}

function getSeat(pindex, forPlayer) {
    return (pindex + 4 - forPlayer) % 4
}

function getIndex(seat, forPlayer) {
    return (seat + forPlayer) % 4
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

class ViewManager {
    constructor() {
        this.busy = false
        this.paused = false
        this.snapQ = []

        actionButtons.on("continue", async () => {
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

        setTricks(0, 0)
        setTricks(1, 0)
        setTricks(2, 0)
        setTricks(3, 0)

        // set buttons based on state
        suitButtons.clear()
        suitButtons.hide()
        actionButtons.hide()
        chatBubble.hide()
        playedCards.hideAll()
        message.hide()

        if (snapshot.state == 7) {
            return;
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
            const seat = getSeat(player.index, snapshot.for_player)
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
                const seat = getSeat(index, snapshot.for_player)
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
                const seat = getSeat(snapshot.last_player, snapshot.for_player)
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
                suitButtons.disable(suit)
                suitButtons.show()
            } break
            case 4: {
                actionButtons.setButtons([
                    { "name": "Make", "disable": true },
                    { "name": "Alone", "disable": true },
                ])
                let card = snapshot.down_card
                let suit = card[card.length - 1]
                suitButtons.disable(suit)
                suitButtons.show()
            } break
            case 5:
                message.show("Play a Card")
                hand.enable()
                actionButtons.hide()
                break
        }
    }

    setBacks(seat) {
        const pindex = getIndex(seat, this.snapshot.for_player)
        const count = this.snapshot.players[pindex].cards

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
}

export default new ViewManager()