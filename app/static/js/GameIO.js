function saveSnapshot(snapshot){
    const _history = localStorage.getItem("snapshots") ?? "[]"
    const snapHistory = JSON.parse(_history)
    snapHistory.push(snapshot)
    localStorage.setItem("snapshots", JSON.stringify(snapHistory))    
};

class EuchreException extends Error {
    constructor(message) {
        super(message)
    }
}

export default class GameIO {
    constructor() {
        const urlParts = window.location.pathname.split("/");
        this.hubIdentity = urlParts[urlParts.length - 1];
        this.token = localStorage.getItem("access_token");
        this.snapshots = {}
        this.lastSnapshot = null
        this.events = new Map();
        this.enabled = true

        if (!this.token) {
            window.alert("You must log in first.");
            return
        }

        this.socket = io.connect("http://" + location.hostname + ":" + location.port, {
            query: { token: this.token }
        });

        this.socket.on("socket_error", (data) => {
            window.alert(data.message)
            console.error(data)
        });

        this.socket.on("snapshot", (data) => {
            const snapshot = JSON.parse(data)
            saveSnapshot(snapshot)
            this.emit("snapshot", snapshot)            
        });

        this.socket.on("message", (_data) => {
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
    emit(event, data) {
        if (this.events.has(event)) {
            this.events.get(event).forEach(callback => callback(data));
        }
    }

    joinHub() {
        if (!this.enabled) return
        if (!this.socket) return;        
        this.socket.emit("join_hub", {
            token: this.token,
            hub_identity: this.hubIdentity
        });
    }

    doAction(action, data) {
        if (!this.enabled) return
        if (!this.socket) return;

        this.socket.emit("do_action", {
            token: this.token,
            hub_identity: this.hubIdentity,
            action: action,
            data: data
        });
    }

    requestSnapshot() {
        if (!this.enabled) return
        if (!this.socket) return;
        this.socket.emit("request_snapshot", {
            token: this.token,
            identity: this.hubIdentity,
        });
    }
}
