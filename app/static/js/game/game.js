import GameIO from "./GameIO.js"
import ViewModel from "./View_Model.js"
import ViewController from "./View_Controller.js"
import ViewHistory from "./View_History.js"
import ViewUpdate from  "./View_Update.js"

window.addEventListener("load", async () => {
    const gameIO = new GameIO()
    const viewModel = new ViewModel()
    const viewHistory = new ViewHistory(gameIO, viewModel)
    const viewUpdate = new ViewUpdate(viewModel)
    const viewController = new ViewController(viewModel, viewHistory, viewUpdate, gameIO)

    window.ui = {
        gameIO: gameIO,
        viewModel: viewModel,
        viewHistory: viewHistory,
        viewUpdate: viewUpdate,
        viewController: viewController,
    }

    await viewHistory.load()
    await viewHistory.run()
});