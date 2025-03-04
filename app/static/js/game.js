import GameIO from "./GameIO.js"
import suitButtons from "./suit_buttons.js"
import actionButtons from "./action_buttons.js"
import viewManager from "./view_manager.js"
import hand from "./hand.js"

window.loadSnap = function (hash) {
    viewManager.enqueue(window.snapshots[hash])
};

window.updateSnap = function (hash) {
    viewManager.updateView(window.snapshots[hash])
};

window.viewManager = viewManager;

(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
        // Redirect to login if no token is found
        window.location.href = "/";
    }

    // this is for tracking and debugging snapshots
    let snapshots = localStorage.getItem("snapshots")
    snapshots ??= "{}"
    window.snapshots = JSON.parse(snapshots)

    // Load IO manager and request snapshot    
    window.addEventListener("load", () => {
        let gameio = new GameIO()
        window.gameio = gameio // todo remove  
        gameio.on("snapshot", async snapshot => viewManager.updateView(snapshot))

        console.log("ready", gameio.hubIdentity)
        if (gameio.hubIdentity != "gamedev") {
            gameio.joinHub()
            gameio.requestSnapshot()
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
        doAction("order", null)
    });

    hand.on("selected", (card) => {
        switch (viewManager.snapshot.state) {
            case 2:
                doAction("up", card)
                break;
            case 5:
                doAction("play", card)
                break;
        }
    });
})()