from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

from app.models import User
from app.services.auth_service import register_user, authenticate_user, AuthError

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}
    try:
        user = register_user(
            username=data.get("username", "").strip(),
            email=data.get("email", "").strip().lower(),
            password=data.get("password", ""),
        )
    except AuthError as e:
        return jsonify({"error": e.message}), e.status_code

    access_token = create_access_token(identity=str(user.id))
    return jsonify({"user": user.to_dict(), "access_token": access_token}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    try:
        user = authenticate_user(
            username_or_email=data.get("username", "").strip(),
            password=data.get("password", ""),
        )
    except AuthError as e:
        return jsonify({"error": e.message}), e.status_code

    access_token = create_access_token(identity=str(user.id))
    return jsonify({"user": user.to_dict(), "access_token": access_token}), 200


@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    # Stateless JWT: logout is handled client-side by discarding the token.
    # This endpoint exists so the frontend has a consistent API to call.
    return jsonify({"message": "logged out"}), 200


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "user not found"}), 404
    return jsonify({"user": user.to_dict()}), 200
