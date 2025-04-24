# SQL_Anon.py
from constants import TOKEN_SIZE
from logger_factory import logger_factory
from tabulate import tabulate
from werkzeug.exceptions import Forbidden
from euchre.custom_json_serializer import custom_json_serializer
import sqlite3
import sys
import random
import json
import os

DEFAULT_FILENAME = "./app/anon.db"

logger = logger_factory(__name__, "SQL")

class Game_Record():
    def __init__(self, game_row, user_rows, namespace):
        self.namespace = namespace
        self.__dict__.update(game_row)
        self.users = []
        for row in user_rows: self.users.append(User_Record(row, namespace))

    @property
    def player_count(self):
        return len(self.users)

    def emit(self, event, object = None):
        for user in self.users:
            user.emit(event, object)

    def refresh(self):
        return SQL_Anon(namespace=self.namespace).get_game(self.token)

    def __str__(self):
        return str({"status": self.status, "token": self.token})

    @property
    def names(self):
        return {
            user.seat: {
                "name": user.username,
                "connected": user.room != None
            } for user in self.users
        }            

class User_Record:
    """ Helper object for a single row of the users table. """
    @staticmethod
    def set_io(io):
        User_Record.io = io    

    def __init__(self, row, namespace):
        self.namespace = namespace
        self.__dict__.update(row)

    def emit(self, event, object = None):                  
        if self.namespace == None: 
            raise RuntimeError("Cannot emit: namespace is not set.")
        elif isinstance(object, str):
            User_Record.io.emit(event, object, room=self.room, namespace=self.namespace)
            logger.info(f"EMIT ({self.username}, {event}:{type(object).__name__}) -> {object}")
        else:
            json_string = json.dumps(object, indent=2, default=custom_json_serializer)
            User_Record.io.emit(event, json_string, room=self.room, namespace=self.namespace)
            logger.info(f"EMIT ({self.username}, {event}:{type(object).__name__}) -> {object.__repr__()}")

    def refresh(self):
        row = SQL_Anon(namespace=self.namespace).get_user_row(self.user_token)
        return User_Record(row, namespace=self.namespace)

    def is_connected(self) -> bool:
        return User_Record.io.server.manager.is_connected(self.room, self.namespace)

    def __str__(self):
        return str(self.__dict__)

class Name_Dictionary(dict):
    def next_free_seat(self):
        max = len(self)
        for i in range(max):
            if i not in self: return i
        return len(self)

