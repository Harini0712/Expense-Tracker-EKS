from datetime import datetime, date
from calendar import monthrange

from sqlalchemy import func

from app.extensions import db
from app.models import Expense, Category


class ExpenseError(Exception):
    def __init__(self, message, status_code=400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


def _parse_date(value, field_name):
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except (ValueError, TypeError):
        raise ExpenseError(f"{field_name} must be in YYYY-MM-DD format")


def create_expense(user_id, data):
    amount = data.get("amount")
    category_id = data.get("category_id")
    expense_date = data.get("date")
    description = data.get("description", "")

    if amount is None or category_id is None or not expense_date:
        raise ExpenseError("amount, category_id and date are required")

    try:
        amount = float(amount)
    except (TypeError, ValueError):
        raise ExpenseError("amount must be a number")

    if amount <= 0:
        raise ExpenseError("amount must be greater than 0")

    category = Category.query.get(category_id)
    if not category:
        raise ExpenseError("invalid category_id")

    parsed_date = _parse_date(expense_date, "date")

    expense = Expense(
        user_id=user_id,
        category_id=category_id,
        amount=amount,
        description=description,
        date=parsed_date,
    )
    db.session.add(expense)
    db.session.commit()
    return expense


def update_expense(user_id, expense_id, data):
    expense = Expense.query.filter_by(id=expense_id, user_id=user_id).first()
    if not expense:
        raise ExpenseError("expense not found", 404)

    if "amount" in data:
        try:
            amount = float(data["amount"])
        except (TypeError, ValueError):
            raise ExpenseError("amount must be a number")
        if amount <= 0:
            raise ExpenseError("amount must be greater than 0")
        expense.amount = amount

    if "category_id" in data:
        category = Category.query.get(data["category_id"])
        if not category:
            raise ExpenseError("invalid category_id")
        expense.category_id = data["category_id"]

    if "date" in data:
        expense.date = _parse_date(data["date"], "date")

    if "description" in data:
        expense.description = data["description"]

    db.session.commit()
    return expense


def delete_expense(user_id, expense_id):
    expense = Expense.query.filter_by(id=expense_id, user_id=user_id).first()
    if not expense:
        raise ExpenseError("expense not found", 404)
    db.session.delete(expense)
    db.session.commit()


def get_expense(user_id, expense_id):
    expense = Expense.query.filter_by(id=expense_id, user_id=user_id).first()
    if not expense:
        raise ExpenseError("expense not found", 404)
    return expense


def list_expenses(user_id, category_id=None, start_date=None, end_date=None):
    query = Expense.query.filter_by(user_id=user_id)

    if category_id:
        query = query.filter(Expense.category_id == category_id)

    if start_date:
        query = query.filter(Expense.date >= _parse_date(start_date, "start_date"))

    if end_date:
        query = query.filter(Expense.date <= _parse_date(end_date, "end_date"))

    return query.order_by(Expense.date.desc(), Expense.id.desc()).all()


def get_dashboard_summary(user_id):
    today = date.today()
    month_start = today.replace(day=1)
    month_end = today.replace(day=monthrange(today.year, today.month)[1])

    total = (
        db.session.query(func.coalesce(func.sum(Expense.amount), 0))
        .filter(Expense.user_id == user_id)
        .scalar()
    )

    current_month_total = (
        db.session.query(func.coalesce(func.sum(Expense.amount), 0))
        .filter(
            Expense.user_id == user_id,
            Expense.date >= month_start,
            Expense.date <= month_end,
        )
        .scalar()
    )

    category_totals = (
        db.session.query(Category.name, func.coalesce(func.sum(Expense.amount), 0))
        .join(Expense, Expense.category_id == Category.id)
        .filter(Expense.user_id == user_id)
        .group_by(Category.name)
        .all()
    )

    recent = (
        Expense.query.filter_by(user_id=user_id)
        .order_by(Expense.date.desc(), Expense.id.desc())
        .limit(5)
        .all()
    )

    return {
        "total_expenses": float(total),
        "current_month_expenses": float(current_month_total),
        "category_wise": [
            {"category": name, "total": float(amount)} for name, amount in category_totals
        ],
        "recent_expenses": [expense.to_dict() for expense in recent],
    }
