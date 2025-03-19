import threading
from flask_socketio import SocketIO
from euchre import Snapshot
from Game_Connection import Game_Connection
from decorators.game_token_req import game_token_req

class Socket_Connection(Game_Connection):
    def __init__(self, name:str, app):
        super().__init__(name)
        self.snapshot = None  
        self.last_action = None
        self.username = None
        self.hub_id = None     
        self.condition = threading.Condition()
        self.io = SocketIO(app, cors_allowed_origins="*")           
        self.register_events()

    def register_events(self):
        """Register WebSocket event handlers."""

        @self.io.on('connect')
        @game_token_req
        def handle_connect(username, hub_id):
            self.username = username
            self.hub_id = hub_id
            print(f"User {username} connected via WebSocket to hub {hub_id}.") 
            if self.snapshot is not None: self.send_snapshot()

        """
        Update the last_action fields which will get read by the hub when required.
        See #get_decision.
        """
        @self.io.on('do_action')
        def do_action(data):
            print(f"User {self.username} do action {data}.")
            with self.condition:
                self.last_action = (data["action"], data["data"])
                self.condition.notify()

    def send_snapshot(self, snapshot:Snapshot = None):
        if snapshot is not None: self.snapshot = snapshot
        self.io.emit("snapshot", self.snapshot.to_json())

    def send_message(self, string):
        self.io.emit("message", string)

    def get_decision(self):
        with self.condition:
            while self.last_action is None: 
                self.condition.wait()
            
            decision = self.last_action
            self.last_action = None
            return decision
