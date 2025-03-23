from functools import wraps
from flask import request, make_response
from SQLAccounts import SQLAccounts
from decorators.inject_arg import inject_arg

# Initialize SQLAccounts to handle session authentication
sqlAccounts = SQLAccounts("./app/accounts.db")

def fetch_auth_token(f):
    """
    Decorator to ensure a valid session token is present in cookies.
    - Validates and refreshes the session token.
    - Injects the updated token into the wrapped function's arg-list if it accepts 'token'.
    - Ensures a proper Flask response with an updated session cookie.
    """
    
    @wraps(f)
    def decorated(*args, **kwargs):       
        # Retrieve session token from cookies
        token = request.cookies.get("session_token")

        # If the token is invalid or set token to None
        if not token: token = None
        if not sqlAccounts.validate_session(token): token = None

        kwargs = inject_arg("token", token, f, kwargs)

        # Call the wrapped function with the modified args and kwargs
        response = f(**kwargs)

        # If response is None or a string, convert it to a valid Flask Response object
        if response is None:
            response = make_response("No content", 204)  
        elif isinstance(response, str):
            response = make_response(response, 200)

        # If valid, refresh the session token to extend its validity
        if token is not None:
            token = sqlAccounts.refresh_session(token)
            response.set_cookie(
                "session_token", 
                token, 
                httponly=True,  # Prevent JavaScript access for security
                secure=True,  # Only allow over HTTPS
                samesite="Strict"  # Prevent cross-site request forgery (CSRF)
            )     

        return response  # Return the final response with the updated cookie    
    return decorated
