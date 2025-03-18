import logging
from flask import jsonify, request, Blueprint, redirect
from SQLAccounts import SQLAccounts

sqlAccounts = SQLAccounts("./app/accounts.db")
logger = logging.getLogger(__name__)
create_account_bp = Blueprint("create_account", __name__, template_folder="../templates", static_folder="../static")

@create_account_bp.route("/create_account", methods=["POST"])
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