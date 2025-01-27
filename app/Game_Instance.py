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

    def emit_snapshot(self):
        snap = Snapshot(self.game, self.username)        
        self.socketio.emit("snapshot", snap.to_json())
        print(f"emit snapshot {snap.hash}")

    def do_action(self, username, action, data):
        game = self.game
        
        print(f"------------------------------------------ {game.hash}")
        state_before = game.current_state
        print(f"{game.euchre.current_player}")
        if game.euchre.up_card is not None: 
            print(f"up card {game.euchre.up_card}")
        if len(game.euchre.tricks) > 0: 
            print(f"trick {game.euchre.tricks[-1]}")    

        game.input(username, action, data)
        print(f"({action}, {data}) {state_before} -> {game.current_state}")

        self.emit_snapshot()
        self.continue_action(username)

    def continue_action(self, username):
        sanity = 10

        while self.game.euchre.current_player.name != self.username: 
            self.bot_action()
            snap = Snapshot(self.game, username) 
            self.socketio.emit("snapshot", snap.to_json())

            sanity = sanity - 1
            if sanity == 0: raise Exception("Sanity check failed")

    def bot_action(self):
        game = self.game

        print(f"------------------------------------------ {game.hash}")
        state_before = game.current_state
        print(f"{game.euchre.current_player}")
        if game.euchre.up_card is not None: 
            print(f"up card {game.euchre.up_card}")
        if len(game.euchre.tricks) > 0: 
            print(f"trick {game.euchre.tricks[-1]}")
        snap = Snapshot(game, game.euchre.current_player.name)
        decision = self.bot.decide(snap)
        game.input(game.euchre.current_player.name, decision[0], decision[1])
        print(f"{decision} {state_before} -> {game.current_state}")
            
     
