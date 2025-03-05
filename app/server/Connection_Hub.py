from Game_Connection import Game_Connection
from euchre import Game, Snapshot, EuchreException
import threading
import random

class Connection_Hub:
    def __init__(self, connections:list[Game_Connection]):
        self.connections = {connection.name: connection for connection in connections} 
        self.identity = ''.join(random.choices('0123456789abcdef', k=8))
        self.thread = None
        self.is_running = False

    def start(self):
        self.is_running = True
        self.thread = threading.Thread(target=self.run, args=())
        self.thread.start()
        return self

    def stop(self):
        self.is_running = False
        self.thread.join()

    def run(self):
        names = list(self.connections.keys())
        # random.shuffle(names)   todo reenable     
        self.game = Game(names)
        self.game.register_hook("after_input", self.report_after) 
        self.game.input(None, "start", None)
        self.emit_snapshots()

        while self.game.current_state != 0 and self.is_running:
            try:
                if self.game.current_state in [1, 2, 3, 4, 5]:
                    name = self.game.current_player.name
                    connection = self.connections[name]
                    descision = connection.get_decision() # this blocks
                    self.game.input(name, descision[0], descision[1])
                    self.emit_snapshots()
                else:
                    self.game.input(None, "continue", None)
                    self.emit_snapshots()
            except EuchreException as ex:
                connection = self.connections[name]
                connection.send_message(ex.to_json())

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

    def report_after(self, player, prev_state, action, data):
        if player is None:
            print(f"Server: {action}")
        elif data is None:
            print(f"{player}: {action}")
        else:
            print(f"{player}: {action} {data}")        