from flask import Flask, render_template, jsonify, request
from flask_socketio import SocketIO, emit
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, decode_token
from euchre import Game, Snapshot
from euchre.bots import Bot
import random
from datetime import timedelta
import traceback
from Game_Instance import Game_Instance

app = Flask(__name__)
app.config["SECRET_KEY"] = "your_secret_key"
app.config["JWT_SECRET_KEY"] = "your_jwt_secret"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)  # Extend expiration

socketio = SocketIO(app, cors_allowed_origins="*")  # Enable CORS if needed
jwt = JWTManager(app)

game_dictionary = {}

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    # if username in users and users[username] == password:
    access_token = create_access_token(identity=username)
    print(access_token)
    return jsonify({"access_token": access_token})
    # return jsonify({"message": "Invalid credentials"}), 401

@app.route("/start_game", methods=["POST"])
@jwt_required()
def start_game():
    username = get_jwt_identity() 
    hash = ''.join(random.choices('0123456789abcdef', k=8))
    game_dictionary[hash] = Game_Instance(username, socketio)
    return jsonify({"status": "success", "message": f"Game started by {username}!", "hash": hash})

@app.route("/game/<game_hash>")
def play_game(game_hash):
    username = "Adam"

    if not game_hash in game_dictionary:
        game_dictionary[game_hash] = Game_Instance(username, socketio)
        # game_dictionary[game_hash].seed = 1103

    return render_template("game.html", game_hash=game_hash)

# ---- WebSocket Events ----

def verify_websocket(data):
    token = data.get("token", None)

    if not token:
        emit("auth_error", {"message": "Missing auth token"}, room=request.sid)
        return

    try:
        decoded_token = decode_token(token)
        username = decoded_token["sub"]
        game_hash = data["game_hash"]
        return (username, game_hash)
    except Exception as e:
        traceback.print_exc()
        print(f"Invalid Auth: {str(e)}")
        emit("socket_error", {"message": f"Invalid Auth: {str(e)}"}, room=request.sid)     

@socketio.on("request_snapshot")
def request_snapshot(data):
    try:
        username, game_hash = verify_websocket(data)
        game_instance = game_dictionary[game_hash]
        game_instance.emit_snapshot()
    except Exception as e:
        traceback.print_exc()
        print(f"Invalid Auth: {str(e)}")
        emit("socket_error", {"message": f"socket_error: {str(e)}"}, room=request.sid)

@socketio.on("do_action")
def do_action(data):
    try:
        username, game_hash = verify_websocket(data)
        game_instance = game_dictionary[game_hash]
        game_instance.do_action(username, data["action"], data["data"])
    except Exception as e:
        traceback.print_exc()
        print(f"Invalid Auth: {str(e)}")
        emit("socket_error", {"message": f"socket_error: {str(e)}"}, room=request.sid)      

if __name__ == "__main__":
    socketio.run(app, debug=True)   