CREATE TABLE users (
    user_token VARCHAR(12) PRIMARY KEY, -- token identifier set in the user's cookie
    game_token VARCHAR(12) NOT NULL,    -- shared identifier for players in the same game
    user_name TEXT UNIQUE DEFAULT NULL, -- username set by player
    websocket_room TEXT DEFAULT NULL,   -- websocket room to communicate with user
    connected BOOLEAN DEFAULT 1,        -- 1 if the websocket is currently connected, else 0
    seat INT NOT NULL                   -- seat 0 is host
);
