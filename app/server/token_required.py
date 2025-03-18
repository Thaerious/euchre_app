from functools import wraps
from flask import request, jsonify, render_template
from SQLAccounts import SQLAccounts

def token_required(f):    

    @wraps(f)
    def decorated(*args, **kwargs):
        sqlAccounts = SQLAccounts("./app/accounts.db")
        token = request.cookies.get("session_token")

        if not token:
            return render_template("index.html")
        
        if not sqlAccounts.validate_session(token):
            return render_template("index.html")
        
        sqlAccounts.refresh_session(token)
        return f(*args, **kwargs)
    
    return decorated