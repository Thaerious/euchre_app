from flask_socketio import SocketIO
from flask import request
from manage_jwt import validate_jwt
from Hub_Dictionary import Hub_Dictionary
from game_token_req import game_token_req

class GameSocket:
    def __init__(self, app):
        """Initialize SocketIO and register event handlers."""
        self.io = SocketIO(app, cors_allowed_origins="*")
        self.register_events()

    def register_events(self):
        """Register WebSocket event handlers."""

        @self.io.on('connect')
        @game_token_req
        def handle_connect(username, hub_id):
            print(f"User {username} connected via WebSocket to hub {hub_id}.")                      