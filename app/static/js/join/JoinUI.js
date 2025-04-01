import HostIO from "../host/HostIO.js"

export default class JoinUI {
    constructor() {
        this.seat = -1
        this.hostIO = new HostIO()

        this.addElements()
        this.addEventListeners()
        this.setupHostIO()
    }

    addElements() {
        this.gameCode = document.querySelector("#game-board").getAttribute("game-token")
        this.nameButton = document.querySelector("#name_button")
        this.cancelButton = document.querySelector("#cancel_button")
    }

    addEventListeners() {
        this.cancelButton.addEventListener("click", () => {
            this.hostIO.exitGame()
        })

        this.nameButton.addEventListener("click", async () => {
            const textbox = document.querySelector(`#player_${this.seat}_name`)
            const username = await document.querySelector("name-dialog").show(textbox.textContent)
            this.hostIO.setName(username)
        })
    }

    setupHostIO() {
        this.hostIO.on("connected", (_seat) => {
            this.seat = _seat
        })

        this.hostIO.on("update_names", async (data) => {
            for (let seat = 0; seat < 4; seat++) {
                const row = data[seat]
                const textbox = document.querySelector(`#player_${seat}_name`)
                
                if (!row || row.name === null) {
                    textbox.textContent = ""
                } else {
                    textbox.textContent = row.name
                    if (row["connected"] === 0) {
                        textbox.classList.add("disconnected")
                    } else {
                        textbox.classList.remove("disconnected")
                    }
                }
            }

            const textbox = document.querySelector(`#player_${this.seat}_name`)
            if (textbox.textContent == "") {
                const username = await document.querySelector("name-dialog").show(textbox.textContent)
                this.hostIO.setName(username)
            }

            this.hostIO.on("game_cancelled", (data) => {
                window.location = "/landing"
            });
        })
    }
}