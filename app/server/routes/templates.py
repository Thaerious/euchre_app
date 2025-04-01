import logging
from flask import render_template, Blueprint, redirect
from SQL_Accounts import SQL_Accounts
from SQL_Anon import SQL_Anon
from decorators.fetch_auth_token import fetch_auth_token
from decorators.fetch_anon_token import fetch_anon_token

sqlAccounts = SQL_Accounts("./app/accounts.db")
sql_anon = SQL_Anon("./app/anon.db")
logger = logging.getLogger(__name__)
templates_bp = Blueprint("templates", __name__, template_folder="../templates", static_folder="../static")

# Template Page 'Root'
@templates_bp.route("/")
@fetch_auth_token
def index(token):
    # if token is not None: return redirect("/landing")
    return render_template("landing.html") # set to landing until there is logged in content

@templates_bp.route("/elements/<filename>.html")
def component(filename):
    return render_template(f"/elements/{filename}.html")

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

# Template for private game staging area.
@templates_bp.route("/staging")
def guest_staging():    
    return render_template("guest_staging.html")