class SQL_Anon:
    def __init__(self, namespace=None, filename="./app/anon.db"):
        """Initialize database connection with the given SQLite file."""
        self.namespace = namespace
        self.filename = filename 

        if not os.path.exists(filename):
            raise FileNotFoundError(f"Database file not found: {filename}")       

    def __enter__(self):
        self.conn = sqlite3.connect(self.filename)
        self.conn.set_trace_callback(logger.debug)
        self.conn.row_factory = sqlite3.Row  # This makes query results behave like dictionaries
        self.cursor = self.conn.cursor()
        return self.cursor

    def __exit__(self, exc_type, exc_value, traceback):
        self.conn.commit()
        self.conn.close()

    def get_user(self, user_token):
        row = self.get_user_row(user_token)
        return User_Record(row, self.namespace) if row else None

    def get_user_row(self, user_token):
        """ Retrive user information """
        with self as cursor:
            sql = ("SELECT * FROM users WHERE user_token = ?")
            cursor.execute(sql, (user_token,))
            row = cursor.fetchone()
            return dict(row) if row else None

    def get_user_by_seat(self, seat, game_token):
        """ Retrive user information """
        with self as cursor:
            sql = ("SELECT * FROM users WHERE seat = ? AND game_token = ?")
            cursor.execute(sql, (seat, game_token))
            row = cursor.fetchone()
            return User_Record(dict(row), self.namespace) if row else None

    def set_seat(self, user_token, seat):
        """ Set the seat for a user """
        with self as cursor:
            sql = ("UPDATE users SET seat = ? WHERE user_token = ?")        
            cursor.execute(sql, (seat, user_token))

    def remove_game(self, game_token):
        """ Remove a game and remove the game's users """
        with self as cursor:
            sql = ("UPDATE users SET game_token = null, seat = null WHERE game_token = ?")
            cursor.execute(sql, (game_token,))

            sql = ("DELETE FROM games WHERE game_token LIKE ?")
            cursor.execute(sql, (game_token + "%",))

    def get_game(self, game_token):
        """ Retrieve list of users for the specified game.
            Return None list if there is no game
        """
        with self as cursor:
            sql = ("SELECT * FROM users WHERE game_token = ?")
            cursor.execute(sql, (game_token,))
            user_rows = cursor.fetchall()            

            sql = ("SELECT status_desc AS status, game_token as token "
                   "FROM games INNER JOIN game_status "
                   "ON games.game_status = game_status.status_code "
                   "WHERE game_token = ? "
            )
            cursor.execute(sql, (game_token,))
            game_row = cursor.fetchone()

            if game_row is None: return None
            return Game_Record(game_row, user_rows, self.namespace)

    def remove_user_from_game(self, user_token):
        """ Remove a user from the game they are currently in. 
            Throw an exception if the user is host.
        """
        with self as cursor:
            sql = ("SELECT seat, game_token FROM users WHERE user_token = ? ")
            cursor.execute(sql, (user_token,))
            (seat, game_token) = cursor.fetchone()            

            if seat == 0: 
                raise Forbidden("Cannot remove the host player from the game.")
            else:
                sql = ("UPDATE users SET game_token = null, seat = null WHERE user_token = ? ")
                cursor.execute(sql, (user_token,))

    def create_game(self, host_token):
        """ Create a new game with 'host_token' as host """
        game_token = ''.join(random.choices('0123456789abcdef', k=TOKEN_SIZE)) 

        with self as cursor:
            # create the game row
            sql = ("INSERT INTO games (game_token) VALUES (?)")
            cursor.execute(sql, (game_token,))

            # set host to seat 0
            sql = ("UPDATE users SET game_token = ?, seat = ? WHERE user_token = ?")
            cursor.execute(sql, (game_token, 0, host_token)) # seat 0 is host
            
        return self.get_game(game_token)

    def create_user(self):
        """ Create a new empty user with the specified user token """
        user_token = ''.join(random.choices('0123456789abcdef', k=TOKEN_SIZE))        

        with self as cursor:
            sql = ("INSERT INTO users (user_token, seat) VALUES (?, ?)")
            cursor.execute(sql, (user_token, -1))

        return self.get_user(user_token)

    def join_game(self, user_token, game_token):
        """ Associate a player with a game """

        seat = self.get_user_names(game_token).next_free_seat()

        with self as cursor:
            sql = ("UPDATE users SET game_token = ?, seat = ? WHERE user_token = ?")
            cursor.execute(sql, (game_token, seat, user_token))
            return game_token

    def set_ws_room(self, user_token, ws_room):
        """ Retrieve the game token (or None) associtated with the user token """

        with self as cursor:
            sql = ("UPDATE users SET room = ? WHERE user_token = ?")
            cursor.execute(sql, (ws_room, user_token))

    def clear_ws_room(self, user_token):
        """ Retrieve the game token (or None) associtated with the user token """

        with self as cursor:
            sql = ("UPDATE users SET room = null WHERE user_token = ?")
            cursor.execute(sql, (user_token,))

    def set_name(self, user_token, name):
        """ Set the user name associated with the user_token """

        with self as cursor:
            sql = ("UPDATE users SET username = ? WHERE user_token = ?")
            cursor.execute(sql, (name, user_token))            

    def get_user_names(self, game_token) -> Name_Dictionary: 
        """ List all user's names for the specified game """
        with self as cursor:
            sql = ("SELECT seat, username FROM users WHERE game_token = ?")
            cursor.execute(sql, (game_token,))
            result = cursor.fetchall()

            name_dict = Name_Dictionary()
            for row in result:
                name_dict[row[0]] = row[1]

            return name_dict
        
    def get_bots(self, game_token) -> Name_Dictionary: 
        """ List all bot names for the specified game """
        with self as cursor:
            sql = ("SELECT bot_name as name, bot_version as version FROM bots WHERE game_token = ?")
            cursor.execute(sql, (game_token,))
            rows = cursor.fetchall()
            return [dict(row) for row in rows]

    def get_all_names(self, game_token) -> list: 
        """ List all names (bot and user) for the specified game """
        with self as cursor:
            sql = ("SELECT username AS name "
                   "FROM users "
                   "WHERE game_token = ? "
                   "UNION "
                   "SELECT bot_name AS name "
                   "FROM bots "
                   "WHERE game_token = ? " )
                
            cursor.execute(sql, (game_token, game_token))
            result = cursor.fetchall()
            return [row[0] for row in result]

    def add_bot(self, game_token, name, version):
        """ Associate a bot with a game """
        with self as cursor:            
            sql = ("INSERT INTO bots (game_token, bot_name, bot_version) VALUES (?, ?, ?)")
            cursor.execute(sql, (game_token, name, version))

    def set_status(self, game_token, value):
        """ Set the status of a game {STAGING, PLAYING, COMPLETE} """
        with self as cursor:            
            sql = ("UPDATE games SET game_status = ? WHERE game_token = ?")
            cursor.execute(sql, (value, game_token))

    def clear_rooms(self):
        """ Set the connection status of all users to disconnected """
        with self as cursor:            
            sql = ("UPDATE users SET room = null")
            cursor.execute(sql)

    def update_timestamp(self, user_token):
        """ Update the timestamp of the specified user """
        with self as cursor:
            sql = "UPDATE users SET last_access = CURRENT_TIMESTAMP WHERE user_token = ?"
            cursor.execute(sql, (user_token,))

    def drop_user(self, user_token):
        """ Remove a user """
        with self as cursor:
            sql = ("DELETE FROM users WHERE user_token LIKE ?")
            cursor.execute(sql, (user_token + '%',))

    def users(self):
        """ List all users"""
        with self as cursor:
            sql = ("SELECT * FROM users")
            cursor.execute(sql)
            rows = cursor.fetchall()
            return [dict(row) for row in rows], [desc[0] for desc in cursor.description]
        
    def games(self):
        """ List all games"""
        with self as cursor:
            sql = ("SELECT game_token, status_desc as status "
                   "FROM games INNER JOIN game_status "
                   "ON game_status = game_status.status_code "
                  )
            cursor.execute(sql)
            rows = cursor.fetchall()
            return [dict(row) for row in rows], [desc[0] for desc in cursor.description]

    def bots(self):
        """ List all bots"""
        with self as cursor:
            sql = ("SELECT * FROM bots")
            cursor.execute(sql)
            rows = cursor.fetchall()
            return [dict(row) for row in rows], [desc[0] for desc in cursor.description]

    def reset(self):
        """ Clear all tables """
        with self as cursor:
            cursor.execute("DELETE FROM users")
            cursor.execute("DELETE FROM games")
            cursor.execute("DELETE FROM bots")

