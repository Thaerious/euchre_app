import logging
from flask import render_template, request, Blueprint, redirect
from SQL_Anon import SQL_Anon, User
from decorators.fetch_anon_token import fetch_anon_token, get_anon_token
from decorators.fetch_user import fetch_user
import json
import sqlite3

logger = logging.getLogger(__name__)

class Host_Manager:
    def __init__(self, app, io):
        User.io = io
        self.io = io
        self.sql_anon = SQL_Anon("./app/anon.db")
        app.add_url_rule("/exit_staging", view_func=self.exit_staging, methods=["POST"])
        app.add_url_rule("/host", view_func=self.host_game)        
        app.add_url_rule("/join/<game_token>", view_func=self.join_game)
        io.on_event('disconnect', self.on_disconnect)
        io.on_event('connect', self.on_connect)
        io.on_event('set_name', self.on_set_name)
        io.on_event('kick_player', self.on_kick_player)

    # Serve template file for private game staging area.
    @fetch_anon_token
    def host_game(self, token):
        user = self.sql_anon.get_user(token)

        if user is None:
            game_token = self.sql_anon.create_game(token)
            return render_template("host.html", game_token = game_token)
        else:
            return render_template("host.html", game_token = user.game_token)

    # Serve template file for private game staging area.
    @fetch_anon_token
    def join_game(self, game_token, token):    
        user = self.sql_anon.get_user(token)

        if user is None:
            self.sql_anon.add_user(token, game_token)
        elif user.game_token != game_token:
            self.sql_anon.remove_user(token)
            self.sql_anon.add_user(token, game_token)

        return render_template("join.html", game_token = game_token)

    # api endpoint to cancel a staged game
    @fetch_user
    def exit_staging(self, user):
        self.sql_anon.remove_user(user.user_token)
        users = self.sql_anon.all_users(user.game_token)

        if user.seat == 0:
            users.emit("game_cancelled", {})
        else:
            users.emit("update_names", users.names)

        return redirect("landing")

    # websocket connect handler 
    @fetch_user
    def on_connect(self, user):
        user.setRoom(request.sid)
        user.setConnected(True)
        user.emit("connected", {"seat": user.seat})

        all_users = self.sql_anon.all_users(user.game_token)
        all_users.emit("update_names", all_users.names)

    # websocket disconnect handler
    def on_disconnect(self, reason=None):
        token = get_anon_token()
        user = self.sql_anon.get_user(token)

        if user is not None:
            user.setConnected(False)
            all_users = self.sql_anon.all_users(user.game_token)
            all_users.emit("update_names", all_users.names)            

    # websocket set name endpoint
    @fetch_user
    def on_set_name(self, data, user):
        print(f" - CALL: on_set_name {data} {user}")
        try:
            user.setName(data["name"])
            user.emit("set_name_response", True)
            all_users = self.sql_anon.all_users(user.game_token)
            all_users.emit("update_names", all_users.names)
        except sqlite3.IntegrityError:
             user.emit("set_name_response", False)

    @fetch_user
    def on_kick_player(self, data, user):
        target = self.sql_anon.get_seat(data["seat"], user.game_token)
        if target is None: return

        self.sql_anon.remove_user(target.user_token)
        target.emit("kicked", {})
        all_users = self.sql_anon.all_users(user.game_token)
        all_users.emit("update_names", all_users.names)