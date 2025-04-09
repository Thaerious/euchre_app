from euchre import Snapshot

class Connection_Interface:
    def __init__(self, id:str):
        self._identifier = id

    def emit_snapshot(self, snapshot:Snapshot):
        pass

    def emit_message(self, string):
        pass

    def get_decision(self):
        pass

    @property
    def id(self):
        return self._identifier
