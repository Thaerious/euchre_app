import HostIO from "../host/HostIO.js"

export default class JoinUI {
    constructor() {
        this.hostIO = new HostIO()

        this.addElements()
        this.addEventListeners()
        this.setupHostIO()

        window.ui = this
    }

    get name() {
        const textbox = document.querySelector(`#player_${this.seat}_name`)
        return textbox.textContent
    }

    set name(value) {
        const textbox = document.querySelector(`#player_${this.seat}_name`)
        textbox.textContent = value
    }    

    get seat() {
        const seat = document.querySelector("#game-board").getAttribute("seat")
        return parseInt(seat)
    }

    get gameToken() {
        return document.querySelector("#game-board").getAttribute("game-token")
    }

    addElements() {
        this.nameButton = document.querySelector("#name_button")
        this.cancelButton = document.querySelector("#cancel_button")
        this.alertDialog = document.querySelector("alert-dialog")
        this.nameDialog = document.querySelector("name-dialog")
    }

    addEventListeners() {
        this.cancelButton.addEventListener("click", () => {
            this.hostIO.exitGame()
        })

        this.nameButton.addEventListener("click", async () => {
            await this.show_name_dialog()
        })
    }

    async show_name_dialog() {
        let nameSetSuccess = false

        while (nameSetSuccess === false) {
            const username = await this.nameDialog.show(this.name)
            try {
                nameSetSuccess = await this.hostIO.setName(username)
                if (nameSetSuccess == false) {
                    await this.alertDialog.show(
                        "Username not set.\n" +
                        "Choose a different name.\n"
                    )
                }
            } catch (e) {
                await this.alertDialog.show(e)
            }
        }
    }

    setupHostIO() {
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

            if (this.name == "") {
                await this.show_name_dialog();
            }
        })

        this.hostIO.on("game_cancelled", async (data) => {
            if (this.seat != 0) {
                await this.alertDialog.show(
                    "The game has been cancelled.\n" +
                    "You will be returned to the lobby.\n"
                )
                window.location = "/lobby"
            }
        });

        this.hostIO.on("kicked", async () => {
            await this.alertDialog.show(
                "You have been removed from this game.\n" +
                "You will be returned to the lobby.\n"
            )
            window.location = "/lobby"
        });

        this.hostIO.on("start_game", async () => {
            window.location = `/game`
        });
    }
}