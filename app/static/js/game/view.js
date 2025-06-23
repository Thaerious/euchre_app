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
        ui.viewModel.actionButtons.hideButtons()
    })  

    viewHistory.on("load", (snapshot) => {
        viewModel.setSnapshot(snapshot)
    })

    
    await viewHistory.load()
});

function addButtonListeners(viewHistory) {
    document.querySelector("#run_queue").classList.remove("is-disabled")
    document.querySelector("#pause_queue").classList.add("is-disabled")

    // Snapshot Queue button listeners
    document.querySelector("#next_snap").addEventListener("click", () => {
        viewHistory.next()
    });

    document.querySelector("#prev_snap").addEventListener("click", () => {
        viewHistory.paused = true
        document.querySelector("#run_queue").classList.remove("is-disabled")
        document.querySelector("#pause_queue").classList.add("is-disabled")        
        viewHistory.prev()
    });

    document.querySelector("#run_queue").addEventListener("click", async () => {
        viewHistory.paused = false
        document.querySelector("#run_queue").classList.add("is-disabled")
        document.querySelector("#pause_queue").classList.remove("is-disabled")
        viewHistory.run()
    });

    document.querySelector("#pause_queue").addEventListener("click", () => {
        viewHistory.paused = true
        document.querySelector("#run_queue").classList.remove("is-disabled")
        document.querySelector("#pause_queue").classList.add("is-disabled")  
    });
}

function updateButtons(viewHistory) {
    document.querySelector("#prev_snap").classList.remove("is-disabled")
    document.querySelector("#next_snap").classList.remove("is-disabled")

    if (viewHistory.snapIndex <= 0) {
        document.querySelector("#prev_snap").classList.add("is-disabled")
    }
    if (viewHistory.snapIndex >= viewHistory.snapHistory.length - 1) {
        document.querySelector("#next_snap").classList.add("is-disabled")
    }

    document.querySelector("#snap_index").innerText = `${this.snapIndex}`
}