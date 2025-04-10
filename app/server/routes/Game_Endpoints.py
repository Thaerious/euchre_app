from flask import render_template, request
from SQL_Anon import SQL_Anon, User
from decorators.fetch_anon_token import get_anon_token
from decorators.fetch_user import fetch_user
from constants import *
from logger_factory import logger_factory

logger = logger_factory(__name__, "GAME")

class Game_Endpoints:
    NAMESPACE = "/game"

    def __init__(self, app, io, hubs):
        self.io = io
        self.sql_anon = SQL_Anon(filename="./app/anon.db", namespace=self.NAMESPACE)
        self.hubs = hubs

        app.add_url_rule(self.NAMESPACE, view_func=self.game, endpoint="game")

        io.on_event('connect', self.on_connect, namespace=self.NAMESPACE)
        io.on_event('disconnect', self.on_disconnect, namespace=self.NAMESPACE)        
        io.on_event('join', self.on_join, namespace=self.NAMESPACE)        
        io.on_event('do_action', self.on_action, namespace=self.NAMESPACE)        

    # /game template endpoint
    @fetch_user()
    def game(self, user):
        logger.info("/game")
        return render_template("game.html", seat=user.seat)

    # websocket connect handler 
    @fetch_user()
    def on_connect(self, auth, user: User):
        logger.info(f"ws:connect {user.username}")
        self.sql_anon.set_ws_room(user.user_token, request.sid)
        self.sql_anon.set_connected(user.user_token, True)
        game_rec = self.sql_anon.get_game(user.game_token)
        game_rec.emit("user_connected", {"seat": user.seat})
        
        hub = self.hubs[user.game_token]
        connection = hub[user.username]

        # refresh the user because the namespace & room are different
        connection.user = user.refresh()
        connection.emit_snapshot()

    # websocket connect handler 
    @fetch_user()
    def on_join(self, user):
        logger.info("ws:join")
        hub = self.hubs[user.game_token]
        connection = hub[user.username]
        connection.emit_snapshot()

    # websocket disconnect handler
    def on_disconnect(self, reason=None):
        logger.info("ws:disconnect")
        user_token = get_anon_token()
        user = self.sql_anon.get_user(user_token)

        if user is not None:
            self.sql_anon.set_connected(user.user_token, False)
            game_rec = self.sql_anon.get_game(user.game_token)
            game_rec.emit("user_left", {"seat": user.seat})  

    # /do_action websocket on action endpoint
    @fetch_user()
    def on_action(self, data, user):
        logger.info(f"ws:action {data} {user}")
        connection = self.connections[user.user_token]
        connection.set_decision(data)