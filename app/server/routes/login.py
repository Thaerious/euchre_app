import logging
from flask import jsonify, request, Blueprint
from SQLAccounts import SQLAccounts
from decorators.fetch_token import fetch_auth_token

sqlAccounts = SQLAccounts("./app/accounts.db")
logger = logging.getLogger(__name__)
login_bp = Blueprint("login", __name__, template_folder="../templates", static_folder="../static")

@login_bp.route("/login", methods=["POST"])
@fetch_auth_token
def login():
    try:
        data = request.json
        if not data: return jsonify({"message": "Missing credentials"}), 400
        if "username" not in data: return jsonify({"message": "Missing credentials"}), 400
        if "password" not in data: return jsonify({"message": "Missing credentials"}), 400

        username = data.get("username")
        password = data.get("password")

        if not sqlAccounts.verify_user(username, password):
            logger.info(f"Invalid credentials: {username}")
            return jsonify({"message": "Invalid credentials"}), 401

        # todo check for account verification

        session_token = sqlAccounts.create_session(username)
        logger.info(f"Valid login: {username}")
        response = jsonify({"message": "login success"})   
        response.set_cookie(
                "session_token", 
                session_token, 
                httponly=True, 
                secure=True, 
                samesite="Strict"
            )        
        return response
    except Exception as ex:
        logger.warning(str(ex))
        return jsonify({"message": "Server error"}), 500