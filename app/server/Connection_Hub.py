from Game_Connection import Game_Connection
from euchre import Game, Snapshot
import random

class Connection_Hub:
    def __init__(self, connections:list[Game_Connection]):
        self.connections = {connection.name: connection for connection in connections} 
        self.identity = ''.join(random.choices('0123456789abcdef', k=8))

    def run(self):
        names = list(self.connections.keys())
        random.shuffle(names)        
        self.game = Game(names)
        self.game.register_hook("after_input", self.report_after) 
        self.game.input(None, "start", None)
        self.emit_snapshots()

        # while self.game.current_state != 0:
        #     name = self.game.current_player.name
        #     connection = self.connections[name]
        #     descision = connection.get_decision()
        #     self.game.input(name, descision[0], descision[1])
        #     self.emit_snapshots()

        return self

    def emit_snapshots(self):
        for name in self.connections:
            connection = self.connections[name]
            snapshot = Snapshot(self.game, name)
            connection.send_snapshot(snapshot)

    def emit_snapshot(self, name):        
        snapshot = Snapshot(self.game, name)
        self[name].send_snapshot(snapshot)

    def __getitem__(self, index) -> Game_Connection:
        return self.connections[index]

    def report_after(self, prev_state, action, data):
        if self.game.last_player is None:
            print(f"{action}")
        elif data is None:
            print(f"{self.game.last_player.name} {action}")
        else:
            print(f"{self.game.last_player.name} {action} {data}")        