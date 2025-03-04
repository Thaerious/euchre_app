import checkStatus from "./modules/check_status.js";

// Event listener that waits for the page to fully load before executing
window.addEventListener("load", async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
        // Redirect to login if no token is found
        window.location.href = "/";
    }

    // Adds a click event listener to the login button
    document.querySelector("#quick_button").addEventListener("click", () => {
        quick_start("Adam", "")
    });

    // Adds a click event listener to the start button
    document.querySelector("#logout_button").addEventListener("click", () => {
        localStorage.removeItem("access_token");
        window.location.href = "/"
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
        console.log("Server Response:", data)
        window.location = `game/${data.identity}`  // Redirect to the game page
    })
    .catch(error => console.error("Error:", error));
}
