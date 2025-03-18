import jwt

SECRET_KEY = "your_secret_key"  # todo Keep this secret!

def generate_jwt(username, hub_identity):
    payload = {
        "username": username,
        "hub_identity": hub_identity
    }

    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

def validate_jwt(token):
    """
    Decode and validate the JWT.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload  # Returns decoded user data
    except jwt.ExpiredSignatureError:
        return "Token expired"
    except jwt.InvalidTokenError:
        return "Invalid token"