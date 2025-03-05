from flask import Flask, render_template, jsonify, request
from flask_socketio import SocketIO, emit
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, decode_token
from datetime import timedelta
from Connection_Hub import Connection_Hub
import traceback
from Socket_Connection import Socket_Connection
from Bot_Connection import Bot_Connection
import logging
from euchre.bots.Bot_1 import Bot_1

app = Flask(__name__, template_folder="../templates", static_folder="../static")
app.config["SECRET_KEY"] = "your_secret_key"
app.config["JWT_SECRET_KEY"] = "your_jwt_secret"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)  # Extend expiration
app.config["DEBUG"] = False
log = logging.getLogger("werkzeug")
log.disabled = True

socketio = SocketIO(app, cors_allowed_origins="*")  # Enable CORS if needed
jwt = JWTManager(app)

hub_dict = {}

# Template Page 'Root'
@app.route("/")
def index():
    return render_template("index.html")

# Template Page 'Landing'
@app.route("/landing")
def landing():
    return render_template("landing.html")

# Template Page 'Game'
@app.route("/game/<identity>")
def play_game(identity):
    return render_template("game.html")

# Template Page 'Game' for dev
@app.route("/gamedev")
def play_gamedev():
    return render_template("game.html")

# API endpoint 'Login'
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    # if username in users and users[username] == password:
    access_token = create_access_token(identity=username)
    return jsonify({"access_token": access_token})
    # return jsonify({"message": "Invalid credentials"}), 401

# API endpoint 'Quick Start'
@app.route("/quick_start", methods=["POST"])
@jwt_required()
def quick_start():
    username = get_jwt_identity()

    hub = Connection_Hub([
        Socket_Connection(username),
        Bot_Connection("Botty", Bot_1),
        Bot_Connection("Botzilla", Bot_1),
        Bot_Connection("Botward", Bot_1),
    ]).start()

    hub_dict[hub.identity] = hub
    return jsonify({"status": "success", "message": "game created", "identity": hub.identity})

# ---- WebSocket Events ----
@socketio.on('connect')
def handle_connect():
    # todo deny bad tokens
    token = request.args.get("token")
    username = verify_token(token)

# @socketio.on('disconnect')
# def handle_disconnect():
    

# finds the hub and associates websocket with the user
@socketio.on("join_hub")
def join_hub(data):
    token = data.get("token")  
    hub_identity = data.get("hub_identity")  
    username = verify_token(token)
    hub = hub_dict[hub_identity]
    hub[username].socketio = socketio

def verify_token(token):
    if not token:
        emit("auth_error", {"message": "Missing auth token"}, room=request.sid)
        return

    try:
        decoded_token = decode_token(token)
        username = decoded_token["sub"]
        return username
    except Exception as e:
        traceback.print_exc()
        print(f"Invalid Auth: {str(e)}")
        emit("socket_error", {"message": f"Invalid Auth: {str(e)}"}, room=request.sid)         

if __name__ == "__main__":
    socketio.run(app, debug=True)   