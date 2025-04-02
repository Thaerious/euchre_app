import EventEmitter from "../modules/Event_Emitter.js"

class EuchreException extends Error {
    constructor(message) {
        super(message)
    }
}

export default class GameIO extends EventEmitter {
    constructor() {
        super()

        this.socket = io("http://" + location.hostname + ":" + location.port, {
            query: { token: this.token }
        });

        this.socket.on("connect", () => {
            console.log("Connected to WebSocket!");
        });

        this.socket.on("connect_error", (error) => {
            console.log("Connection error:", error);
            window.location = "/landing"
        });

        this.socket.on("disconnect", () => {
            console.log("Disconnected from WebSocket.");
        });

        this.socket.on("socket_error", (data) => {
            window.alert(data.message)
            console.error(data)
        });

        this.socket.on("connected", (dataJSON) => {
            console.log(`HostIO connected ${dataJSON}`)
            const data = JSON.parse(dataJSON)
            this.emit("connected", data.seat)
        })       

        this.socket.on("update_names", (dataJSON) => {
            const data = JSON.parse(dataJSON)
            this.emit("update_names", data)
        })           

        this.socket.on("game_cancelled", () => {
            this.emit("game_cancelled", null)
        })      
        
        this.socket.on("kicked", () => {
            this.emit("kicked", null)
        })          
    }

    async setName(name) {
        this.socket.emit("set_name", {
            name: name
        });

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error("Timeout: no response to set_name"));
            }, 5000);

            console.log("this.socket.once")
            this.socket.on("set_name_return", (dataJSON) => {
                console.log("set name return" , dataJSON)
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
        const response = await fetch("/exit_staging", {
            method: "POST"
        })
        
        if (response.redirected) {
            window.location.href = response.url;
        }
    }    
}
