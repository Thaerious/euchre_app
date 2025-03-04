from euchre import Snapshot
from Game_Connection import Game_Connection

class Bot_Connection(Game_Connection):
    def __init__(self, name:str, bot_class):
        super().__init__(name)
        self.bot = bot_class()
        self.snapshot = None

    def send_snapshot(self, snapshot:Snapshot):
        self.snapshot = snapshot

    def get_decision(self):
        if self.snapshot == None: raise Exception("Snapshot not set.")
        return self.bot.decide(self.snapshot)
