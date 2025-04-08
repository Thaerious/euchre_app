from euchre import Snapshot
from Connection_Interface import Connection_Interface

class Bot_Connection(Connection_Interface):
    def __init__(self, name:str, bot_class):
        super().__init__(name)
        self.bot = bot_class()
        self.snapshot = None

    def emit_snapshot(self, snapshot:Snapshot):
        self.snapshot = snapshot

    def get_decision(self):
        if self.snapshot == None: raise Exception("Snapshot not set.")
        return self.bot.decide(self.snapshot)
