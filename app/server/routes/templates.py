import logging
from flask import render_template, Blueprint, redirect
from SQL_Accounts import SQL_Accounts
from decorators.fetch_token import fetch_auth_token

sqlAccounts = SQL_Accounts("./app/accounts.db")
logger = logging.getLogger(__name__)
templates_bp = Blueprint("templates", __name__, template_folder="../templates", static_folder="../static")

# Template Page 'Root'
@templates_bp.route("/")
@fetch_auth_token
def index(token):
    # if token is not None: return redirect("/landing")
    return render_template("landing.html") # set to landing until there is logged in content

@templates_bp.route("/create")
def create():
    return render_template("create.html")

# Template Page 'Landing'
@templates_bp.route("/landing")
@fetch_auth_token
def landing(token):
    logged_in = token is not None
    return render_template("landing.html", logged_in = logged_in)

# Template Page 'Game'
@templates_bp.route("/game")
@fetch_auth_token
def play_game(token):    
    # if token is None: return redirect("/")    
    return render_template("game.html")