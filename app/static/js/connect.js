
const socket = io.connect("http://" + document.domain + ":" + location.port);
const urlParts = window.location.pathname.split("/");
const gameHash = urlParts[urlParts.length - 1];

socket.on("snapshot", (data) => {
    console.log(data)
});

function getSnapshot() {
    username = "Player1"
    if (username.trim() === "") {
        alert("Please enter a username.");
        return;
    }

    // Emit a WebSocket event to join the game room
    socket.emit("request_snapshot", { game_hash: gameHash, username: username });
}

getSnapshot()