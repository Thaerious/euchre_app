import logging
from flask import render_template, request, Blueprint, redirect
from SQL_Anon import SQL_Anon
from decorators.fetch_anon_token import fetch_anon_token, get_anon_token
import json

logger = logging.getLogger(__name__)

class Host_Manager:
    def __init__(self, app, io):
        self.io = io
        self.sql_anon = SQL_Anon("./app/anon.db")
        app.add_url_rule("/exit_staging", view_func=self.exit_staging, methods=["POST"])
        app.add_url_rule("/host", view_func=self.host_game)        
        app.add_url_rule("/join/<game_token>", view_func=self.join_game)
        io.on_event('connect', self.on_connect)
        io.on_event('set_name', self.on_set_name)

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
            names = self.sql_anon.get_names(game_token)     
            self.notify_all(game_token, "update_names", names)

        return redirect("landing")

    # websocket connection endpoint 
    @fetch_anon_token
    def on_connect(self, token):
        self.sql_anon.set_ws_room(token, request.sid)
        game_token = self.sql_anon.get_user(token)["game_token"]
        names = self.sql_anon.get_names(game_token)
        self.io.emit("connected", json.dumps({"seat": 0}), room = request.sid)
        self.io.emit("update_names", json.dumps(names), room = request.sid)

    # websocket set name endpoint
    @fetch_anon_token
    def on_set_name(self, data, token):
        self.sql_anon.set_name(token, data["name"])
        game_token = self.sql_anon.get_user(token)["game_token"]  
        names = self.sql_anon.get_names(game_token)     
        self.notify_all(game_token, "update_names", names)

    def notify_all(self, game_token, event, data):
        all_users = self.sql_anon.all_users(game_token)

        for user in all_users:
            print(user["websocket_room"], data)
            self.io.emit(event, json.dumps(data), room = user["websocket_room"])