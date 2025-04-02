import logging
from flask import render_template, request, Blueprint, redirect
from SQL_Anon import SQL_Anon
from decorators.fetch_anon_token import fetch_anon_token, get_anon_token
from decorators.fetch_user import fetch_user
import json
import sqlite3

logger = logging.getLogger(__name__)

class Host_Manager:
    def __init__(self, app, io):
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
            return render_template("host.html", game_token = user["game_token"])

    # Serve template file for private game staging area.
    @fetch_anon_token
    def join_game(self, game_token, token):    
        user = self.sql_anon.get_user(token)
        if user is None:
            self.sql_anon.add_user(token, game_token)
        elif user["game_token"] != game_token:
            self.sql_anon.remove_user(token)
            self.sql_anon.add_user(token, game_token)

        return render_template("join.html", game_token = game_token)

    # api endpoint to cancel a staged game
    @fetch_anon_token
    def exit_staging(self, token):
        user = self.sql_anon.get_user(token)
        game_token = self.sql_anon.get_user(token)["game_token"]
        self.sql_anon.remove_user(token)

        if user["seat"] == 0:
            self.notify_all(game_token, "game_cancelled", {})
        else:
            self.notify_all(game_token, "update_names", self.build_names(game_token))

        return redirect("landing")

    # websocket connect handler 
    @fetch_anon_token
    def on_connect(self, token):
        self.sql_anon.set_ws_room(token, request.sid)
        user = self.sql_anon.get_user(token)
        game_token = user["game_token"]
        self.sql_anon.set_connected(token, True)
        self.io.emit("connected", json.dumps({"seat": user["seat"]}), room = request.sid)
        self.notify_all(game_token, "update_names", self.build_names(game_token))

    # websocket disconnect handler
    def on_disconnect(self, reason=None):
        token = get_anon_token()
        self.sql_anon.set_connected(token, False)
        user = self.sql_anon.get_user(token)

        if user is not None:
            game_token = user["game_token"]
            self.notify_all(game_token, "update_names", self.build_names(game_token))

    # websocket set name endpoint
    @fetch_user
    def on_set_name(self, data, user):
        print("on_set_name")
        try:
            self.sql_anon.set_name(user["user_token"], data["name"])
            self.io.emit("set_name_response", json.dumps(True), room = user["websocket_room"])
            self.notify_all(user["game_token"], "update_names", self.build_names(user["game_token"]))
        except sqlite3.IntegrityError:
            self.io.emit("set_name_response", json.dumps(False), room = user["websocket_room"])

    @fetch_anon_token
    def on_kick_player(self, data, token):  
        game_token = self.sql_anon.get_user(token)["game_token"]  
        target = self.sql_anon.get_seat(data["seat"], game_token)
        if target is None: return

        self.sql_anon.remove_user(target["user_token"])
        self.io.emit("kicked", json.dumps({}), room = target["websocket_room"])
        self.notify_all(game_token, "update_names", self.build_names(game_token))

    def notify_all(self, game_token, event, data):
        all_users = self.sql_anon.all_users(game_token)
        for user in all_users:
            self.io.emit(event, json.dumps(data), room = user["websocket_room"])

    def build_names(self, game_token):
        rows = self.sql_anon.all_users(game_token)
        return {
            row["seat"]: {
                "name": row["user_name"],
                "connected": row["connected"]
            } for row in rows
        }
   
