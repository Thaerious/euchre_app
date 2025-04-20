import ViewModel from "./View_Model.js"

window.addEventListener("load", async () => {
    const viewModel = new ViewModel()

    window.ui = {
        viewModel: viewModel,
    }

    viewModel.on("continue", () => {
        ui.viewModel.showButtons()
        console.log("hiding countdown button")
    })  
});