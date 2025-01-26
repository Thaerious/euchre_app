window.addEventListener("load", () => {
    document.querySelector("#login_button").addEventListener("click", () => {
        login("Adam", "")
    });    
    document.querySelector("#start_button").addEventListener("click", () => {
        startGame()
    });
});

function startGame() {
    const token = localStorage.getItem("access_token");
    if (!token) {
        alert("You must log in first.");
        return;
    }    

    fetch("/start_game", {
        method: "POST",
        auth: { token: token },
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log("Server Response:", data)
        window.location = `game/${data.hash}`
    })
    .catch(error => console.error("Error:", error));
}

function login(username, password) {
    fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username })
    })
    .then(response => response.json())
    .then(data => {
        localStorage.setItem("access_token", data.access_token);  // Store JWT
        alert("Login successful!");
    })
    .catch(error => console.error("Error:", error));
}

