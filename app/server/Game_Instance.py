from euchre import *
from euchre.bots.Bot_1 import Bot_1
from euchre.del_string import del_string
import random

class Game_Instance:

    def __init__(self, username, socketio):
        self.socketio = socketio  # Store WebSocket reference
        names = [username, "Bot_1", "Bot_2", "Bot_3"]
        random.shuffle(names)
        seed = random.randint(1, 100000)
        random.seed(seed)
  
        self.game = Game(names)                                        
        self.username = username
        self.bot = Bot_1()

        self.game.register_hook("after_input", self.report_after) 
        print(f"seed {seed}")            
        print(f"\nnames [{del_string(names, ",", '"')}]")

    def report_after(self, prev_state, action, data):
        if self.game.last_player is None:
            print(f"{action}")
        elif data is None:
            print(f"{self.game.last_player.name} {action}")
        else:
            print(f"{self.game.last_player.name} {action} {data}")

    def emit_snapshot(self):
        snap = Snapshot(self.game, self.username)        
        self.socketio.emit("snapshot", snap.to_json())

    def do_action(self, username, action, data): 
        game = self.game
        game.input(username, action, data)     
        self.emit_snapshot()
        self.continue_action(username)

    def continue_action(self, username):
        sanity = 10

        while sanity > 0: 
            if self.game.current_state == 6:
                self.game.input(None, "continue", None)
                self.emit_snapshot()
            elif self.game.current_state == 7:                
                self.game.input(None, "continue", None)
                self.emit_snapshot()
            elif self.game.current_player.name == self.username:
                break
            else:
                self.bot_action()
                snap = Snapshot(self.game, username) 
                self.socketio.emit("snapshot", snap.to_json())

            sanity = sanity - 1
        if sanity == 0: raise Exception("Sanity check failed")

    def bot_action(self):
        game = self.game
        snap = Snapshot(game, game.current_player.name)
        decision = self.bot.decide(snap)
        game.input(game.current_player.name, decision[0], decision[1])
            
     
