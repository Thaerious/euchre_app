import logging
from flask import make_response, request, Blueprint, redirect
from SQL_Accounts import SQL_Accounts

sqlAccounts = SQL_Accounts("./app/accounts.db")
logger = logging.getLogger(__name__)
logout_bp = Blueprint("logout", __name__, template_folder="../templates", static_folder="../static")

@logout_bp.route("/logout", methods=["POST"])
def logout():
    token = request.cookies.get("session_token")
    response = make_response(redirect('/'))
    response.delete_cookie('session_token')
    sqlAccounts.delete_session(token)
    return response