def invoke(method_name, *args):
    """Dynamically invoke a method from the SQL_Games class."""

    if not os.path.exists(DEFAULT_FILENAME):
        print(f"Database file not found: {DEFAULT_FILENAME}.")
        exit()

    sql = SQL_Anon(filename=DEFAULT_FILENAME)

    if not hasattr(sql, method_name):
        print(f"Method '{method_name}' not found in SQL_Games.")
        return

    method = getattr(sql, method_name)
    r = method(*args)       
   
    if not isinstance(r, tuple):
        print(r)
        return

    result, headers = r

    if len(result) == 0:
        print(tabulate(result, headers=headers, tablefmt="pretty"))
    elif isinstance(result, list) & isinstance(result[0], dict):
        print(tabulate(result, headers="keys", tablefmt="pretty"))
    else:
        print(result)

def print_help():
    """Print available methods for the script."""
    sql = SQL_Anon(filename=DEFAULT_FILENAME)
    print("USAGE")
    print("\tpython ./server/SQL_Games.py <method_name> [args...]\n")
    print("OPTIONS")
    for method in dir(sql):
        attr = getattr(sql, method)
        if callable(attr) == False: continue
        if method.startswith("__"): continue
        if callable(attr) and attr.__doc__ is not None:            
            print(f"\t{method}\n\t\t{attr.__doc__.splitlines()[0]}\n")

if __name__ == "__main__":
    if len(sys.argv) < 2 or sys.argv[1] == "help":
        print_help()
    elif len(sys.argv) < 2:
        print("Usage: python SQL_Games.py <method_name> [args...]")
    else:
        invoke(sys.argv[1], *sys.argv[2:])