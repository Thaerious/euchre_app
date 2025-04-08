import JoinUI from "../join/JoinUI.js"

export default class HostUI extends JoinUI {
    addElements() {
        super.addElements()
        this.startButton = document.querySelector("#start_button")
        this.copyButton = document.querySelector("#copy_button")
        this.cancelButton = document.querySelector("#cancel_button")        
    }

    addEventListeners() {
        super.addEventListeners()

        this.startButton.addEventListener("click", () => {
            this.hostIO.startGame()
        });

        this.copyButton.addEventListener("click", () => {
            const url = `http://${location.hostname}:${location.port}/join/${this.gameToken}`
            navigator.clipboard.writeText(url)
        })

        const kickButtons = document.querySelectorAll("#kick-container > div")        
        for (let button of kickButtons) {
            const seat = button.getAttribute("seat")
            button.addEventListener("click", () => {
                this.hostIO.kickPlayer(seat)
            })
        }
    }
}
