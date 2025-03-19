from functools import wraps
from flask import request
from manage_jwt import validate_jwt
from .inject_arg import inject_arg

def game_token_req(f):
    """
    Decorator to ensure a valid game token is present in a websocket endpoint.
    - Validates and refreshes the session token.
    - Injects the username and hub_id into the function.
    - Ensures a proper Flask response with an updated session cookie.
    """
    
    @wraps(f)
    def decorated(*args, **kwargs):       
        token = request.args.get("token")
        payload = validate_jwt(token)

        kwargs = inject_arg("username", payload["username"], f, kwargs)
        kwargs = inject_arg("hub_id", payload["hub_id"], f, kwargs)

        return f(**kwargs)
   
    return decorated
