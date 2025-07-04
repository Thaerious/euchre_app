from flask import render_template, request, url_for, redirect
from SQL_Anon import SQL_Anon, User_Record, Game_Record
from decorators.fetch_anon_token import user_token, get_user_token
from decorators.fetch_user import fetch_user
import sqlite3
from constants import *
import random
from Game_Hub import Game_Hub
from Bot_Connection import Bot_Connection
from euchre.bots.Bot_2 import Bot_2
from Hub_Manager import Hub_Manager
from logger_factory import logger_factory

logger = logger_factory(__name__, "HOST")

class Host_Endpoints:
    NAMESPACE = "/host"

    def __init__(self, app, io, hubs):
        User_Record.io = io
        self.io = io
        self.hubs:Hub_Manager = hubs
        self.sql_anon = SQL_Anon(filename="./app/anon.db", namespace=self.NAMESPACE)        

        app.add_url_rule("/lobby", view_func=self.lobby, endpoint="lobby")
        app.add_url_rule("/host", view_func=self.host_game, endpoint="host")        
        app.add_url_rule("/quick_start", view_func=self.quick_start, endpoint="quick_start")        
        app.add_url_rule("/join/<game_token>", view_func=self.join_game)
        app.add_url_rule("/exit_lobby", view_func=self.exit_lobby, methods=["POST"])                
        
        io.on_event('connect', self.on_connect, namespace=self.NAMESPACE)
        io.on_event('disconnect', self.on_disconnect, namespace=self.NAMESPACE)
        io.on_event('set_name', self.on_set_name, namespace=self.NAMESPACE)
        io.on_event('kick_player', self.on_kick_player, namespace=self.NAMESPACE)
        io.on_event('start_game', self.on_start_game, namespace=self.NAMESPACE)

    # /lobby template endpoint
    @user_token
    def lobby(self, user_token):
        user = self.sql_anon.get_user(user_token)
        logger.info(f"/lobby {user.username}")

        if user.game_token is not None:
            return redirect(url_for('game', reason='user already in game'))

        return render_template("lobby.html")

    # /host template endpoint
    @user_token
    def host_game(self, user_token):
        game_rec = None
        user = self.sql_anon.get_user(user_token)
        logger.info(f"/host {user.username}")

        if user.game_token is not None:
            return redirect(url_for('game', reason='user already in game'))

        game_rec = self.sql_anon.create_game(user_token)
        user = self.sql_anon.get_user(user_token)
        return render_template("host.html", 
                                game_token = user.game_token,
                                seat = user.seat,
                                names = game_rec.names
                              )        

    # /host template endpoint
    @user_token
    def quick_start(self, user_token):
        logger.info(f"/quick_start {user.username}")
        
        user = self.sql_anon.get_user(user_token)
        if user.game_token is not None:
            return redirect(url_for('game', reason='user already in game'))

        game_rec = self.sql_anon.create_game(user_token)
        self.sql_anon.set_status(game_rec.token, PLAYING)
        self.create_game_hub(game_rec)   
        game_rec.emit("start_game")
        return redirect(url_for('game', reason='quick start'))

    # /join template endpoint
    @user_token
    def join_game(self, game_token, user_token):  
        game_record = self.sql_anon.get_game(game_token)
        user_record = self.sql_anon.get_user(user_token) 
        logger.info(f"/join_game {user_record.username}")

        if not game_record:
            return redirect(url_for('lobby', reason='game not found'))
        
        if user_record.game_token:
            return redirect(url_for('game', reason='user already in game'))

        # user is not in a game
        self.sql_anon.join_game(user_token, game_token)
        user_record = self.sql_anon.get_user(user_token)

        if user_record.seat == 0: 
            # if user is the game's host
            return redirect(url_for('host'))
        else: 
            return render_template("join.html", 
                                    game_token = user_record.game_token,
                                    seat = user_record.seat,
                                    names = game_record.names
                                )  

    # /exit_lobby template endpoint
    # if the host leaves, all players are removed
    @fetch_user()
    def exit_lobby(self, user):
        logger.info(f"/exit_lobby {user.username}")
        if user.seat == 0:
            game_rec = self.sql_anon.get_game(user.game_token)
            self.sql_anon.remove_game(user.game_token)
            game_rec.emit("game_cancelled", {})
        else:
            self.sql_anon.remove_user_from_game(user.user_token)
            game_rec = self.sql_anon.get_game(user.game_token)
            game_rec.emit("update_names", game_rec.names)

        return redirect(url_for('lobby', reason='game cancelled'))

    # websocket connect handler 
    @fetch_user()
    def on_connect(self, auth, user):
        logger.info(f"ws:connect {user.username}")
        self.sql_anon.set_ws_room(user.user_token, request.sid)
        user = user.refresh()

        get_game_rec = self.sql_anon.get_game(user.game_token)
        get_game_rec.emit("update_names", get_game_rec.names)

    # websocket disconnect handler
    def on_disconnect(self, reason=None):        
        user_token = get_user_token()
        user = self.sql_anon.get_user(user_token)
        logger.info(f"ws:disconnect {user.username}")
        self.sql_anon.clear_ws_room(user.user_token)        

        if user.game_token is not None:
            game_rec = self.sql_anon.get_game(user.game_token)
            game_rec.emit("update_names", game_rec.names)            

    # websocket set name endpoint
    @fetch_user()
    def on_set_name(self, data, user):
        logger.info(f"ws:set_name {user.username}")
        try:
            self.sql_anon.set_name(user.user_token, data["name"])   
            user.emit("response: set_name", True)
            get_game_rec = self.sql_anon.get_game(user.game_token)
            get_game_rec.emit("update_names", get_game_rec.names)
        except sqlite3.IntegrityError:
             user.emit("response: set_name", False)

    @fetch_user()
    def on_kick_player(self, data, user):
        logger.info(f"ws:kick_player {user.username}")
        target = self.sql_anon.get_user_by_seat(data["seat"], user.game_token)
        if target is None: return

        self.sql_anon.remove_user_from_game(target.user_token)
        target.emit("kicked", {})
        game_rec = self.sql_anon.get_game(user.game_token)
        game_rec.emit("update_names", game_rec.names)

    @fetch_user()
    def on_start_game(self, data, user):
        logger.info(f"ws:start_game {user.username}")
        game_rec = self.sql_anon.get_game(user.game_token)
        self.sql_anon.set_status(game_rec.token, PLAYING)
        self.create_game_hub(game_rec)        
        game_rec.emit("start_game")
        
    def create_game_hub(self, game_rec:Game_Record):
        # Generate bot names
        bot_names = BOT_NAMES.copy()
        for i in range(4 - game_rec.player_count):
            bot_name = bot_names.pop(random.randrange(len(bot_names)))            
            self.sql_anon.add_bot(game_rec.token, bot_name, "Bot_2")

        # Create & store a new hub
        names = self.sql_anon.get_all_names(game_rec.token)
        hub = Game_Hub(game_rec.token, names)
        self.hubs.add(hub)

        # Generate bot connections
        for bot_row in self.sql_anon.get_bots(game_rec.token):
            hub.add_connection(Bot_Connection(bot_row["name"], Bot_2)) # todo differentiate versions

        # Start the hub, record the seats (they change when a new game is started)
        hub.start_thread()
        for user in game_rec.users:
            seat = hub.game.get_player(user.username).index
            self.sql_anon.set_seat(user.user_token, seat)

        self.hubs.save_hub(game_rec.token, hub)