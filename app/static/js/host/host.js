import HostIO from "./HostIO.js"

window.addEventListener("load", async () => {
    const gameCode = document.querySelector("#game-board").getAttribute("game-token")
    const copyButton = document.querySelector("#copy_button")
    const nameButton = document.querySelector("#name_button")
    const cancelButton = document.querySelector("#cancel_button")
    const startButton = document.querySelector("#start_button")
    let seat = -1

    // Connect to the websocket
    const hostIO = new HostIO()

    // Cancel button logic
    cancelButton.addEventListener("click", () => {
        hostIO.exitGame()
    });

    // Name Button Logic
    nameButton.addEventListener("click", async () => {
        const username = await document.querySelector("name-dialog").show()
        hostIO.setName(username)
    });

    // Adds a click event listener to copy the invite code
    // The code is set by server via jinja templating as an attr on the copy button
    copyButton.addEventListener("click", () => {
        const url = `http://${location.hostname}:${location.port}/join/${gameCode}`
        navigator.clipboard.writeText(url)
    });

    hostIO.on("connected", (_seat) => seat = _seat)

    hostIO.on("update_names", (data) => {
        for (let seat = 0; seat < 4; seat++){
            const name = data[seat]
            if (seat === 0 && data[seat] != undefined) {
                const startButton = document.querySelector("#start_button")
                startButton.classList.remove("disabled")
            }
            document.querySelector(`#player_${seat}_name`).textContent = name                  
        }
    })
})
