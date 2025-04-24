# Socket_Connection.py
import threading
from Connection_Interface import Connection_Interface
from SQL_Anon import User_Record
from euchre import Snapshot

class Socket_Connection(Connection_Interface):
    def __init__(self, user:User_Record):
        super().__init__(user.username)
        self._user = user
        self.snapshot = None  
        self.last_action = None
        self.condition = threading.Condition()

    @property
    def user(self):
        return self._user

    @user.setter
    def user(self, value):
        if self.user.username != value.username:
            raise Exception("usernames do not match")       
        self._user = value

    def set_decision(self, data):
        with self.condition:
             self.last_action = (data["action"], data["data"])
             self.condition.notify()

    def emit_snapshot(self, snapshot = None):
        if snapshot is not None: self.snapshot = snapshot  
        if self.snapshot is None: return

        if not isinstance(self.snapshot, Snapshot):
            raise TypeError(f"Expected type '{Snapshot.__name__}' found '{type(snapshot).__name__}'")        

        self._user.emit("snapshot", self.snapshot)

    def emit(self, event, string):
        self._user.emit(event, string)

    def get_decision(self):
        with self.condition:
            while self.last_action is None: 
                if not self._user.is_connected():
                    raise ConnectionError(f"Client {self._user.username} disconnected.")                
                self.condition.wait(timeout = 1)
            
            decision = self.last_action
            self.last_action = None
            return decision 