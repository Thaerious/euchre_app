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
        quick_start("Adam", "")
    });
    
    document.querySelector("#logout-button")?.addEventListener("click", () => {
        logout()
        window.location = "/"
    });
});

/**
 * Starts a new game if the user is logged in.
 * Sends a POST request to the server to initiate the game.
 */
function quick_start() {
    const token = localStorage.getItem("access_token");

    fetch("/quick_start", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        localStorage.setItem("game_token", data.token);
        window.location = "/game"
    })
    .catch(error => console.error("Error:", error));
}

async function logout(username, password) {
    const response = await fetch("/logout", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        }
    })
}