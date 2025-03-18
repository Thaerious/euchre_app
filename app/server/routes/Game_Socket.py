from flask_socketio import SocketIO, disconnect, emit
from flask import request
from manage_jwt import validate_jwt
from Hub_Dictionary import Hub_Dictionary

class GameSocket:
    def __init__(self, app):
        """Initialize SocketIO and register event handlers."""
        self.io = SocketIO(app, cors_allowed_origins="*")
        self.register_events()

    def register_events(self):
        """Register WebSocket event handlers."""

        @self.io.on('connect')
        def handle_connect():
            token = request.args.get("token")
            payload = validate_jwt(token)
            print(f"User {payload["username"]} connected via WebSocket.")                      