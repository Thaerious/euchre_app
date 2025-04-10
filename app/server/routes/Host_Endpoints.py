import logging
from flask import render_template, request, url_for, redirect
from SQL_Anon import SQL_Anon, User, Game
from decorators.fetch_anon_token import fetch_anon_token, get_anon_token
from decorators.fetch_user import fetch_user
import sqlite3
from constants import *
import random
from Game_Hub import Game_Hub
from Socket_Connection import Socket_Connection
from Bot_Connection import Bot_Connection
from euchre.bots.Bot_2 import Bot_2
from Hub_Manager import Hub_Manager
from logger_factory import logger_factory

logger = logger_factory(__name__, "HOST")

class Host_Endpoints:
    NAMESPACE = "/host"

    def __init__(self, app, io, hubs):
        User.io = io
        self.io = io
        self.hubs:Hub_Manager = hubs
        self.sql_anon = SQL_Anon(filename="./app/anon.db", namespace=self.NAMESPACE)        

        app.add_url_rule("/lobby", view_func=self.lobby, endpoint="lobby")
        app.add_url_rule("/host", view_func=self.host_game, endpoint="host")        
        app.add_url_rule("/join/<game_token>", view_func=self.join_game)
        app.add_url_rule("/exit_lobby", view_func=self.exit_lobby, methods=["POST"])                
        
        io.on_event('connect', self.on_connect, namespace=self.NAMESPACE)
        io.on_event('disconnect', self.on_disconnect, namespace=self.NAMESPACE)
        io.on_event('set_name', self.on_set_name, namespace=self.NAMESPACE)
        io.on_event('kick_player', self.on_kick_player, namespace=self.NAMESPACE)
        io.on_event('start_game', self.on_start_game, namespace=self.NAMESPACE)

    # /lobby template endpoint
    @fetch_anon_token
    def lobby(self):
        logger.info("/lobby")
        return render_template("lobby.html")

    # /host template endpoint
    @fetch_anon_token
    def host_game(self, user_token):
        logger.info("/host")
        game_rec = None
        user = self.sql_anon.get_user(user_token)

        if user is None:
            game_rec = self.sql_anon.create_game(user_token)
            user = self.sql_anon.get_user(user_token)
        else:            
            game_rec = self.sql_anon.get_game(user.game_token)

        return render_template("host.html", 
                                game_token = user.game_token,
                                seat = user.seat,
                                names = game_rec.names
                              )        

    # /join template endpoint
    @fetch_anon_token
    def join_game(self, game_token, user_token):  
        logger.info("/exit_lobby")  
        user = self.sql_anon.get_user(user_token) 

        if user is None:
            # if user is not in a game
            self.sql_anon.join_game(user_token, game_token)
            user = self.sql_anon.get_user(user_token)
        elif user.seat == 0: 
            # if user is the game's host
            return redirect(url_for('host'))    
        elif user.game_token == game_token:
            # user is already in specified game
            pass
        else: 
            # if user is in another game
            self.sql_anon.remove_user(user_token)
            self.sql_anon.join_game(user_token, game_token)

        game_rec = self.sql_anon.get_game(game_token)
        return render_template("join.html", 
                                game_token = user.game_token,
                                seat = user.seat,
                                names = game_rec.names
                              )  

    # /exit_lobby template endpoint
    # if the host leaves, all players are removed
    @fetch_user()
    def exit_lobby(self, user):
        logger.info("/exit_lobby")
        if user.seat == 0:
            game_rec = self.sql_anon.get_game(user.game_token)
            self.sql_anon.remove_game(user.game_token)
            game_rec.emit("game_cancelled", {})
        else:
            self.sql_anon.remove_user(user.user_token)
            game_rec = self.sql_anon.get_game(user.game_token)
            game_rec.emit("update_names", game_rec.names)

        return redirect(url_for('lobby', reason='game cancelled'))

    # websocket connect handler 
    @fetch_user()
    def on_connect(self, auth, user):
        logger.info("ws:connect")
        self.sql_anon.set_ws_room(user.user_token, request.sid)
        self.sql_anon.set_connected(user.user_token, True)
        user = user.refresh()

        get_game_rec = self.sql_anon.get_game(user.game_token)
        get_game_rec.emit("update_names", get_game_rec.names)

    # websocket disconnect handler
    def on_disconnect(self, reason=None):
        logger.info("ws:disconnect")
        user_token = get_anon_token()
        user = self.sql_anon.get_user(user_token)

        if user is not None:
            self.sql_anon.set_connected(user.user_token, False)
            game_rec = self.sql_anon.get_game(user.game_token)
            game_rec.emit("update_names", game_rec.names)            

    # websocket set name endpoint
    @fetch_user()
    def on_set_name(self, data, user):
        logger.info("ws:set_name")
        try:
            self.sql_anon.set_name(user.user_token, data["name"])   
            user.emit("response: set_name", True)
            get_game_rec = self.sql_anon.get_game(user.game_token)
            get_game_rec.emit("update_names", get_game_rec.names)
        except sqlite3.IntegrityError:
             user.emit("response: set_name", False)

    @fetch_user()
    def on_kick_player(self, data, user):
        logger.info("ws:kick_player")
        target = self.sql_anon.get_seat(data["seat"], user.game_token)
        if target is None: return

        self.sql_anon.remove_user(target.user_token)
        target.emit("kicked", {})
        game_rec = self.sql_anon.get_game(user.game_token)
        game_rec.emit("update_names", game_rec.names)

    @fetch_user()
    def on_start_game(self, data, user):
        logger.info("ws:start_game")
        game_rec = self.sql_anon.get_game(user.game_token)
        self.sql_anon.set_status(game_rec.token, PLAYING)
        self.create_game(game_rec)        
        game_rec.emit("start_game")
        
    def create_game(self, game_rec:Game):
        # Create & store a game hub
        names = self.sql_anon.get_all_names(game_rec.token)
        hub = Game_Hub(game_rec.token, names)
        self.hubs.add(hub)

        # Generate bots
        for i in range(4 - game_rec.player_count):
            bot_name = BOT_NAMES.pop(random.randrange(len(BOT_NAMES)))
            hub.add_connection(Bot_Connection(bot_name, Bot_2))
            self.sql_anon.add_bot(game_rec.token, bot_name, "Bot_2")

        # Start the hub, record the seats
        hub.start_thread()
        for user in game_rec.users:
            seat = hub.game.get_player(user.username).index
            self.sql_anon.set_seat(user.user_token, seat)

        self.hubs.save_hub(game_rec.token, hub)