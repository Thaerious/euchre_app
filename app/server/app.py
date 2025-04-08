import logging
from flask import Flask
from flask_socketio import SocketIO
from flask_jwt_extended import JWTManager
from datetime import timedelta
from routes.templates import templates_bp
from routes.Host_Endponts import Host_Endpoints
from routes.Game_Endpoints import Game_Endpoints
from Hub_Collection import Hub_Collection
from constants import *
import os

print("\nStarting Euchre Server")
print("----------------------")

os.makedirs(LOG_DIR, exist_ok=True)  # Create the directory if it doesn't exist

logging.basicConfig(
    level    = logging.DEBUG,
    format   ='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    filename = os.path.join(LOG_DIR, "server.log"),
    filemode = 'w' # 'w' for write (overwrites each time), 'a' for append
)

logger = logging.getLogger(__name__)
# logging.getLogger("werkzeug").disabled = True

app = Flask(__name__, template_folder="../templates", static_folder="../static")
app.config["SECRET_KEY"] = "your_secret_key"
app.config["JWT_SECRET_KEY"] = "your_jwt_secret"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)  # Extend expiration
app.config["DEBUG"] = False

jwt = JWTManager(app)

websocket = SocketIO(app, cors_allowed_origins="*") 

# Routes Registration
hubs = Hub_Collection()
app.register_blueprint(templates_bp)
Host_Endpoints(app, websocket,hubs)
Game_Endpoints(app, websocket, hubs)

if __name__ == "__main__":    
    websocket.run(app, debug=True)   