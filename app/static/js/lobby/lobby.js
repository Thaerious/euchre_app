// Event listener that waits for the page to fully load before executing
window.addEventListener("load", async () => {
    const params = new URLSearchParams(window.location.search);
    const reason = params.get("reason");
    if (reason == "expired") {
        const alertDialog = document.querySelector("alert-dialog")
        alertDialog.show("Game is no longer valid.")
    }
    
    document.querySelector("#private-button").addEventListener("click", () => {
        window.location = "/host"
    });

    document.querySelector("#quick-button").addEventListener("click", () => {
        window.location = "/quick_start"
    });

    document.querySelector
});
