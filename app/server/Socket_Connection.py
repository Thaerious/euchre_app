import threading
from euchre import Snapshot
from Game_Connection import Game_Connection
from flask_socketio import SocketIO

class Socket_Connection(Game_Connection):
    def __init__(self, name:str, io):
        super().__init__(name)
        self.room = None
        self.snapshot = None  
        self.last_action = None
        self.username = None
        self.hub_id = None     
        self.condition = threading.Condition()
        self.io = io

    def connect(self, room):
        self.room = room
        if self.snapshot is not None:
            self.send_snapshot()

    def disconnect(self):
        self.room = None

    def set_decision(self, data):
        print(f"SocketConnection.set_decision({data})")
        with self.condition:
             self.last_action = (data["action"], data["data"])
             self.condition.notify()

    def send_snapshot(self, snapshot = None):
        if snapshot is not None: self.snapshot = snapshot  
        if self.room is None: return
        self.io.emit("snapshot", self.snapshot.to_json(), room = self.room)

    def send_message(self, string):
        if self.room is None: return
        self.io.emit("message", string, room = self.room)

    def get_decision(self):
        with self.condition:
            while self.last_action is None: 
                self.condition.wait()
            
            decision = self.last_action
            self.last_action = None
            return decision
