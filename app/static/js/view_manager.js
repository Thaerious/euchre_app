import upCard from "./up_card.js"
import hand from "./hand.js"
import actionButtons from "./action_buttons.js"
import suitButtons from "./suit_buttons.js"
import playedCards from "./played_cards.js"
import chatBubble from "./chat_bubble.js"

function setTricks(seat, trickCount) {
    let i = 0;
    const trickElements = document.querySelectorAll(`#hand_${seat} .tricks .trick`);

    for (const trick of trickElements) {
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

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class ViewManager {
    constructor() {
        this.busy = false
        this.snapQ = []        

        // Every 500 ms if the manager is not busy, 
        // display the next snapshot if avaialable
        this.interval = setInterval(async () => {
            if (this.snapQ.length > 0 && !this.busy) {
                this.snapshot = this.snapQ.shift()
                await this.updateView(this.snapshot)
            }
        }, 50)
    }

    stop() {
        clearInterval(this.interval)
    }

    enqueue(snapshot) {
        this.snapQ.push(snapshot)
    }

    report(snapshot) {
        console.log(            
            snapshot.last_player ? snapshot.players[snapshot.last_player].name : "N/A",
            snapshot.last_action,
            snapshot.hash,
            snapshot.state
        )
    }

    async updateView(snapshot) {
        this.report(snapshot)
        this.busy = true

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

        // set the hand cards
        hand.setCards(snapshot.hand)
        setBacks(1, snapshot.players[1].cards)
        setBacks(2, snapshot.players[2].cards)
        setBacks(3, snapshot.players[3].cards)

        // set score cards
        document.querySelector("#score_0").setAttribute("data-value", snapshot.score[0]);
        document.querySelector("#score_1").setAttribute("data-value", snapshot.score[1]);

        // set tricks
        for (const player in snapshot.players) {
            const seat = getSeat(player.index, snapshot)
            setTricks(seat, player.tricks)
        }

        // show start button for new game
        if (snapshot.state === 0) {
            actionButtons.setButtons([
                { "name": "Start" }
            ])
            this.busy = false;
            return
        }

        // show played cards
        if (snapshot.state === 5) {            
            for (let index = 0; index < 4; index++) {
                const seat = getSeat(index, snapshot)
                const player = snapshot.players[index]
                playedCards.setCard(seat, player.played)
            }
        }

        if (snapshot.last_player !== null) {
            if (snapshot.last_player !== snapshot.for_player) {                
                const seat = getSeat(snapshot.last_player, snapshot)
                chatBubble.show(seat, snapshot.last_action)
            }
    
            await delay(1000)
            chatBubble.hide()            
        }

        if (snapshot.active_player === snapshot.for_player) {
            this.updateViewForPlayer(snapshot)
        }

        this.busy = false        
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
                hand.enable()
                actionButtons.hide()
                upCard.hide()
                break;
        }
    }
}

export default new ViewManager()