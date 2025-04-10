from constants import TOKEN_SIZE
from Connection_Interface import Connection_Interface
from euchre import Game, Snapshot, EuchreException
from Auto_Key_Dict import Auto_Key_Dict
import threading
import random

class Game_Hub:
    def __init__(self, game_token):
        self.connections = Auto_Key_Dict("id")
        self.game_token = game_token
        self.thread = None
        self.is_running = False

    @property
    def size(self):
        return len(self.connections)

    def add(self, connection: Connection_Interface):
        self.connections.add(connection)
        snapshot = Snapshot(self.game, connection.id)
        connection.emit_snapshot(snapshot)        

    def start(self):
        names = list(self.connections.keys())
        random.shuffle(names)
        self.game = Game(names)
        return self.restart()

    def restart(self):
        self.is_running = True
        self.thread = threading.Thread(target=self.run, args=())
        self.thread.start()        
        return self

    def stop(self):
        self.is_running = False
        self.thread.join()

    def run(self):
        if self.game.current_state == 0:
            self.game.input(None, "start", None)
            self.broadcast_snapshots()

        while self.game.current_state != 0 and self.is_running:
            try:
                if self.game.current_state in [1, 2, 3, 4, 5]:
                    name = self.game.current_player.name
                    connection = self.connections[name]
                    decision = connection.get_decision() # this blocks

                    try:
                        self.game.input(name, decision[0], decision[1])
                    except Exception as ex:
                        msg = f"Exception with connection '{connection.id}'."
                        raise RuntimeError(msg) from ex

                    self.broadcast_snapshots()
                else:
                    self.game.input(None, "continue", None)
                    self.broadcast_snapshots()
            except EuchreException as ex:
                connection = self.connections[name]
                connection.emit_message(ex.to_json())

        return self

    def broadcast_snapshots(self):
        for name in self.connections:
            connection = self.connections[name]
            snapshot = Snapshot(self.game, name)
            connection.emit_snapshot(snapshot)

    def __getitem__(self, index) -> Connection_Interface:
        return self.connections[index]
    
    def __contains__(self, key):
        return key in self.connections
    
    def __iter__(self):
        return iter(self.connections.values())

    def report_after(self, player, prev_state, action, data):
        if player is None:
            print(f"Server: {action}")
        elif data is None:
            print(f"{player}: {action}")
        else:
            print(f"{player}: {action} {data}")        