"""
SQLAccounts: A simple SQLite-based user management system.

This script provides functions to manage users, passwords, sessions, and roles 
in an SQLite database. Use `python script.py help` to see available methods.
"""

import sqlite3
import bcrypt
import sys
import secrets
import datetime

class SQLAccounts:
    token_lifespan = 5

    """
    A class for managing user accounts, authentication, and sessions using SQLite.
    """
    def __init__(self, filename):
        """Initialize database connection with the given SQLite file."""
        self.filename = filename        

    def user_exists(self, username):
        """Check if a user exists in the database by username."""
        with sqlite3.connect(self.filename) as conn:
            cursor = conn.cursor()
            sql = "SELECT * FROM users WHERE username = ?"
            cursor.execute(sql, (username,))
            return cursor.fetchone() is not None

    def email_exists(self, email):
        """Check if an email exists in the database."""
        with sqlite3.connect(self.filename) as conn:
            cursor = conn.cursor()
            sql = "SELECT * FROM users WHERE email = ?"
            cursor.execute(sql, (email,))
            return cursor.fetchone() is not None

    def add_user(self, username, email, password):
        """Add a new user with a hashed password."""
        with sqlite3.connect(self.filename) as conn:
            cursor = conn.cursor()
            password_bytes = password.encode('utf-8')
            hashed = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
            sql = "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)"
            cursor.execute(sql, (username, email, hashed))
            conn.commit()

    def update_password(self, username, password):
        """Update the password for a given user."""
        with sqlite3.connect(self.filename) as conn:
            cursor = conn.cursor()
            password_bytes = password.encode('utf-8')
            hashed = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
            sql = "UPDATE users SET password_hash = ? WHERE username = ?"
            cursor.execute(sql, (hashed, username))
            conn.commit()

    def verify_user(self, username, password):
        """Verify a user's password against the stored hash."""
        with sqlite3.connect(self.filename) as conn:
            cursor = conn.cursor()
            sql = "SELECT password_hash FROM users WHERE username = ?"
            cursor.execute(sql, (username,))
            result = cursor.fetchone()
            
            if result is None: return False
            password_bytes = password.encode('utf-8')
            return bcrypt.checkpw(password_bytes, result[0])
    
    def get_user(self, token):
        """Retrieve user details identified by token."""
        with sqlite3.connect(self.filename) as conn:
            conn.row_factory = sqlite3.Row  # This makes query results behave like dictionaries
            cursor = conn.cursor()
            sql = ("SELECT username, email, status_name as status, role_name as role, created_at as created "
                   "FROM users "
                   "INNER JOIN roles ON users.role_id = roles.id "
                   "INNER JOIN status ON users.status_id = status.id "
                   "WHERE users.id = (SELECT user_id FROM user_sessions WHERE session_token LIKE ?) "
            )
            cursor.execute(sql, (f"{token}%",))
            row = cursor.fetchone()
            return dict(row) if row else None  # Convert to dictionary if data exists

    def list_users(self):
        """List all users along with their roles and statuses."""
        with sqlite3.connect(self.filename) as conn:
            cursor = conn.cursor()
            sql = ("SELECT username, email, status_name, role_name "
                   "FROM users "
                   "INNER JOIN roles ON users.role_id = roles.id "
                   "INNER JOIN status ON users.status_id = status.id ")
            cursor.execute(sql)
            return cursor.fetchall()

    def activate_user(self, username):
        """Activate a user by updating their status."""
        with sqlite3.connect(self.filename) as conn:
            cursor = conn.cursor()
            sql = "UPDATE users SET status_id = 2 WHERE username = ?"
            cursor.execute(sql, (username,))
            conn.commit()

    def deactivate_user(self, username):
        """Deactivate a user by updating their status."""
        with sqlite3.connect(self.filename) as conn:
            cursor = conn.cursor()
            sql = "UPDATE users SET status_id = 3 WHERE username = ?"
            cursor.execute(sql, (username,))
            conn.commit()

    def delete_user(self, username):
        """Delete a user and remove all associated records."""
        with sqlite3.connect(self.filename) as conn:
            cursor = conn.cursor()
            sql = "DELETE FROM users WHERE username = ?"
            cursor.execute(sql, (username,))
            conn.commit()            

    def create_session(self, username):
        """Create or update a user session with an expiration time."""
        with sqlite3.connect(self.filename) as conn:
            cursor = conn.cursor()
            session_token = secrets.token_hex(32)
            expires_at = (datetime.datetime.now(datetime.UTC) + datetime.timedelta(minutes=SQLAccounts.token_lifespan)).strftime("%Y-%m-%d %H:%M:%S")
            sql = ("INSERT INTO user_sessions (user_id, session_token, expires_at) "
                   "VALUES ((SELECT id FROM users WHERE username = ?), ?, ?) "
                   "ON CONFLICT(user_id) DO UPDATE SET "
                   "session_token = excluded.session_token, "
                   "expires_at = excluded.expires_at")
            cursor.execute(sql, (username, session_token, expires_at))
            return session_token

    def refresh_session(self, session_token):
        """Update a user session with a new expiration time."""
        with sqlite3.connect(self.filename) as conn:
            cursor = conn.cursor()            
            expires_at = (datetime.datetime.now(datetime.UTC) + datetime.timedelta(minutes=SQLAccounts.token_lifespan)).strftime("%Y-%m-%d %H:%M:%S")
            sql = ("UPDATE user_sessions "
                   "SET expires_at = ? "
                   "WHERE session_token = ?"
            )
            cursor.execute(sql, (expires_at, session_token))
            return session_token

    def delete_session(self, token):
        """Delete a session for a specific user."""
        with sqlite3.connect(self.filename) as conn:
            cursor = conn.cursor()
            sql = "DELETE FROM user_sessions WHERE session_token = ?"
            cursor.execute(sql, (token,))

    def validate_session(self, token):
        """Validate if a session is active and not expired."""
        with sqlite3.connect(self.filename) as conn:
            cursor = conn.cursor()
            sql = ("SELECT * FROM user_sessions "
                   "WHERE expires_at > CURRENT_TIMESTAMP "
                   "AND session_token = ?")
            cursor.execute(sql, (token,))
            return cursor.fetchone() is not None
        
    def sessions(self):
        """List all sessions by user."""
        with sqlite3.connect(self.filename) as conn:
            cursor = conn.cursor()
            sql = ("SELECT username, session_token, expires_at FROM user_sessions "
                   "INNER JOIN users on users.id = user_id ")
            cursor.execute(sql)
            return cursor.fetchall()

def invoke(method_name, *args):
    """Dynamically invoke a method from the SQLAccounts class."""
    sql = SQLAccounts("./accounts.db")
    if hasattr(sql, method_name):
        method = getattr(sql, method_name)
        result = method(*args)
        print(result)
    else:
        print(f"Method '{method_name}' not found in SQLAccounts.")

def print_help():
    """Print available methods for the script."""
    sql = SQLAccounts("./accounts.db")
    print("USAGE")
    print("\tpython ./server/SQLAccounts.py <method_name> [args...]\n")
    print("OPTIONS")
    for method in dir(sql):
        attr = getattr(sql, method)
        if callable(attr) == False: continue
        if method.startswith("__"): continue
        if callable(attr):
            print(f"\t{method}\n\t\t{attr.__doc__.splitlines()[0]}\n")

if __name__ == "__main__":
    if sys.argv[1] == "help":
        print_help()
    elif len(sys.argv) < 2:
        print("Usage: python script.py <method_name> [args...]")
    else:
        invoke(sys.argv[1], *sys.argv[2:])