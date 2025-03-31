import HostIO from "../host/HostIO.js"

window.addEventListener("load", async () => {
    const gameCode = document.querySelector("#game-board").getAttribute("game-token")
    const nameButton = document.querySelector("#name_button")
    const cancelButton = document.querySelector("#cancel_button")
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

    hostIO.on("connected", (_seat) => seat = _seat)

    hostIO.on("update_names", (data) => {
        for (let seat = 0; seat < 4; seat++){
            const name = data[seat]
            document.querySelector(`#player_${seat}_name`).textContent = name                  
        }
    })

    hostIO.on("game_cancelled", (data) => {
        window.location = "/landing"
    });
})
