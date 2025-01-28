from euchre import *
from euchre.bots import Bot
from euchre.bots.DevBot import DevBot

class Game_Instance:

    def __init__(self, username, socketio):
        self.socketio = socketio  # Store WebSocket reference
        names = ["Bot_1", "Bot_2", "Bot_3", username]        
        self.game = Game(names)
        self.username = username  
        self.bot = DevBot()       

        self.game.register_hook("before_input", self.report_before) 
        self.game.register_hook("after_input", self.report_after) 

    def report_before(self, action, data):
        print(f"------------------------------------------ {self.game.hash}")
        print(f"{self.game.current_player}")
        if self.game.up_card is not None: 
            print(f"up card {self.game.up_card}")
        if len(self.game.tricks) > 0: 
            print(f"trick {self.game.tricks[-1]}")           

    def report_after(self, prev_state, action, data):
        if data is None:
            print(f"({self.game.last_action}) {prev_state} -> {self.game.current_state}")  
        else:    
            print(f"({self.game.last_action}:{data}) {prev_state} -> {self.game.current_state}")  

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
            
     
