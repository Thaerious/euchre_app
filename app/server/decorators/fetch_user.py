from functools import wraps
from decorators.inject_arg import inject_arg
from .fetch_anon_token import get_anon_token
from werkzeug.exceptions import Unauthorized
from typing import Callable
from SQL_Anon import User
import logging

logger = logging.getLogger(__name__)

def fetch_user(arg:str = "user", sql=None) -> Callable:
    """
    A method decorator that automatically retrieves a user object from a session token
    and injects it into the method's arguments.

    This decorator:
        - Retrieves the anonymous token from cookies/session using `get_anon_token`.
        - Uses self.sql_anon or an injected sql instance to fetch the corresponding user.
        - Injects the user as a keyword argument if the method accepts it (via `inject_arg`).

    Requirements:
        - The decorated method must be part of a class with `self.sql_anon` defined.
        - The method should declare a parameter matching the `arg` name (default is 'user').
        - Optionally, a custom 'sql' instance can be injected (useful for testing/mocking).
        
    Parameters:
        arg (str): The name of the keyword argument to inject the user into. Default is 'user'.
        sql (SQL_Anon, optional): A SQL_Anon instance to override self.sql_anon (useful for testing or dependency injection).

    Returns:
        callable: The decorated method with the user argument injected if applicable.

    Raises:
        Unauthorized: if the token is missing or the user is not found.
        AttributeError: if 'self.sql_anon' is missing and not passed as a decorator argument.        

    Example:
        @fetch_user()
        def on_connect(self, user):
            print(user.username)
    """    
    def decorator(func):
        @wraps(func)
        def decorated(self, *args, **kwargs):
            # Use passed-in SQL_Anon instance or fallback to self.sql_anon.
            sql_anon = sql or getattr(self, "sql_anon", None)
            if sql_anon is None:
                 raise AttributeError("Expected 'self.sql_anon' or an explicit 'sql' argument.")

            # Retrieve session token from cookies.
            token = get_anon_token()
            if not token:
                logger.warning(f"[{func.__name__}] Missing anon token.")
                raise Unauthorized("Anonymous token missing or invalid.")

            # Retrieve the user and inject the argument
            user = sql_anon.get_user(token)
            if user is None or not isinstance(user, User):
                logger.warning(f"[{func.__name__}] No user found for token: {token[:6]}...")
                raise Unauthorized("User not found or invalid.")

            kwargs = inject_arg(arg, user, func, kwargs)

            # Call the wrapped function with the modified args and kwargs
            return func(self, *args, **kwargs)
        return decorated
    return decorator
