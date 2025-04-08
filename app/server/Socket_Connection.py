import threading
from Connection_Interface import Connection_Interface
from SQL_Anon import User

class Socket_Connection(Connection_Interface):
    def __init__(self, user:User):
        super().__init__(user.username)
        self.user = user
        self.snapshot = None  
        self.last_action = None
        self.condition = threading.Condition()

    def set_decision(self, data):
        with self.condition:
             self.last_action = (data["action"], data["data"])
             self.condition.notify()

    def emit_snapshot(self, snapshot = None):
        if snapshot is not None: self.snapshot = snapshot  
        if self._room is None: return
        self.user.emit("snapshot", self.snapshot.to_json())

    def emit_message(self, string):
        self.user.emit("message", string)

    def add_decision(self):
        with self.condition:
            while self.last_action is None: 
                self.condition.wait()
            
            decision = self.last_action
            self.last_action = None
            return decision
