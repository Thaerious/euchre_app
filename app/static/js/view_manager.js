import upCard from "./up_card.js"
import hand from "./hand.js"
import actionButtons from "./action_buttons.js"
import suitButtons from "./suit_buttons.js"
import playedCards from "./played_cards.js"
import chatBubble from "./chat_bubble.js"

function setTricks(userIndex, trickCount) {
    let i = 0;
    const tricksElement = document.querySelector(`#hand_${userIndex} > .tricks`);

    for (const trick of tricksElement.querySelectorAll(".trick")) {
        if (i++ < trickCount) trick.style.display = "block";
        else trick.style.display = "none";
    }
}

function setBacks(playerIndex, count) {
    const element = document.querySelector(`#hand_${playerIndex} > .cards`);
    while (element.childElementCount > count) {
        element.removeChild(element.firstChild);
    }
    while (element.childElementCount < count) {
        const img = document.createElement("img");
        img.classList.add("card");
        img.src = "../static/images/cards/large/back.png";
        element.appendChild(img);
    }
}

function getSeat(pindex, snapshot) {
    return (pindex + (4 - snapshot.for_player)) % 4;
}

class ViewManager {
    constructor() {
        this.busy = false
        this.snapQ = []        

        // Every 500 ms if the manager is not busy, 
        // display the next snapshot if avaialable
        this.interval = setInterval(() => {
            if (this.snapQ.length > 0 && !this.busy) {
                const next = this.snapQ.shift()
                this.updateView(next)
            }
        }, 500)
    }

    stop() {
        clearInterval(this.interval)
    }

    enqueue(snapshot) {
        console.log(this.busy)
        if (this.busy) {
            console.log(`[Q] <-- ${snapshot.hash}`)
            this.snapQ.push(snapshot)
        } else {
            console.log(`[V] <-- ${snapshot.hash}`)
            this.updateView(snapshot)
        }
    }

    report(snapshot) {
        console.log(            
            snapshot.last_player ? snapshot.players[snapshot.last_player].name : "N/A",
            snapshot.last_action,
            snapshot.hash,
            snapshot.state
        )
    }

    updateView(snapshot) {
        this.report(snapshot)
        this.busy = true

        setTricks(0, 0)
        setTricks(1, 0)
        setTricks(2, 0)
        setTricks(3, 0)

        // set buttons based on state
        suitButtons.clear()
        suitButtons.hide()
        chatBubble.hide()
        playedCards.hideAll()

        // set the hand cards
        hand.setCards(snapshot.hand)
        setBacks(1, snapshot.players[1].cards)
        setBacks(2, snapshot.players[2].cards)
        setBacks(3, snapshot.players[3].cards)

        // set score cards
        document.querySelector("#score_0").setAttribute("data-value", snapshot.score[0]);
        document.querySelector("#score_1").setAttribute("data-value", snapshot.score[1]);

        // show start button for new game
        if (snapshot.state === 0) {
            actionButtons.setButtons([
                { "name": "Start" }
            ])
            this.busy = false;
            return
        }

        if (snapshot.last_player !== snapshot.for_player) {
            const seat = getSeat(snapshot.last_player, snapshot)
            chatBubble.show(seat, snapshot.last_action)
        }

        setTimeout(() => {
            chatBubble.hide()
            // show buttons, enable actions if for-player is playing
            if (snapshot.active_player === snapshot.for_player) {
                this.updateViewForPlayer(snapshot)
            }

            console.log(`Done ${snapshot.hash}`)
            this.busy = false;
        }, 1000)
    }

    updateViewForPlayer(snapshot) {
        switch (snapshot.state) {
            case 1:
                actionButtons.setButtons([
                    { "name": "Pass" },
                    { "name": "Order" },
                    { "name": "Alone" },
                ])
                upCard.show(snapshot.up_card)
                break;
            case 2:
                actionButtons.setButtons([
                    { "name": "Down" }
                ])
                hand.enable()
                upCard.show(snapshot.up_card)
                break;
            case 3:
                actionButtons.setButtons([
                    { "name": "Pass" },
                    { "name": "Make", "disable": true },
                    { "name": "Alone", "disable": true },
                ])
                upCard.back()
                suitButtons.disable(snapshot.down_card[1])
                suitButtons.show()
                break;
            case 4:
                actionButtons.setButtons([
                    { "name": "Make", "disable": true },
                    { "name": "Alone", "disable": true },
                ])
                upCard.back()
                suitButtons.disable(snapshot.down_card[1])
                suitButtons.show()
                break;

            case 5:
                for (let index = 0; index < 4; index++) {
                    const seat = getSeat(index, snapshot)
                    const player = snapshot.players[index]
                    playedCards.setCard(seat, player.played)
                }

                hand.enable()
                actionButtons.hide()
                upCard.hide()
                break;
        }
    }
}

export default new ViewManager()