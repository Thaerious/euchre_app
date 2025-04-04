import logging
from flask import Blueprint, jsonify, redirect
from SQL_Accounts import SQL_Accounts
from SQL_Games import SQL_Games
from decorators.fetch_auth_token import fetch_auth_token
from Connection_Hub import Connection_Hub
from Socket_Connection import Socket_Connection
from Bot_Connection import Bot_Connection
from euchre.bots.Bot_1 import Bot_1
from manage_jwt import generate_jwt

sql_accounts = SQL_Accounts("./app/accounts.db")
sql_games = SQL_Games("./app/accounts.db")
logger = logging.getLogger(__name__)
quick_start_bp = Blueprint("quick_start", __name__, template_folder="../templates", static_folder="../static")

def quick_start_factory(io, sql_games):
    @quick_start_bp.route("/quick_start", methods=["POST"])
    @fetch_auth_token
    def quick_start(token):
        if token is None: return redirect("index.html")        
        user = sql_accounts.get_user(token)

        hub = Connection_Hub([
            Socket_Connection(user['username'], io),
            Bot_Connection("Botty", Bot_1),
            Bot_Connection("Botzilla", Bot_1),
            Bot_Connection("Botward", Bot_1),
        ]).start()

        sql_games.add_hub(hub)
        token = generate_jwt(user['username'], hub.identity)
        return jsonify({"status": "success", "message": "game created", "token": token})
    
    return quick_start_bp