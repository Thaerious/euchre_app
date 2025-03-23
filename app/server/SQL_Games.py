import apsw
import sqlite3
import sys
from Socket_Connection import Socket_Connection

class SQL_Games:
    def __init__(self, filename):
        """Initialize database connection with the given SQLite file."""
        self.filename = filename        

    def reset(self):
        """ Remove all entries """
        with sqlite3.connect(self.filename) as conn:
            conn.set_trace_callback(print)
            cursor = conn.cursor()
            sql = "DELETE FROM games"
            cursor.execute(sql)        

    def add(self, username, hub_id):
        """ Associate a hub id with a username """
        with sqlite3.connect(self.filename) as conn:
            conn.set_trace_callback(print)
            cursor = conn.cursor()
            sql = ("INSERT INTO games (user_id, hub_id) "
                   "VALUES ((SELECT id FROM users WHERE username = ?), ?) "
            )
            cursor.execute(sql, (username, hub_id))
            return cursor.fetchone() is not None

    def get_user(self, username):
        """Retrieve an entry by username"""
        with sqlite3.connect(self.filename) as conn:
            conn.row_factory = sqlite3.Row  # This makes query results behave like dictionaries
            conn.set_trace_callback(print)
            cursor = conn.cursor()
            sql = ("SELECT username, socket_id, hub_id "
                   "FROM games INNER JOIN users "
                   "ON games.user_id = users.id "
                   "WHERE username = ? "
            )
            cursor.execute(sql, (username,))
            row = cursor.fetchone()
            return dict(row) if row else None  # Convert to dictionary if data exists      

    def set_sid(self, username, socket_id):
        """Associate a socket id with a username"""
        with sqlite3.connect(self.filename) as conn:
            conn.set_trace_callback(print)
            cursor = conn.cursor()
            sql = ("UPDATE games SET socket_id = ? "
                   "WHERE user_id = (SELECT id FROM users WHERE username = ?) "
            )
            cursor.execute(sql, (socket_id, username))
            return cursor.fetchone() is not None    

    def clear_sid(self, socket_id):
        """Remove an entry by socket id"""
        with sqlite3.connect(self.filename) as conn:
            conn.set_trace_callback(print)
            cursor = conn.cursor()
            sql = "UPDATE games SET socket_id = NULL WHERE socket_id = ?"
            cursor.execute(sql, (socket_id,))

    def remove_entry(self, socket_id):
        """Remove an entry by socket id"""
        with sqlite3.connect(self.filename) as conn:
            conn.set_trace_callback(print)
            cursor = conn.cursor()
            sql = "DELETE FROM games WHERE socket_id = ?"
            cursor.execute(sql, (socket_id,))

    def list(self):
        """ List all entries"""
        with sqlite3.connect(self.filename) as conn:
            conn.set_trace_callback(print)
            cursor = conn.cursor()
            sql = ("SELECT username, socket_id, hub_id "
                   "FROM games INNER JOIN users "
                   "ON games.user_id = users.id "
            )
            cursor.execute(sql)
            return cursor.fetchall()

    def get_connection(self, username, io):
        return Socket_Connection(username, io)

def invoke(method_name, *args):
    """Dynamically invoke a method from the SQL_Games class."""
    sql = SQL_Games("./accounts.db")
    if hasattr(sql, method_name):
        method = getattr(sql, method_name)
        result = method(*args)
        print(result)
    else:
        print(f"Method '{method_name}' not found in SQL_Games.")

def print_help():
    """Print available methods for the script."""
    sql = SQL_Games("./accounts.db")
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