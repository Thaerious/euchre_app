import logging
from flask import make_response, request, Blueprint, redirect
from SQLAccounts import SQLAccounts
from token_required import token_required

sqlAccounts = SQLAccounts("./app/accounts.db")
logger = logging.getLogger(__name__)
quick_start_bp = Blueprint("quick_start", __name__, template_folder="../templates", static_folder="../static")

@quick_start_bp.route("/quick_start", methods=["POST"])
@token_required
def quick_start():
    pass
    # username = get_jwt_identity()

    # hub = Connection_Hub([
    #     Socket_Connection(username),
    #     Bot_Connection("Botty", Bot_1),
    #     Bot_Connection("Botzilla", Bot_1),
    #     Bot_Connection("Botward", Bot_1),
    # ]).start()

    # hub_dict[hub.identity] = hub
    # return jsonify({"status": "success", "message": "game created", "identity": hub.identity})
