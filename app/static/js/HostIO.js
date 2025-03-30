class EuchreException extends Error {
    constructor(message) {
        super(message)
    }
}

export default class GameIO {
    constructor() {
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

        this.socket.on("update_names", (dataJSON) => {
            const data = JSON.parse(dataJSON)
            console.log(data)

            for (const seat in data) {
                console.log(seat, data[seat])
                if (seat == 0) {
                    const startButton = document.querySelector("#start_button")
                    startButton.classList.remove("disabled")
                    document.querySelector(`#username_txt.textbox-inner`).value = data[seat]    
                }
                else {
                    document.querySelector(`#player_${seat}_name`).textContent = data[seat]                    
                }                
            }
        })
    }

    setName(name) {
        this.socket.emit("set_name", {
            name: name
        });
    }
}
