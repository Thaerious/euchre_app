import { getSocket, requestSnapshot, doAction } from "./gameio.js"
import { suitButtons } from "./suit_buttons.js"
import { actionButtons } from "./action_buttons.js"
import { distributeHorizontally } from "./distribute_elements.js"
import { upCard } from "./up_card.js"
import { hand } from "./hand.js"

function hidePlayedCards() {
    const elements = document.querySelectorAll(`#played > .card`);
    for (const element of elements) {
        element.classList.add("hidden")
    }
}

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

function updateView(snapshot) {
    setTricks(0, 0)
    setTricks(1, 0)
    setTricks(2, 0)
    setTricks(3, 0)

    // set buttons based on state
    suitButtons.clear()
    suitButtons.hide()

    switch (snapshot.state) {
        case 0:
            actionButtons.setButtons([
                { "name": "Start" }
            ])

            break;
        case 1:
            if (snapshot.active_player == snapshot.for_player) {

                actionButtons.setButtons([
                    { "name": "Pass" },
                    { "name": "Order" },
                    { "name": "Alone" },
                ])

            }
            upCard.show(snapshot.up_card)
            break;
        case 2:
            if (snapshot.active_player == snapshot.for_player) {
                actionButtons.setButtons([
                    { "name": "Down" }
                ])
            }
            hand.enable()
            upCard.show(snapshot.up_card)
            break;
        case 3:
            if (snapshot.active_player == snapshot.for_player) {
                actionButtons.setButtons([
                    { "name": "Pass" },
                    { "name": "Make", "disable": true },
                    { "name": "Alone", "disable": true },
                ])
            }
            upCard.back()
            suitButtons.disable(snapshot.down_card[1])
            suitButtons.show()
            break;
        case 4:
            if (snapshot.active_player == snapshot.for_player) {
                actionButtons.setButtons([
                    { "name": "Make", "disable": true },
                    { "name": "Alone", "disable": true },
                ])
            }
            upCard.back()
            suitButtons.disable(snapshot.down_card[1])
            suitButtons.show()
            break;

        case 5:
            for (let index = 0; index < 4; index++) {
                const seat = (index + (4 - snapshot.for_player)) % 4;
                const player = snapshot.players[index]
                playedCards.setCard(seat, player.played)
            }

            hand.enable()
            actionButtons.hide()
            upCard.hide()
            break;
    }

    // clear played cards if not currently playing a trick (state 5)
    if (snapshot.state != 5) hidePlayedCards()

    // set the hand cards
    hand.setCards(snapshot.hand)
    setBacks(1, snapshot.players[1].cards)
    setBacks(2, snapshot.players[2].cards)
    setBacks(3, snapshot.players[3].cards)

    // set score cards
    document.querySelector("#score_0").setAttribute("data-value", snapshot.score[0]);
    document.querySelector("#score_1").setAttribute("data-value", snapshot.score[1]);

    // refesh layout
    // setTimeout(()=>{
    //     distributeHorizontally("#hand_0 > .cards", -0.6);
    //     distributeHorizontally("#hand_1 > .cards", -0.6);
    //     distributeHorizontally("#hand_2 > .cards", -0.6);
    //     distributeHorizontally("#hand_3 > .cards", -0.6);
    //     distributeHorizontally("#action_container", 0.05);
    // }, 10);    
}

(() => {
    window.snapshots = {}
    window.addEventListener("load", () => requestSnapshot());

    // window.addEventListener("resize", () => {
    //     distributeHorizontally("#hand_0 > .cards", -0.6);
    //     distributeHorizontally("#hand_1 > .cards", -0.6);
    //     distributeHorizontally("#hand_2 > .cards", -0.6);
    //     distributeHorizontally("#hand_3 > .cards", -0.6);
    //     distributeHorizontally("#action_container", 0.05);
    // });

    getSocket().on("snapshot", (data) => {
        const snap = JSON.parse(data)
        window.snapshots[snap.hash.substring(0, 3)] = snap

        if (snap.last_player !== null) {
            console.log(
                snap.players[snap.last_player].name,
                snap.last_action,
                snap.hash,
                snap.state
            )
        }
        else {
            console.log(
                snap.last_action,
                snap.hash,
                snap.state
            )
        }

        if (data.last_player != data.for_player) {
            updateView(snap);
        } else {
            setTimeout(() => {
                updateView(snap);
            }, 10);
        }
    });

    suitButtons.on("change", () => {
        actionButtons.enableAll()
    });

    actionButtons.on("start", () => {
        doAction("start", null)
    });

    actionButtons.on("pass", () => {
        doAction("pass", suitButtons.getSuit())
    });

    actionButtons.on("make", () => {
        doAction("make", suitButtons.getSuit())
    });

    actionButtons.on("alone", () => {
        doAction("alone", suitButtons.getSuit())
    });

    actionButtons.on("order", () => {
        doAction("alone", null)
    });
})()