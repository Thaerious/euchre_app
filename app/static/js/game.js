import GameIO from "./GameIO.js"
import ViewModel from "./View_Model.js"
import ViewController from "./View_Controller.js"

// This module is the main entry point for 'game.html'.
// This module is responsible for loading and linking the components,
// and loading the game's local history.

(() => {
    const token = localStorage.getItem("game_token");
    if (!token) {
        // Redirect to login if no token is found
        window.location.href = "/landing";
    }

    // Load IO manager and initialize history
    window.addEventListener("load", () => {

        // Translates websocket events to custom UI events
        const viewModel = new ViewModel()

        // Stateless websocket wrapper
        const gameio = new GameIO()

        // Translates user actions to server API calls
        const viewController = new ViewController(viewModel, gameio)

        window.viewModel = viewModel;
        window.viewController = viewController;

        if (localStorage.getItem("history-for") != token) {
            // Clear local history for new games.
            localStorage.history = "[]"
            localStorage.setItem("history-for", token)
        }
        else {
            viewController.loadHistory()
        }
    });
})()