import GameIO from "./GameIO.js"
import ViewModel from "./View_Model.js"
import ViewController from "./View_Controller.js"

window.addEventListener("load", async () => {
    const gameIO = new GameIO()
    const viewModel = new ViewModel()
    const viewController = new ViewController(viewModel, gameIO)

    window.ui = {
        gameIO: gameIO,
        viewModel: viewModel,
        viewController: viewController,
    }

    await viewController.loadHistory()
    await viewController.run()
});