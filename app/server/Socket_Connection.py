from euchre import Snapshot
from Game_Connection import Game_Connection
import threading

class Socket_Connection(Game_Connection):
    def __init__(self, name:str, io):
        super().__init__(name)
        self._socketio = io
        self.snapshot = None  
        self.last_action = None
        self.condition = threading.Condition()

    @property
    def io(self):
        return self._socketio
    
    @io.setter
    def io(self, value):
        self._socketio = value
        self._socketio.on_event("request_snapshot", lambda data: self.send_snapshot())
        self._socketio.on_event("do_action", lambda data: self.do_action(data))

    def send_snapshot(self, snapshot:Snapshot = None):
        if snapshot is not None: self.snapshot = snapshot
        if self._socketio is None: return
        self._socketio.emit("snapshot", self.snapshot.to_json())

    def send_message(self, string):
        self._socketio.emit("message", string)

    def get_decision(self):
        with self.condition:
            while self.last_action is None: 
                self.condition.wait()
            
            decision = self.last_action
            self.last_action = None
            return decision
    
    def do_action(self, data):
        with self.condition:
            self.last_action = (data["action"], data["data"])
            self.condition.notify()
