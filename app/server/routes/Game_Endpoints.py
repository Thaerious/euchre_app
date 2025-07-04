from flask import render_template, request, redirect, url_for
from SQL_Anon import SQL_Anon, User_Record
from decorators.fetch_anon_token import get_user_token
from decorators.fetch_user import fetch_user
from constants import *
from logger_factory import logger_factory
from Socket_Connection import Socket_Connection

logger = logger_factory(__name__, "GAME")

class Game_Endpoints:
    NAMESPACE = "/game"

    def __init__(self, app, io, hubs):
        self.io = io
        self.sql_anon = SQL_Anon(filename="./app/anon.db", namespace=self.NAMESPACE)
        self.hubs = hubs

        app.add_url_rule("/game", view_func=self.game, endpoint="game")
        app.add_url_rule("/view", view_func=self.view, endpoint="view")
        app.add_url_rule("/exit", view_func=self.exit, endpoint="exit", methods=["POST"])

        io.on_event('connect', self.on_connect, namespace=self.NAMESPACE)
        io.on_event('disconnect', self.on_disconnect, namespace=self.NAMESPACE)        
        io.on_event('join', self.on_join, namespace=self.NAMESPACE)        
        io.on_event('do_action', self.on_action, namespace=self.NAMESPACE)        

    # /game template endpoint
    @fetch_user()
    def game(self, user):
        logger.info(f"/game {user.username}")

        if not user.game_token:
            return redirect(url_for('lobby', reason='game not found'))
        
        return render_template("game.html", seat=user.seat, game_token=user.game_token)

    @fetch_user()
    def view(self, user):
        logger.info(f"/view {user.username}")
        return render_template("game.html", seat=user.seat, game_token=user.game_token, view=True)

    @fetch_user()
    def exit(self, user):
        logger.info(f"/exit {user.username}")
        self.sql_anon.remove_user_from_game(user.user_token)
        game_record = self.sql_anon.get_game(user.game_token)
        num_users = len(game_record.names)

        if (num_users == 0):
            self.sql_anon.remove_game(game_record.token)

        return redirect(url_for('lobby', reason='game ended'))

    # websocket connect handler 
    @fetch_user()
    def on_connect(self, auth, user: User_Record):
        logger.info(f"ws:connect {user.username}")
        self.sql_anon.set_ws_room(user.user_token, request.sid)
        game_rec = self.sql_anon.get_game(user.game_token)

        if not game_rec:
            self.sql_anon.remove_user_from_game(user.user_token)
            return redirect(url_for('lobby', reason='game not found'))

        game_rec.emit("user_connected", {"seat": user.seat})

        # refresh the user because the namespace & room are different
        user = user.refresh()

        try:
            hub = self.hubs[user.game_token]
            hub.add_connection(Socket_Connection(user))
        except FileNotFoundError:
            logger.error("Save file not found.")
            return redirect(url_for('lobby', reason='save file not found'))

    # websocket connect handler 
    @fetch_user()
    def on_join(self, user):
        logger.info(f"ws:join {user.username}")
        hub = self.hubs[user.game_token]
        connection = hub[user.username]
        connection.emit_snapshot()

    # websocket disconnect handler
    def on_disconnect(self, reason=None):
        user_token = get_user_token()
        user = self.sql_anon.get_user(user_token)
        logger.info(f"ws:disconnect {user.username}")

        if user is not None:
            self.sql_anon.clear_ws_room(user.user_token)
            game_rec = self.sql_anon.get_game(user.game_token)

            if game_rec is not None:
                game_rec.emit("user_left", {"seat": user.seat})  

    # /do_action websocket on action endpoint
    @fetch_user()
    def on_action(self, data, user):
        logger.info(f"ws:action {user.username} {data}")
        hub = self.hubs[user.game_token]
        connection = hub.connections[user.username]
        connection.set_decision(data)