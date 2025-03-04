import GameIO from "./GameIO.js"
import SuitButtonManager from "./Suit_Button_Manager.js"
import ActionButtonManager from "./Action_Button_Manager.js"
import viewManager from "./View_Manager.js"
import HandManager from "./Hand_Manager.js"

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

    let suitButtons = new SuitButtonManager()
    let actionButtons = new ActionButtonManager()

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
    
    new HandManager().on("selected", (card) => {
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