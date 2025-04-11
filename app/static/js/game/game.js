import GameIO from "./GameIO.js"
import ViewModel from "./View_Model.js"
import ViewController from "./View_Controller.js"

window.addEventListener("load", () => new GameUI())

class GameUI {
    constructor() {
        this.gameIO = new GameIO()
        this.viewModel = new ViewModel()
        this.viewController = new ViewController(this.viewModel, this.gameIO)

        this.loadHistory()
        
        window.ui = this
    }    
    
    loadHistory() {
        const token = this.viewModel.gameToken

        if (localStorage.getItem("history-for") != token) {
            // Clear local history for new games.
            localStorage.history = "[]"
            localStorage.setItem("history-for", token)
        }
        else {
            this.viewController.loadHistory()
        }        
    }
}