import GameIO from "./GameIO.js"
import ViewModel from "./View_Model.js"
import ViewController from "./View_Controller.js"

(() => {
    const token = localStorage.getItem("game_token");    
    if (!token) {
        // Redirect to login if no token is found
        window.location.href = "/landing";
    }
    
    let gameio = null
    let viewController = null

    // Load IO manager and request a snapshot    
    window.addEventListener("load", () => {
        const viewModel = new ViewModel()
        gameio = new GameIO()
        viewController = new ViewController(viewModel, gameio) 

        window.viewModel = viewModel;
        window.viewController = viewController;        

        if (localStorage.getItem("hub") != gameio.hubIdentity) {
            localStorage.history = "[]"
            localStorage.setItem("hub", gameio.hubIdentity)
        }
        else {
            viewController.loadHistory()
        }

        if (gameio.hubIdentity != "gamedev") {
            gameio.joinHub()
            gameio.requestSnapshot()
        }
    });   
})()