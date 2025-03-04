// Event listener that waits for the page to fully load before executing
window.addEventListener("load", async () => {
    // if (await checkStatus()) window.location = "/landing"

    // Adds a click event listener to the login button
    document.querySelector("#login_button").addEventListener("click", () => {
        login("Adam", "")
    });    
});

/**
 * Logs in a user with the given username.
 * Sends a POST request to the server and stores the received access token.
 */
function login(username, password) {
    fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username: username })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data)
        localStorage.setItem("access_token", data.access_token);  // Store JWT
        document.cookie = `token=${data.access_token}; path=/; Secure; HttpOnly`;
        // document.cookie = `token=${data.access_token}; path=/;`;
        window.location = "/landing"
    })
    .catch(error => console.error("Error:", error));
}

