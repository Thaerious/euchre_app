import ViewModel from "./View_Model.js"
import ViewHistory from "./View_History.js";

window.addEventListener("load", async () => {
    const viewModel = new ViewModel()
    const viewHistory = new ViewHistory(viewModel);

    window.ui = {
        viewModel: viewModel,
        viewHistory: viewHistory
    }

    viewModel.on("continue", () => {
        ui.viewModel.showButtons()
        console.log("hiding countdown button")
    })  

    viewHistory.on("load", (snapshot) => {
        viewModel.snapshot = snapshot
    })

    await viewHistory.load()
});