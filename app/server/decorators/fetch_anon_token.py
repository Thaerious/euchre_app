from constants import TOKEN_SIZE
from functools import wraps
from flask import request, make_response
from SQL_Accounts import SQL_Accounts
from decorators.inject_arg import inject_arg
import random

COOKIE_NAME = "anon_token"
ARG_NAME = "token"

sqlAccounts = SQL_Accounts("./app/accounts.db")

def get_anon_token():
    """
    retrieve an anonomous token.
    This is used to track players in private games.
    The token must be set by @fetch_anon_token on an http connections
    Use this function to retreive the token during websocket events
    """     
    return request.cookies.get(COOKIE_NAME)
    

def fetch_anon_token(f):
    """
    Decorator to create and/or retrieve an anonomous token.
    This is used to track players in private games.
    If there is a token that token is set to on the token argument.
    Else, create a token and set it as the token argument.
    """     

    @wraps(f)
    def decorated(*args, **kwargs):       
        # Retrieve anon token from cookies
        token = request.cookies.get(COOKIE_NAME)

        # If the token does not exists create it, then inject it
        if not token: token = ''.join(random.choices('0123456789abcdef', k=TOKEN_SIZE))        
        kwargs = inject_arg(ARG_NAME, token, f, kwargs)

        # Call the wrapped function with the modified args and kwargs
        response = f(*args, **kwargs)

        # If response is None or a string, convert it to a valid Flask Response object
        if response is None:
            response = make_response("No content", 204)  
        elif isinstance(response, str):
            response = make_response(response, 200)

        # If valid, refresh the session token to extend its validity
        if token is not None:
            token = sqlAccounts.refresh_session(token)
            response.set_cookie(
                COOKIE_NAME, 
                token, 
                httponly=True,  # Prevent JavaScript access for security
                secure=True,  # Only allow over HTTPS
                samesite="Strict"  # Prevent cross-site request forgery (CSRF)
            )     

        return response  # Return the final response with the updated cookie    
    return decorated
