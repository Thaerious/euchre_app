from flask import Flask, render_template, jsonify, request
from flask_socketio import SocketIO, send, emit
from euchre import Game, Snapshot
import random

app = Flask(__name__)
app.config["SECRET_KEY"] = "your_secret_key"  # Required for sessions
socketio = SocketIO(app, cors_allowed_origins="*")  # Enable CORS if needed

game_dictionary = {}

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/start_game", methods=["POST"])
def start_game():
    data = request.json
    username = data.get("username", "Unknown Player") 
    print(data)

    hash = ''.join(random.choices('0123456789abcdef', k=8))
    game = Game(["Player1", "Player2", "Player3", "Player4"])
    game_dictionary[hash] = game

    json_response = jsonify({"status": "success", "message": f"Game started by {username}!", "hash": hash})
    return json_response

@app.route("/game/<game_hash>")
def play_game(game_hash):
    print(f"Player accessed game with hash: {game_hash}")
    return render_template("game.html", game_hash=game_hash)

# ---- WebSocket Events ----

@socketio.on("request_snapshot")
def request_snapshot(data):
    game_hash = data["game_hash"]
    username = data["username"]

    game = game_dictionary[game_hash]
    snap = Snapshot(game, username)
    json = snap.to_json()
    emit("snapshot", json)

if __name__ == "__main__":
    socketio.run(app, debug=True)