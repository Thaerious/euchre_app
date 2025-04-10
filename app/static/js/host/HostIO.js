import BaseIO from "../modules/BaseIO.js"

export default class HostIO extends BaseIO {
    constructor() {
        super("/host")
    }

    async setName(name) {
        this.socket.emit("set_name", {
            name: name
        });

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error("Timeout: no response to set_name"));
            }, 5000);

            this.socket.once("response: set_name", (dataJSON) => {
                clearTimeout(timeout);
                try {
                    const data = JSON.parse(dataJSON)
                    resolve(data)
                } catch (e) {
                    reject(e)
                }
            });
        });
    }

    kickPlayer(seat) {
        this.socket.emit("kick_player", {
            seat: seat
        });
    }

    async exitGame(name) {
        const response = await fetch("/exit_lobby", {
            method: "POST"
        })
        
        if (response.redirected) {
            window.location.href = response.url;
        }
    }    

    startGame() {
        this.socket.emit("start_game", null);
    }
}
