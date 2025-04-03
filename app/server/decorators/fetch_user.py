from functools import wraps
from decorators.inject_arg import inject_arg
from .fetch_anon_token import get_anon_token
from SQL_Anon import SQL_Anon, User

def fetch_user(func):
    @wraps(func)
    def decorated(*args, **kwargs):  
        # Retrieve session token from cookies
        token = get_anon_token()

        # If the token does not exists create it, raise exception
        if token is None:
            raise KeyError("Anon token not found")

        # retrive the user and inject the argument
        sql_anon = SQL_Anon()
        user = sql_anon.get_user(token)
        kwargs = inject_arg("user", user, func, kwargs)

        # Call the wrapped function with the modified args and kwargs
        return func(*args, **kwargs)
    return decorated
