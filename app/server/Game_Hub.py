from constants import TOKEN_SIZE, COMPLETE
from Connection_Interface import Connection_Interface
from euchre import Game, Snapshot, EuchreException, ActionException
from Auto_Key_Dict import Auto_Key_Dict
from logger_factory import logger_factory
from typing import Optional
from SQL_Anon import SQL_Anon
import threading
import random

logger = logger_factory(__name__, "HUB")

class Game_Hub:
    """
    Manages a Euchre game session, player connections, and thread-safe input/output coordination.
    Handles broadcasting game snapshots, accepting player decisions, and maintaining game flow.
    """
    def __init__(self, game_token: str, names: Optional[list[str]] = None):
        """
        Initialize a Game_Hub instance.

        Args:
            game_token (str): Unique identifier for the game session.
            names (list[str], optional): List of player names to start the game with.
        """

        logger.debug(f"Game_Hub(game_token: {game_token}, names: {names})")

        self.connections = Auto_Key_Dict("id")
        self.game_token = game_token
        self.thread = None
        self._is_running = False
        self.condition = threading.Condition()

        if names:
            random.shuffle(names)
            logger.debug(f"{names}, {type(names)}")
            self.game = Game(names)
            self.game.win_condition = 1
            self.game.input(None, "start", None)
        else:
            self.game = None

    @property
    def is_running(self):
        with self.condition:
            return self._is_running

    @is_running.setter
    def is_running(self, value):
        with self.condition:
            self._is_running = value
            self.condition.notify()

    @property
    def size(self):
        """Return the number of active connections."""
        return len(self.connections)

    def add_connection(self, connection: Connection_Interface):
        """
        Add a new connection to the game hub and send initial snapshot if game is active.
        This will replace any connections with the same id.
        
        Args:
            connection (Connection_Interface): The player's connection object.
        """
        with self.condition:
            self.connections.add(connection)

            if self.game:
                snapshot = Snapshot(self.game, connection.id)
                connection.emit_snapshot(snapshot)

            self.condition.notify()

    def start_thread(self):
        """
        Start the game loop in a separate thread.

        Returns:
            Game_Hub: Self for chaining.
        """
        self.is_running = True
        self.thread = threading.Thread(target=self.run, args=())
        self.thread.start()        
        return self

    def stop_thread(self):
        """Stop the game thread and wait for it to finish."""
        self.is_running = False
        self.thread.join()

    def run(self):
        """Main game loop that waits for player decisions and progresses the game state."""
        while self.game.current_state != 8 and self._is_running:
            try:
                # States 1-5 require user action
                if self.game.current_state in [1, 2, 3, 4, 5]:
                    name, decision = self.await_player_decision()

                    if decision is None:
                        continue

                    try:
                        self.game.input(name, decision[0], decision[1])
                    except EuchreException as ex:
                        connection = self.connections[name]
                        connection.emit("exception", ex)                        
                    except Exception as ex:
                        msg = f"Exception with connection '{name}'."
                        raise RuntimeError(msg) from ex

                    self.broadcast_snapshots()
                else:
                    # States 6, 7 require server action
                    self.game.input(None, "continue", None)
                    self.broadcast_snapshots()
            except EuchreException as ex:
                connection = self.connections[name]
                connection.emit_message(ex.to_json())

        SQL_Anon().set_status(self.game_token, COMPLETE)
        return self

    def await_player_decision(self):
        """
        Block until the current player provides a decision.

        Returns:
            tuple[str, tuple | None]: (player name, decision) or (player name, None) if disconnected.
        """
        with self.condition:
            name = self.game.current_player.name
            while name not in self.connections:
                self.condition.wait()
                if not self.is_running:
                    return

            try:
                connection = self.connections[name]
                decision = connection.get_decision()
                return (name, decision)
            except ConnectionError:
                if name in self.connections:
                    del self.connections[name]
                self.broadcast("user_disconnected", {"name": name})
                return (name, None)

    def broadcast_snapshots(self):
        """Send the current game snapshot to all connected players."""
        for name in self.connections:
            connection = self.connections[name]
            snapshot = Snapshot(self.game, name)
            connection.emit_snapshot(snapshot)

    def broadcast(self, event:str, data:dict):
        """
        Emit a custom event with data to all players.

        Args:
            event (str): The event name.
            data (dict): The event data.
        """
        for connection in self.connections.values():
            connection.emit(event, data)

    def __getitem__(self, index) -> Connection_Interface:
        return self.connections[index]

    def __contains__(self, key):
        return key in self.connections

    def __iter__(self):
        return iter(self.connections.values())

    def report_after(self, player, prev_state, action, data):
        """
        Print a debug report after an action.

        Args:
            player (str | None): The player who acted.
            prev_state (int): The previous game state.
            action (str): The action performed.
            data (Any): Associated action data.
        """
        if player is None:
            print(f"Server: {action}")
        elif data is None:
            print(f"{player}: {action}")
        else:
            print(f"{player}: {action} {data}")
