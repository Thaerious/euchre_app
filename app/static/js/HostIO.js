import EventEmitter from "./modules/Event_Emitter.js"

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
    }

    setName(name) {
        this.socket.emit("set_name", {
            name: name
        });
    }
}
