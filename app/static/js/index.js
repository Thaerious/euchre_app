window.addEventListener("load", () => {
    document.querySelector("#start_button").addEventListener("click", () => {
        const username = "Player1"

        fetch("/start_game", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: username })
        })
        .then(response => response.json())
            .then(data => {
                console.log("Server Response:", data)
                window.location = `game/${data.hash}`
            })                
        .catch(error => console.error("Error:", error));
    });
});
