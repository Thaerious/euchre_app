from euchre import Snapshot

class Connection_Interface:
    def __init__(self, name:str):
        self._name = name

    def emit_snapshot(self, snapshot:Snapshot):
        pass

    def emit_message(self, string):
        pass

    def get_decision(self):
        pass

    @property
    def name(self):
        return self._name
