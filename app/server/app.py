import traceback
import logging
from flask import Flask, render_template, jsonify, request, redirect, make_response
from flask_socketio import SocketIO, emit
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity, decode_token
from datetime import timedelta
from sqlite3 import IntegrityError
from euchre.bots.Bot_1 import Bot_1
from Connection_Hub import Connection_Hub
from Socket_Connection import Socket_Connection
from Bot_Connection import Bot_Connection
from SQLAccounts import SQLAccounts
from token_required import token_required

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    filename='server.log',  # Log messages will be written to app.log
    filemode='w'            # 'w' for write (overwrites each time), 'a' for append
)

logger = logging.getLogger(__name__)

app = Flask(__name__, template_folder="../templates", static_folder="../static")
app.config["SECRET_KEY"] = "your_secret_key"
app.config["JWT_SECRET_KEY"] = "your_jwt_secret"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)  # Extend expiration
app.config["DEBUG"] = False

logging.getLogger("werkzeug").disabled = True

socketio = SocketIO(app, cors_allowed_origins="*")  # Enable CORS if needed
jwt = JWTManager(app)

hub_dict = {}
sqlAccounts = SQLAccounts("./app/accounts.db")

# Template Page 'Root'
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/create")
def create():
    return render_template("create.html")

# Template Page 'Landing'
@app.route("/landing")
@token_required
def landing():
    return render_template("landing.html")

# Template Page 'Game'
@app.route("/game/<identity>")
@token_required
def play_game(identity):
    return render_template("game.html")

# Template Page 'Game' for dev
@app.route("/gamedev")
def play_gamedev():
    return render_template("game.html")

# API endpoint 'Login'
@app.route("/logout", methods=["POST"])
def logout():
    token = request.cookies.get("session_token")
    response = make_response(redirect('/'))
    response.delete_cookie('session_token')
    sqlAccounts.delete_session(token)
    return response

# API endpoint 'Login'
@app.route("/login", methods=["POST"])
def login():
    try:
        data = request.json
        if not data: return jsonify({"message": "Missing credentials"}), 400
        if "username" not in data: return jsonify({"message": "Missing credentials"}), 400
        if "password" not in data: return jsonify({"message": "Missing credentials"}), 400

        username = data.get("username")
        password = data.get("password")

        if not sqlAccounts.verify_user(username, password):
            logger.info(f"Invalid credentials: {username}")
            return jsonify({"message": "Invalid credentials"}), 401

        # todo check for account verification

        session_token = sqlAccounts.create_session(username)
        logger.info(f"Valid login: {username}")
        response = jsonify({"message": "login success"})   
        response.set_cookie(
                "session_token", 
                session_token, 
                httponly=True, 
                secure=True, 
                samesite="Strict"
            )        
        return response
    except Exception as ex:
        logger.warning(str(ex))
        return jsonify({"message": "Server error"}), 500

# API endpoint 'Create Account'
@app.route("/create_account", methods=["POST"])
def createAccount():
    try:
        data = request.json
        if not data: return jsonify({"message": "Missing credentials"}), 400
        if "username" not in data: return jsonify({"message": "Missing credentials"}), 400
        if "email" not in data: return jsonify({"message": "Missing credentials"}), 400        
        if "password" not in data: return jsonify({"message": "Missing credentials"}), 400

        username = data.get("username")
        email = data.get("email")
        password = data.get("password")

        if sqlAccounts.user_exists(username):
            logger.info(f"Username already in use: {username}")
            return jsonify({"message": "Username or email already in use."}), 409

        if sqlAccounts.email_exists(email):
            logger.info(f"Email already in use: {email}")
            return jsonify({"message": "Username or email already in use."}), 409

        sqlAccounts.add_user(username, email, password)
        logger.info(f"Account Created: {username}")
        return jsonify({"message": "Account Created"}), 201
    except Exception as ex:
        logger.warning(str(ex))
        return jsonify({"message": "Server error"}), 500

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