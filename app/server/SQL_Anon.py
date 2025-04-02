from constants import TOKEN_SIZE
import sqlite3
import sys
import random
from Socket_Connection import Socket_Connection

class Name_Dictionary(dict):
    def next_free_seat(self):
        max = len(self)
        for i in range(max):
            if i not in self: return i
        return len(self)

class SQL_Anon:
    def __init__(self, filename = "./app/anon.db"):
        """Initialize database connection with the given SQLite file."""
        self.filename = filename 

    def get_user(self, user_token):
        """ Retrive user information """
        with sqlite3.connect(self.filename) as conn:
            conn.set_trace_callback(print)
            conn.row_factory = sqlite3.Row  # This makes query results behave like dictionaries
            cursor = conn.cursor()
            sql = ("SELECT * from users where user_token = ?")
            cursor.execute(sql, (user_token,))
            row = cursor.fetchone()
            return dict(row) if row else None       

    def get_seat(self, seat, game_token):
        """ Retrive user information """
        with sqlite3.connect(self.filename) as conn:
            conn.set_trace_callback(print)
            conn.row_factory = sqlite3.Row  # This makes query results behave like dictionaries
            cursor = conn.cursor()
            sql = ("SELECT * from users where seat = ? AND game_token = ?")
            cursor.execute(sql, (seat, game_token))
            row = cursor.fetchone()
            return dict(row) if row else None   

    def all_users(self, game_token):
        """ Retrive user information for the specified game"""
        with sqlite3.connect(self.filename) as conn:
            conn.set_trace_callback(print)
            conn.row_factory = sqlite3.Row  # This makes query results behave like dictionaries
            cursor = conn.cursor()
            sql = ("SELECT * from users where game_token = ?")
            cursor.execute(sql, (game_token,))
            rows = cursor.fetchall()
            return [dict(row) for row in rows]

    def remove_user(self, user_token):
        """ 
        Remove a user from a game, if the user is host remove all users.
        Return true if the game was deleted, otherwise false
        """
        with sqlite3.connect(self.filename) as conn:
            conn.set_trace_callback(print)
            cursor = conn.cursor()
            sql = ("SELECT seat, game_token FROM users WHERE user_token = ? ")
            cursor.execute(sql, (user_token,))
            (seat, game_token) = cursor.fetchone()            

            if seat == 0: 
                sql = ("DELETE FROM users WHERE game_token = ? ")
                cursor.execute(sql, (game_token,))
                return True
            else:
                sql = ("DELETE FROM users WHERE seat = ? AND game_token = ? ")
                cursor.execute(sql, (seat, game_token))
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

        print(self.get_names(game_token))
        seat = self.get_names(game_token).next_free_seat()

        with sqlite3.connect(self.filename) as conn:
            conn.set_trace_callback(print)
            cursor = conn.cursor()

            sql = ("SELECT * FROM users WHERE game_token = ?")
            cursor.execute(sql, (game_token,))

            sql = ("INSERT INTO users (user_token, game_token, seat) VALUES (?, ?, ?)")
            cursor.execute(sql, (user_token, game_token, seat))
            return game_token

    def set_ws_room(self, user_token, ws_room):
        """ Retrieve the game token (or None) associtated with the user token """

        with sqlite3.connect(self.filename) as conn:
            conn.set_trace_callback(print)
            cursor = conn.cursor()
            sql = ("UPDATE users SET websocket_room = ? WHERE user_token = ?")
            cursor.execute(sql, (ws_room, user_token))

    def set_name(self, user_token, name):
        """ Set the user name associated with the user_token """

        with sqlite3.connect(self.filename) as conn:
            conn.set_trace_callback(print)
            cursor = conn.cursor()
            sql = ("UPDATE users SET user_name = ? WHERE user_token = ?")
            cursor.execute(sql, (name, user_token))            

    def set_connected(self, user_token, value):
        """ Set the connected status associated with the user_token """
        if value == False: value = 0
        if value == True: value = 1

        with sqlite3.connect(self.filename) as conn:
            conn.set_trace_callback(print)
            cursor = conn.cursor()
            sql = ("UPDATE users SET connected = ? WHERE user_token = ?")
            cursor.execute(sql, (value, user_token))   

    def get_names(self, game_token) -> Name_Dictionary: 
        """ List all names by seat for the specified game """
        with sqlite3.connect(self.filename) as conn:
            conn.set_trace_callback(print)
            cursor = conn.cursor()
            sql = ("SELECT seat, user_name FROM users WHERE game_token = ?")
            cursor.execute(sql, (game_token,))
            result = cursor.fetchall()

            name_dict = Name_Dictionary()
            for row in result:
                name_dict[row[0]]= row[1]

            return name_dict

    def list(self):
        """ List all entries"""
        with sqlite3.connect(self.filename) as conn:
            conn.set_trace_callback(print)
            conn.row_factory = sqlite3.Row  # This makes query results behave like dictionaries
            cursor = conn.cursor()
            sql = ("SELECT * FROM users")
            cursor.execute(sql)
            rows = cursor.fetchall()
            return [dict(row) for row in rows]

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