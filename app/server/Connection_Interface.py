from euchre import Snapshot

class Connection_Interface:
    def __init__(self, id:str):
        self._identifier = id

    def emit_snapshot(self, snapshot:Snapshot):
        raise NotImplementedError("emit_snapshot")

    def emit_message(self, string):
        raise NotImplementedError("emit_message")

    def get_decision(self):
        raise NotImplementedError("get_decision")

    @property
    def id(self):
        return self._identifier
