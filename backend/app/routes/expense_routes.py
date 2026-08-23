from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.services.expense_service import (
    create_expense,
    update_expense,
    delete_expense,
    get_expense,
    list_expenses,
    ExpenseError,
)

expense_bp = Blueprint("expenses", __name__, url_prefix="/api/expenses")


@expense_bp.route("", methods=["GET"])
@jwt_required()
def get_expenses():
    user_id = int(get_jwt_identity())

    category_id = request.args.get("category_id", type=int)
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")

    try:
        expenses = list_expenses(
            user_id, category_id=category_id, start_date=start_date, end_date=end_date
        )
    except ExpenseError as e:
        return jsonify({"error": e.message}), e.status_code

    return jsonify({"expenses": [e.to_dict() for e in expenses]}), 200


@expense_bp.route("", methods=["POST"])
@jwt_required()
def add_expense():
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}

    try:
        expense = create_expense(user_id, data)
    except ExpenseError as e:
        return jsonify({"error": e.message}), e.status_code

    return jsonify({"expense": expense.to_dict()}), 201


@expense_bp.route("/<int:expense_id>", methods=["GET"])
@jwt_required()
def get_single_expense(expense_id):
    user_id = int(get_jwt_identity())
    try:
        expense = get_expense(user_id, expense_id)
    except ExpenseError as e:
        return jsonify({"error": e.message}), e.status_code
    return jsonify({"expense": expense.to_dict()}), 200


@expense_bp.route("/<int:expense_id>", methods=["PUT"])
@jwt_required()
def edit_expense(expense_id):
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}

    try:
        expense = update_expense(user_id, expense_id, data)
    except ExpenseError as e:
        return jsonify({"error": e.message}), e.status_code

    return jsonify({"expense": expense.to_dict()}), 200


@expense_bp.route("/<int:expense_id>", methods=["DELETE"])
@jwt_required()
def remove_expense(expense_id):
    user_id = int(get_jwt_identity())
    try:
        delete_expense(user_id, expense_id)
    except ExpenseError as e:
        return jsonify({"error": e.message}), e.status_code

    return jsonify({"message": "expense deleted"}), 200
