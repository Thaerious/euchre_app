import { log, setLogging } from '../modules/log.js'

class EuchreException extends Error {
    constructor(message) {
        super(message)
    }
}

export default class GameIO {
    constructor() {
        const urlParts = window.location.pathname.split("/");
        this.hubID = urlParts[urlParts.length - 1];
        this.token = localStorage.getItem("game_token");
        this.snapshots = {}
        this.lastSnapshot = null
        this.events = new Map();
        this.enabled = true

        this.socket = io(`/game`, {
            query: { token: this.token }
        });

        this.socket.on("connect", () => {
            log("Connected to WebSocket!");
        });

        this.socket.on("connect_error", (error) => {
            log("Connection error:", error);
            window.location = "/lobby"
        });

        this.socket.on("disconnect", () => {
            log("Disconnected from WebSocket.");
        });

        this.socket.on("socket_error", (data) => {
            window.alert(data.message)
            console.error(data)
        });
       
        this.socket.on("snapshot", (data) => {
            log("Websocket received snaphot");
            const snapshot = JSON.parse(data)
            this.emit("snapshot", snapshot)
        });

        this.socket.on("message", (_data) => {
            log("Websocket received message");
            const data = JSON.parse(_data)
            if (data.type == "EuchreException") {
                this.emit("error", new EuchreException(data.message))
            }
            else {
                this.emit("error", new Error(data.message))
            }            
        });        
    }

    // Add event listener
    on(event, callback) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event).push(callback);
    }

    // Emit event (trigger listeners)
    emit(event, data = "{}") {
        if (this.events.has(event)) {
            this.events.get(event).forEach(callback => callback(data));
        }
    }

    doAction(action, data) {
        if (!this.enabled) return
        if (!this.socket) return;

        this.socket.emit("do_action", {
            token: this.token,
            hub_id: this.hubID,
            action: action,
            data: data
        });
    }
}
