import EventEmitter from "./Event_Emitter.js"

export default class BaseIO extends EventEmitter {
    constructor(namespace) {
        super()

        this.socket = io(namespace);

        this.socket.on("connect", () => {
            // console.log("Connected to WebSocket!");
        });

        this.socket.on("connect_error", (error) => {
            // console.log("Connection error:", error);
            window.alert(data.message)
        });

        this.socket.on("disconnect", () => {
            // console.log("Disconnected from WebSocket.");
        });

        this.socket.on("socket_error", (data) => {
            // console.error("Socket Error:", data);
            window.alert(data.message)
        });
        
        this.socket.onAny((event, ...args) => {   
            if (event.startsWith("response:")){
                return
            }

            if (args.length > 0) {
                const data = JSON.parse(args[0])    
                // console.log("IO Received Event:", event, data);
                this.emit(event, data)
            } else {
                // console.log("IO Received Event:", event);
                this.emit(event, null)
            }
        });
    }
}
