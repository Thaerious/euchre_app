import logging
from flask import render_template, request, url_for, redirect
from SQL_Anon import SQL_Anon, User
from decorators.fetch_anon_token import fetch_anon_token, get_anon_token
from decorators.fetch_user import fetch_user
import sqlite3

logger = logging.getLogger(__name__)

class Host_Manager:
    def __init__(self, app, io):
        User.io = io
        self.io = io
        self.sql_anon = SQL_Anon("./app/anon.db")
        app.add_url_rule("/exit_staging", view_func=self.exit_staging, methods=["POST"])
        app.add_url_rule("/host", view_func=self.host_game, endpoint="host")        
        app.add_url_rule("/join/<game_token>", view_func=self.join_game)
        io.on_event('disconnect', self.on_disconnect)
        io.on_event('connect', self.on_connect)
        io.on_event('set_name', self.on_set_name)
        io.on_event('kick_player', self.on_kick_player)
        io.on_event('on_start_game', self.on_start_game)

    # Serve template file for private game staging area.
    @fetch_anon_token
    def host_game(self, user_token):
        user = self.sql_anon.get_user(user_token)

        if user is None:
            game_token = self.sql_anon.create_game(user_token)
            return render_template("host.html", game_token = game_token)
        else:
            return render_template("host.html", game_token = user.game_token)

    # Serve template file for private game staging area.
    @fetch_anon_token
    def join_game(self, game_token, user_token):    
        user = self.sql_anon.get_user(user_token)
        game = self.sql_anon.get_game(game_token)

        if game is None: 
            return redirect(url_for('templates.landing', reason='expired'))         

        if user is None:
            # if user is not in a game
            self.sql_anon.join_game(user_token, game_token)
        elif user.game_token == game_token: 
            # if user is the game's host
            return redirect(url_for('host'))              
        else: 
            # if user is in another game
            self.sql_anon.remove_user(user_token)
            self.sql_anon.join_game(user_token, game_token)

        return render_template("join.html", game_token = game_token)

    # api endpoint to leave a staged game
    # if the host leaves, all players are removed
    @fetch_user
    def exit_staging(self, user):
        print(f"exit_staging({user})")
        game = self.sql_anon.get_game(user.game_token)
        self.sql_anon.remove_user(user.user_token)                

        if user.seat == 0:
            game.emit("game_cancelled", {})
        else:
            game = self.sql_anon.get_game(user.game_token)
            game.emit("update_names", game.names)

        return redirect(url_for('templates.landing', reason='game cancelled'))

    # websocket connect handler 
    @fetch_user
    def on_connect(self, user):
        self.sql_anon.set_ws_room(user.user_token, request.sid)
        self.sql_anon.set_connected(user.user_token, True)
        user = user.refresh()
        user.emit("connected", {"seat": user.seat})

        get_game = self.sql_anon.get_game(user.game_token)
        get_game.emit("update_names", get_game.names)

    # websocket disconnect handler
    def on_disconnect(self, reason=None):
        user_token = get_anon_token()
        user = self.sql_anon.get_user(user_token)

        if user is not None:
            self.sql_anon.set_connected(user.user_token, False)
            game = self.sql_anon.get_game(user.game_token)
            game.emit("update_names", game.names)            

    # websocket set name endpoint
    @fetch_user
    def on_set_name(self, data, user):
        try:
            self.sql_anon.set_name(user.user_token, data["name"])   
            user.emit("set_name_response", True)
            get_game = self.sql_anon.get_game(user.game_token)
            get_game.emit("update_names", get_game.names)
        except sqlite3.IntegrityError:
             user.emit("set_name_response", False)

    @fetch_user
    def on_kick_player(self, data, user):
        target = self.sql_anon.get_seat(data["seat"], user.game_token)
        if target is None: return

        self.sql_anon.remove_user(target.user_token)
        target.emit("kicked", {})
        get_game = self.sql_anon.get_game(user.game_token)
        get_game.emit("update_names", get_game.names)

    @fetch_user
    def on_start_game(self, user):
        pass
        