from euchre import Snapshot
from Game_Connection import Game_Connection

class Socket_Connection(Game_Connection):
    def __init__(self, name:str):
        super().__init__(name)
        self._socketio = None
        self.snapshot = None  
        self.last_action = None

    @property
    def socketio(self):
        return self._socketio
    
    @socketio.setter
    def socketio(self, value):
        self._socketio = value
        self._socketio.on_event("request_snapshot", lambda data: self.send_snapshot())
        self._socketio.on_event("on_action", lambda data: self.on_action(data))

    def send_snapshot(self, snapshot:Snapshot = None):
        if snapshot is not None: self.snapshot = snapshot
        if self._socketio is None: return
        self._socketio.emit("snapshot", self.snapshot.to_json())

    def get_decision(self):
        return self.last_action
    
    def on_action(self, data):
        self.last_action = (data["action"], data["data"])
    
