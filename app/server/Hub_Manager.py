from Auto_Key_Dict import Auto_Key_Dict
from Game_Hub import Game_Hub
from SQL_Anon import SQL_Anon
from Socket_Connection import Socket_Connection
from Bot_Connection import Bot_Connection
from euchre.bots import Bot_2
from constants import *
import os
import pickle

class Hub_Manager(Auto_Key_Dict):
    SAVE_LOC = "./saves"

    def __init__(self):
        super().__init__("game_token")
        os.makedirs(Hub_Manager.SAVE_LOC, exist_ok=True)

    def __getitem__(self, game_token):
        if not game_token in self:
            self.load_hub(game_token)

        return super().__getitem__(game_token)

    def save_hubs(self):
        for game_token in self:      
            self.save_hub(game_token, self[game_token])      

    def save_hub(self, game_token, hub):
        hub = self[game_token]
        game = hub.game
        full_path = os.path.join(Hub_Manager.SAVE_LOC, f"{hub.game_token}.hub")

        with open(full_path, "wb") as fp:                
            pickle.dump(game, fp)    

    def load_hub(self, game_token):
        full_path = os.path.join(Hub_Manager.SAVE_LOC, f"{game_token}.hub")

        with open(full_path, "rb") as fp:                
            game = pickle.load(fp)
            self.rehydrate(game_token, game)

    def rehydrate(self, game_token, game):
            sql_anon = SQL_Anon()

            # Create & store a hub
            hub = Game_Hub(game_token)
            hub.game = game
            self.add(hub)

            # Populate bot connections
            for bot_row in sql_anon.get_bots(game_token):
                hub.add_connection(Bot_Connection(bot_row["name"], Bot_2)) # todo differentiate versions

            # Retart the hub
            hub.start_thread()            