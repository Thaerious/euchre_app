const urlParts = window.location.pathname.split("/");
const gameHash = urlParts[urlParts.length - 1];
const token = localStorage.getItem("access_token");

if (!token) {
    alert("You must log in first.");
}

const socket = token ? io.connect("http://" + document.domain + ":" + location.port) : null;

if (socket) {
    socket.on("socket_error", (data) => {
        window.alert(data.message);
    });
}

export function getSocket() {
    return socket;
}

export function requestSnapshot() {
    if (!socket) return;
    const token = localStorage.getItem("access_token");
    socket.emit("request_snapshot", {
        token: token,
        game_hash: gameHash
    });
}

export function doAction(action, data) {
    socket.emit("do_action", {
        token: token,
        game_hash: gameHash,
        action: action,
        data: data
    });
}