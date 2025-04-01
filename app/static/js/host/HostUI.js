import JoinUI from "../join/JoinUI.js"

export default class HostUI extends JoinUI {
    addElements() {
        super.addElements()
        this.copyButton = document.querySelector("#copy_button")
        this.cancelButton = document.querySelector("#cancel_button")
    }

    addEventListeners() {
        super.addEventListeners()

        this.copyButton.addEventListener("click", () => {
            const url = `http://${location.hostname}:${location.port}/join/${this.gameCode}`
            navigator.clipboard.writeText(url)
        })
    }
}
