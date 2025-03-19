import jwt

SECRET_KEY = "your_secret_key"  # todo Keep this secret!

def generate_jwt(username, hub_id):
    payload = {
        "username": username,
        "hub_id": hub_id
    }

    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

def validate_jwt(token):
    """
    Decode and validate the JWT.
    """
    payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    return payload  # Returns decoded user data
