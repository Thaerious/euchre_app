import EventEmitter from "../modules/Event_Emitter.js"

class EuchreException extends Error {
    constructor(message) {
        super(message)
    }
}

export default class HostIO extends EventEmitter {
    constructor() {
        super()

        this.socket = io(`/host`, {
            query: { token: this.token }
        });

        this.socket.on("connect", () => {
            console.log("Connected to WebSocket!");
        });

        this.socket.on("connect_error", (error) => {
            console.log("Connection error:", error);
            window.location = "/lobby"
        });

        this.socket.on("disconnect", () => {
            console.log("Disconnected from WebSocket.");
        });

        this.socket.on("socket_error", (data) => {
            console.error("Socket Error:", data);
            window.alert(data.message)
        });
        
        this.socket.onAny((event, ...args) => {   
            if (event.startsWith("response:")){
                return
            }

            if (args.length > 0) {
                const data = JSON.parse(args[0])    
                console.log("HostIO Received Event:", event, data);
                this.emit(event, data)
            } else {
                console.log("HostIO Received Event:", event);
                this.emit(event, null)
            }
        });
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
        const response = await fetch("/exit_staging", {
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
