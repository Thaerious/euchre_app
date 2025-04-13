import GameIO from "./GameIO.js"
import ViewModel from "./View_Model.js"
import ViewController from "./View_Controller.js"
import ViewHistory from "./View_History.js"

window.addEventListener("load", async () => {
    const gameIO = new GameIO()
    const viewModel = new ViewModel()
    const viewHistory = new ViewHistory(gameIO, viewModel)
    const viewController = new ViewController(viewModel, viewHistory, gameIO)

    window.ui = {
        gameIO: gameIO,
        viewModel: viewModel,
        viewController: viewController,
    }

    await viewHistory.loadHistory()
    await viewHistory.run()
});