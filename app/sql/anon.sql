DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS games;
DROP TABLE IF EXISTS game_status;

CREATE TABLE users (
    user_token VARCHAR(12) PRIMARY KEY,             -- token identifier set in the user's cookie
    game_token VARCHAR(12) NOT NULL,                -- shared identifier for players in the same game
    username TEXT UNIQUE DEFAULT NULL,              -- username set by player
    room TEXT DEFAULT NULL,                         -- websocket room to communicate with user
    connected BOOLEAN DEFAULT 1,                    -- 1 if the websocket is currently connected, else 0
    seat INT NOT NULL,                              -- seat 0 is host
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- token creation timestamp
);

CREATE TABLE games(
    game_token VARCHAR(12) PRIMARY KEY, -- token identifier for each game
    game_status INTEGER NOT NULL DEFAULT 1, -- current game status code from game status table
    FOREIGN KEY (game_status) REFERENCES game_status(status_code)
);

CREATE TABLE game_status(
    status_code INTEGER PRIMARY KEY AUTOINCREMENT,
    status_desc VARCHAR(12) NOT NULL
);

-- Insert game status values
INSERT INTO game_status (status_desc) VALUES ('staging'), ('playing'), ('complete');
