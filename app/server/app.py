import logging
from flask import Flask, request
from flask_socketio import SocketIO
from flask_jwt_extended import JWTManager
from datetime import timedelta
from SQLAccounts import SQLAccounts
from Hub_Dictionary import Hub_Dictionary
from manage_jwt import validate_jwt

from routes.templates import templates_bp
from routes.login import login_bp
from routes.logout import logout_bp
from routes.create_account import create_account_bp
from routes.quick_start import quick_start_factory

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    filename='server.log',  # Log messages will be written to app.log
    filemode='w'            # 'w' for write (overwrites each time), 'a' for append
)

logger = logging.getLogger(__name__)
# logging.getLogger("werkzeug").disabled = True

app = Flask(__name__, template_folder="../templates", static_folder="../static")
app.config["SECRET_KEY"] = "your_secret_key"
app.config["JWT_SECRET_KEY"] = "your_jwt_secret"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)  # Extend expiration
app.config["DEBUG"] = False

jwt = JWTManager(app)
sqlAccounts = SQLAccounts("./app/accounts.db")

io = SocketIO(app, cors_allowed_origins="*") 

# Handle websocket dis/connect events
@io.on("connect")
def connect():
    print("io.on connect")
    token = request.args.get("token")
    payload = validate_jwt(token)
    username = payload["username"]
    hub_id = payload["hub_id"]
    Hub_Dictionary.singleton.set_sid(hub_id, username, request.sid)

@io.on("disconnect")
def disconnect():
    Hub_Dictionary.singleton.clear_sid(request.sid)

# Routes Registration
app.register_blueprint(templates_bp)
app.register_blueprint(login_bp)
app.register_blueprint(logout_bp)
app.register_blueprint(create_account_bp)
app.register_blueprint(quick_start_factory(io))

if __name__ == "__main__":    
    io.run(app, debug=True)   