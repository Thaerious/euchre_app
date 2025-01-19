const urlParts = window.location.pathname.split("/");
const gameHash = urlParts[urlParts.length - 1];
const token = localStorage.getItem("access_token");

(() => {
    if (!token) {
        alert("You must log in first.");
        return;
    }

    const socket = io.connect("http://" + document.domain + ":" + location.port);

    socket.on("auth_error", (data) => {
        window.alert(data.message)
    });

    socket.on("snapshot", (data) => {
        window.updateView(JSON.parse(data))
    });

    getSnapshot(socket)
})()

function getSnapshot(socket) {
    const token = localStorage.getItem("access_token");    
    socket.emit("request_snapshot", { game_hash: gameHash, token: token });
}


