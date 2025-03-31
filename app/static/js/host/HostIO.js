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
            const data = JSON.parse(dataJSON)
            this.emit("connected", data.seat)
        })       

        this.socket.on("update_names", (dataJSON) => {
            const data = JSON.parse(dataJSON)
            this.emit("update_names", data)
        })           

        this.socket.on("game_cancelled", () => {
            this.emit("game_cancelled", data)
        })           
    }

    setName(name) {
        this.socket.emit("set_name", {
            name: name
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
