from app.extensions import db
from app.models import User


class AuthError(Exception):
    def __init__(self, message, status_code=400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


def register_user(username, email, password):
    if not username or not email or not password:
        raise AuthError("username, email and password are required")

    if len(password) < 6:
        raise AuthError("password must be at least 6 characters long")

    if User.query.filter_by(username=username).first():
        raise AuthError("username already taken", 409)

    if User.query.filter_by(email=email).first():
        raise AuthError("email already registered", 409)

    user = User(username=username, email=email)
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    return user


def authenticate_user(username_or_email, password):
    if not username_or_email or not password:
        raise AuthError("username/email and password are required")

    user = User.query.filter(
        (User.username == username_or_email) | (User.email == username_or_email)
    ).first()

    if not user or not user.check_password(password):
        raise AuthError("invalid credentials", 401)

    return user
