"""Extension instances shared across the app.

Kept in their own module (instead of inside __init__.py) so models and
routes can import `db` / `jwt` without circular imports.
"""

from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
cors = CORS()
