import logging
from flask import Blueprint, jsonify
from SQLAccounts import SQLAccounts
from token_required import token_required
from Hub_Dictionary import Hub_Dictionary
from Connection_Hub import Connection_Hub
from Socket_Connection import Socket_Connection
from Bot_Connection import Bot_Connection
from euchre.bots.Bot_1 import Bot_1
from manage_jwt import generate_jwt
from flask_socketio import SocketIO

sqlAccounts = SQLAccounts("./app/accounts.db")
logger = logging.getLogger(__name__)
quick_start_bp = Blueprint("quick_start", __name__, template_folder="../templates", static_folder="../static")
io = SocketIO(cors_allowed_origins="*") 

@quick_start_bp.route("/quick_start", methods=["POST"])
@token_required
def quick_start(token):
    user = sqlAccounts.get_user(token)
    print(user['username'])

    hub = Connection_Hub([
        Socket_Connection(user['username'], io),
        Bot_Connection("Botty", Bot_1),
        Bot_Connection("Botzilla", Bot_1),
        Bot_Connection("Botward", Bot_1),
    ]).start()

    Hub_Dictionary.singleton[hub.identity] = hub
    token = generate_jwt(user['username'], hub.identity)
    return jsonify({"status": "success", "message": "game created", "token": token})

def quick_start_init(app):
    io.init_app(app)