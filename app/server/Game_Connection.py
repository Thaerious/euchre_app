from euchre import Snapshot

class Game_Connection:
    def __init__(self, name:str):
        self._name = name

    def send_snapshot(self, snapshot:Snapshot):
        pass

    def get_decision(self):
        pass

    @property
    def name(self):
        return self._name

    


