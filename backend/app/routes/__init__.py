from app.routes.auth_routes import auth_bp
from app.routes.expense_routes import expense_bp
from app.routes.category_routes import category_bp
from app.routes.dashboard_routes import dashboard_bp


def register_routes(app):
    app.register_blueprint(auth_bp)
    app.register_blueprint(expense_bp)
    app.register_blueprint(category_bp)
    app.register_blueprint(dashboard_bp)
