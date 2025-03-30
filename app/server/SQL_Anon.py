from constants import TOKEN_SIZE
import sqlite3
import sys
import random
from Socket_Connection import Socket_Connection

class SQL_Anon:
    def __init__(self, filename):
        """Initialize database connection with the given SQLite file."""
        self.filename = filename 

    def remove_user(self, user_token):
        """ 
        Remove a user from a game, if the user is host remove all users.
        Return true if the game was deleted, otherwise false
        """
        with sqlite3.connect(self.filename) as conn:
            conn.set_trace_callback(print)
            cursor = conn.cursor()
            sql = ("SELECT host, game_token FROM users WHERE user_token = ? ")
            cursor.execute(sql, (user_token,))
            (is_host, game_token) = cursor.fetchone()            

            if is_host: 
                sql = ("DELETE FROM users WHERE game_token = ? ")
                cursor.execute(sql, (game_token,))
                return True
            else:
                sql = ("DELETE FROM users WHERE user_token = ? ")
                cursor.execute(sql, (user_token,))
                return False

    def create_game(self, host_token):
        """ Create a new game with 'host_token' as host """

        game_token = ''.join(random.choices('0123456789abcdef', k=TOKEN_SIZE)) 

        with sqlite3.connect(self.filename) as conn:
            conn.set_trace_callback(print)
            cursor = conn.cursor()
            sql = ("INSERT INTO users (user_token, game_token, seat) VALUES (?, ?, ?)")
            cursor.execute(sql, (host_token, game_token, 0)) # seat 0 is host
            return game_token

    def add_user(self, user_token, game_token):
        """ Create a new game with 'host_token' as host """

        with sqlite3.connect(self.filename) as conn:
            conn.set_trace_callback(print)
            cursor = conn.cursor()

            sql = ("SELECT * FROM users WHERE game_token = ?")
            cursor.execute(sql, (game_token,))
            index = len(cursor.fetchall())

            sql = ("INSERT INTO users (user_token, game_token, seat) VALUES (?, ?, ?)")
            cursor.execute(sql, (user_token, game_token, index))
            return game_token

    def get_game(self, user_token):
        """ Retrieve the game token (or None) associtated with the user token """

        with sqlite3.connect(self.filename) as conn:
            conn.set_trace_callback(print)
            cursor = conn.cursor()
            sql = ("SELECT game_token FROM users WHERE user_token = ?")
            cursor.execute(sql, (user_token,))
            result = cursor.fetchone() or (None,)
            return result[0]

    def set_ws_room(self, user_token, ws_room):
        """ Retrieve the game token (or None) associtated with the user token """

        with sqlite3.connect(self.filename) as conn:
            conn.set_trace_callback(print)
            cursor = conn.cursor()
            sql = ("UPDATE users SET websocket_room = ? WHERE user_token = ?")
            cursor.execute(sql, (ws_room, user_token))

    def set_name(self, user_token, name):
        """ Set the user name associate with the user_token """

        with sqlite3.connect(self.filename) as conn:
            conn.set_trace_callback(print)
            cursor = conn.cursor()
            sql = ("UPDATE users SET user_name = ? WHERE user_token = ?")
            cursor.execute(sql, (name, user_token))            

    def get_names(self, game_token):
        """ List all names by seat for the specified game """
        with sqlite3.connect(self.filename) as conn:
            conn.set_trace_callback(print)
            cursor = conn.cursor()
            sql = ("SELECT seat, user_name FROM users WHERE game_token = ?")
            cursor.execute(sql, (game_token,))
            result = cursor.fetchall()

            name_dict = {}
            for row in result:
                name_dict[row[0]]= row[1]

            return name_dict

    def list(self):
        """ List all entries"""
        with sqlite3.connect(self.filename) as conn:
            conn.set_trace_callback(print)
            cursor = conn.cursor()
            sql = ("SELECT * FROM users")
            cursor.execute(sql)
            return cursor.fetchall()

def invoke(method_name, *args):
    """Dynamically invoke a method from the SQL_Games class."""
    sql = SQL_Anon("./anon.db")
    if hasattr(sql, method_name):
        method = getattr(sql, method_name)
        result = method(*args)
        print(result)
    else:
        print(f"Method '{method_name}' not found in SQL_Games.")

def print_help():
    """Print available methods for the script."""
    sql = SQL_Anon("./anon.db")
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