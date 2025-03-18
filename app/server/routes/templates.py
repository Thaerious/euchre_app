import logging
from flask import render_template, Blueprint
from SQLAccounts import SQLAccounts
from token_required import token_required

sqlAccounts = SQLAccounts("./app/accounts.db")
logger = logging.getLogger(__name__)
templates_bp = Blueprint("templates", __name__, template_folder="../templates", static_folder="../static")

# Template Page 'Root'
@templates_bp.route("/")
def index():
    return render_template("index.html")

@templates_bp.route("/create")
def create():
    return render_template("create.html")

# Template Page 'Landing'
@templates_bp.route("/landing")
@token_required
def landing():
    return render_template("landing.html")

# Template Page 'Game'
@templates_bp.route("/game/<identity>")
@token_required
def play_game(identity):
    return render_template("game.html")