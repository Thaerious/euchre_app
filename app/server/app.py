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

from routes.templates import templates_bp
from routes.login import login_bp
from routes.logout import logout_bp
from routes.create_account import create_account_bp
from routes.quick_start import quick_start_bp

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    filename='server.log',  # Log messages will be written to app.log
    filemode='w'            # 'w' for write (overwrites each time), 'a' for append
)

logger = logging.getLogger(__name__)
logging.getLogger("werkzeug").disabled = True

app = Flask(__name__, template_folder="../templates", static_folder="../static")
app.config["SECRET_KEY"] = "your_secret_key"
app.config["JWT_SECRET_KEY"] = "your_jwt_secret"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)  # Extend expiration
app.config["DEBUG"] = False

socketio = SocketIO(app, cors_allowed_origins="*")  # Enable CORS if needed
jwt = JWTManager(app)

hub_dict = {}
sqlAccounts = SQLAccounts("./app/accounts.db")

# Routes Registration
app.register_blueprint(templates_bp)
app.register_blueprint(login_bp)
app.register_blueprint(logout_bp)
app.register_blueprint(create_account_bp)
app.register_blueprint(quick_start_bp)

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