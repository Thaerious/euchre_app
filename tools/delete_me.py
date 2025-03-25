import apsw
connection = apsw.Connection("accounts.db")
sql = ("INSERT INTO games (user_id, hub_id) "
       "VALUES ((SELECT id FROM users WHERE username = ?), ?) "
)
connection.execute(sql, ("ed", "hub1"))