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
exit_bp = Blueprint("exit", __name__, template_folder="../templates", static_folder="../static")

def exit_factory(io, sql_games):
    @exit_bp.route("/exit", methods=["POST"])
    @fetch_auth_token
    def exit(token):
        if token is None: return redirect("index")        
        user = sql_accounts.get_user(token)
        sql_games.remove_player(user['username'])
        return redirect("landing")    
    return exit_bp