from constants import TOKEN_SIZE
from functools import wraps
from flask import request, make_response
from decorators.inject_arg import inject_arg
import random

COOKIE_NAME = "anon_token"
ARG_NAME = "user_token"

def get_user_token():
    """
    retrieve an anonomous token.
    This is used to track players in private games.
    The token must be set by @fetch_anon_token on an http connections
    Use this function to retreive the token during websocket events
    """     
    return request.cookies.get(COOKIE_NAME)

def user_token(f):
    """
    Decorator to create and/or retrieve an anonomous token.
    This is used to track players in private games.
    If there is a token that token is set to on the token argument.
    Else, create a token and set it as the token argument.

    This decorator is used on api endpoints that return a response.
    It injects the user token as a cookie in the response.    
    """     

    @wraps(f)
    def decorated(*args, **kwargs):   
        # Retrieve anon token from cookies
        token = request.cookies.get(COOKIE_NAME)

        # If the token is not in the DB create it
        user = args[0].sql_anon.get_user(token)

        # If the token does not exists create it
        if not token or not user: 
            print("GENERATE NEW TOKEN")
            token = ''.join(random.choices('0123456789abcdef', k=TOKEN_SIZE))        
            # Add the token the DB
            args[0].sql_anon.create_user(token)        
        
        kwargs = inject_arg(ARG_NAME, token, f, kwargs)

        # Call the wrapped function with the modified args and kwargs
        response = f(*args, **kwargs)

        # If response is None or a string, convert it to a valid Flask Response object
        if response is None:
            response = make_response("No content", 204)  
        elif isinstance(response, str):
            response = make_response(response, 200)

        # Update the cookie
        response.set_cookie(
            COOKIE_NAME, 
            token, 
            httponly=True,  # Prevent JavaScript access for security
            secure=True,  # Only allow over HTTPS
            samesite="Strict"  # Prevent cross-site request forgery (CSRF)
        )

        # Update the access timestamp
        args[0].sql_anon.update_timestamp(token)   

        return response  # Return the final response with the updated cookie    
    return decorated
