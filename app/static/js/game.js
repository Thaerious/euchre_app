import GameIO from "./GameIO.js"
import SuitButtonManager from "./Suit_Button_Manager.js"
import ActionButtonManager from "./Action_Button_Manager.js"
import ViewManager from "./View_Manager.js"

(() => {
    let viewManager = new ViewManager()
    window.viewManager = viewManager;

    const token = localStorage.getItem("access_token");    
    if (!token) {
        // Redirect to login if no token is found
        window.location.href = "/";
    }

    let gameio = null

    // Load IO manager and request a snapshot    
    window.addEventListener("load", () => {
        gameio = new GameIO()
        window.gameio = gameio // todo remove  
        gameio.on("snapshot", async snapshot => viewManager.enqueue(snapshot))

        console.log("ready", gameio.hubIdentity)
        if (gameio.hubIdentity != "gamedev") {
            gameio.joinHub()
            gameio.requestSnapshot()
        }
    });

    let suitButtons = new SuitButtonManager()
    let actionButtons = new ActionButtonManager()

    viewManager.actionButtons.on("change", () => {
        actionButtons.enableAll()
    });

    viewManager.actionButtons.on("start", () => {
        gameio.doAction("start", null)
    });

    viewManager.actionButtons.on("pass", () => {
        gameio.doAction("pass", suitButtons.getSuit())
    });

    viewManager.actionButtons.on("make", () => {
        gameio.doAction("make", suitButtons.getSuit())
    });

    viewManager.actionButtons.on("alone", () => {
        gameio.doAction("alone", suitButtons.getSuit())
    });

    viewManager.actionButtons.on("order", () => {
        gameio.doAction("order", null)
    });
    
    viewManager.hands[0].on("selected", (card) => {
        switch (viewManager.snapshot.state) {
            case 2:
                gameio.doAction("up", card)
                break;
            case 5:
                gameio.doAction("play", card)
                break;
        }
    });
})()