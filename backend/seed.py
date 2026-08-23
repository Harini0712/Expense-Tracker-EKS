"""Seed the database with default expense categories.

Run after migrations are applied:
    python seed.py
"""

from app import create_app
from app.extensions import db
from app.models import Category, DEFAULT_CATEGORIES

app = create_app()

with app.app_context():
    created = 0
    for name in DEFAULT_CATEGORIES:
        if not Category.query.filter_by(name=name).first():
            db.session.add(Category(name=name))
            created += 1
    db.session.commit()
    print(f"Seed complete. {created} new categories added.")
