import HostIO from "./HostIO.js"

window.addEventListener("load", async () => {
    const gameCode = document.querySelector("#game-board").getAttribute("game-token")
    const copyButton = document.querySelector("#copy_button")
    const startButton = document.querySelector("#start_button")
    const usernameText = document.querySelector("#username_txt")

    // Connect to the websocket
    const hostIO = new HostIO()

    // Adds a click event listener to copy the invite code
    // The code is set by server via jinja templating as an attr on the copy button
    copyButton.addEventListener("click", () => {
        navigator.clipboard.writeText(gameCode)
    });

    // Send updated name when name textbox loses focus
    usernameText.addEventListener("blur", () => {
        hostIO.setName(usernameText.value)
    });

    // Set focus to start button when enter is pressed on name textbox
    usernameText.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            startButton.focus()
        }
    });

    // Enable the start button when there is text in the username input
    usernameText.addEventListener("input", () => {
        const username = usernameText.value.trim()
        if (username === "") startButton.classList.add("disabled")
        else startButton.classList.remove("disabled")
    });
})
