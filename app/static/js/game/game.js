import GameIO from "./GameIO.js"
import ViewModel from "./View_Model.js"
import ViewController from "./View_Controller.js"
import ViewHistory from "./View_History.js"
import ViewUpdate from  "./View_Update.js"

window.addEventListener("load", async () => {
    const gameIO = new GameIO()
    const viewModel = new ViewModel()
    const viewHistory = new ViewHistory(viewModel)
    const viewUpdate = new ViewUpdate(viewModel)
    const viewController = new ViewController(viewModel, viewHistory, viewUpdate, gameIO)

    // Websocket incoming events.
    gameIO.on("snapshot", async snapshot => {
        console.log(`received ${snapshot.hash.substring(0, 8)}:Snapshot`)
        viewHistory.enqueue(snapshot)
    });

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