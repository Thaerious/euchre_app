CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT, -- Auto-incrementing user ID
    username TEXT UNIQUE NOT NULL, -- Unique username
    email TEXT UNIQUE NOT NULL CHECK (email LIKE '%@%.%'), -- Ensure email format
    password_hash TEXT NOT NULL, -- Hashed password
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Account creation timestamp
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Last update timestamp
    status_id INTEGER DEFAULT 1, -- Active status (1 = unverified)
    role_id INTEGER DEFAULT 2, -- Default role (2 = regular user)
    FOREIGN KEY (role_id) REFERENCES roles(id) -- Links to roles table
);

CREATE TABLE roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT, -- Auto-incrementing role ID
    role_name TEXT UNIQUE NOT NULL -- e.g., 'admin', 'user'
);

CREATE TABLE status (
    id INTEGER PRIMARY KEY AUTOINCREMENT, -- Auto-incrementing status ID
    status_name TEXT UNIQUE NOT NULL -- e.g., 'unverified', 'active'
);

CREATE TABLE user_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    session_token TEXT UNIQUE NOT NULL, -- Unique session token
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Login timestamp
    expires_at TIMESTAMP NOT NULL, -- Expiration timestamp
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert default roles
INSERT INTO roles (role_name) VALUES ('admin'), ('user');

-- Insert default status'
INSERT INTO status (status_name) VALUES ('unverified'), ('active'), ('deactivated');
