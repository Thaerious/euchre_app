import logging
from flask import render_template, Blueprint
from SQL_Anon import SQL_Anon

sql_anon = SQL_Anon("./app/anon.db")
logger = logging.getLogger(__name__)
templates_bp = Blueprint("templates", __name__, template_folder="../templates", static_folder="../static")

# Template Page 'Root'
@templates_bp.route("/")
def index():
    return render_template("lobby.html")

@templates_bp.route("/elements/<filename>.html")
def component(filename):
    return render_template(f"/elements/{filename}.html")