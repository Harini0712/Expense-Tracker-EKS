from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required

from app.models import Category

category_bp = Blueprint("categories", __name__, url_prefix="/api/categories")


@category_bp.route("", methods=["GET"])
@jwt_required()
def list_categories():
    categories = Category.query.order_by(Category.name).all()
    return jsonify({"categories": [c.to_dict() for c in categories]}), 200
