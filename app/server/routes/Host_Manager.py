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
        app.add_url_rule("/cancel_host", view_func=self.cancel_host)
        app.add_url_rule("/host", view_func=self.create_host)        
        io.on_event('connect', self.ws_connect)
        io.on_event('set_name', self.ws_set_name)

    # Serve template file for private game staging area.
    @fetch_anon_token
    def create_host(self, token):    
        game_token = self.sql_anon.get_game(token)
        if game_token is None:
            game_token = self.sql_anon.create_game(token)

        return render_template("host.html", game_token = game_token)

    # api endpoint to cancel a staged game
    @fetch_anon_token
    def cancel_host(self, token):
        self.sql_anon.remove_user(token)
        return render_template("landing.html")

    # websocket connection endpoint 
    @fetch_anon_token    
    def ws_connect(self, token):
        self.sql_anon.set_ws_room(token, request.sid)
        game_token = self.sql_anon.get_game(token)
        names = self.sql_anon.get_names(game_token)
        self.io.emit("update_names", json.dumps(names), room = request.sid)

    # websocket set name endpoint
    @fetch_anon_token
    def ws_set_name(self, data, token):
        print(f"{token}: {data}")
        self.sql_anon.set_name(token, data["name"])
