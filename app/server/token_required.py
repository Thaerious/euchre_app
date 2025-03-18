import inspect
from functools import wraps
from flask import request, jsonify, render_template, make_response
from SQLAccounts import SQLAccounts

def token_required(f):
    """
    Decorator to ensure a valid session token is present in cookies.
    - Validates and refreshes the session token.
    - Injects the updated token into the wrapped function's arg-list if it accepts 'token'.
    - Ensures a proper Flask response with an updated session cookie.
    """
    
    @wraps(f)
    def decorated(*args, **kwargs):
        # Initialize SQLAccounts to handle session authentication
        sqlAccounts = SQLAccounts("./app/accounts.db")
        
        # Retrieve session token from cookies
        token = request.cookies.get("session_token")

        # If the token is invalid or missing redirect to the login page
        if not token:
            return render_template("index.html")
        if not sqlAccounts.validate_session(token):
            return render_template("index.html")
        
        # Refresh the session token to extend its validity
        token = sqlAccounts.refresh_session(token)

        # Inject the token if the function has a 'token' parameter
        sig = inspect.signature(f)
        params = list(sig.parameters.keys())

        if 'token' in params:
            index = params.index('token')
            if index < len(args):        # If 'token' is in positional arguments
                args = list(args)        # Convert tuple to list for modification
                args[index] = token      # Replace the existing token argument
            else:  
                kwargs['token'] = token  # Set it in kwargs when required

        # Call the wrapped function with the modified args and kwargs
        response = f(*args, **kwargs)

        # If response is None or a string, convert it to a valid Flask Response object
        if response is None:
            response = make_response("No content", 204)  
        elif isinstance(response, str):
            response = make_response(response, 200)

        # Set the updated session token in the cookie with security flags
        response.set_cookie(
            "session_token", 
            token, 
            httponly=True,  # Prevent JavaScript access for security
            secure=True,  # Only allow over HTTPS
            samesite="Strict"  # Prevent cross-site request forgery (CSRF)
        )     

        return response  # Return the final response with the updated cookie
    
    return decorated
