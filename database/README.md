# Database Setup — PostgreSQL

This app uses PostgreSQL, accessed through SQLAlchemy models in the backend.
Tables are created via Flask-Migrate (Alembic) migrations — you do **not**
need to write SQL by hand. This folder just documents how to get a local
Postgres instance ready.

## 1. Install PostgreSQL locally

**Ubuntu/Debian**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**macOS (Homebrew)**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Windows**
Download and install from https://www.postgresql.org/download/windows/

## 2. Create the database and a dedicated user

Open the Postgres shell:
```bash
sudo -u postgres psql
```

Then run:
```sql
CREATE DATABASE expense_tracker;
CREATE USER expense_user WITH PASSWORD 'expense_password';
GRANT ALL PRIVILEGES ON DATABASE expense_tracker TO expense_user;
ALTER DATABASE expense_tracker OWNER TO expense_user;
\q
```

> Use a stronger password for anything beyond local development. This is
> just a placeholder to match `backend/.env.example`.

## 3. Point the backend at your database

In `backend/.env` (copied from `backend/.env.example`), set:
```
DATABASE_URL=postgresql://expense_user:expense_password@localhost:5432/expense_tracker
```

## 4. Create the tables

From the `backend/` folder, with your virtual environment active:
```bash
flask db upgrade
python seed.py
```

`flask db upgrade` creates the `users`, `categories`, and `expenses` tables
(the migration is already included in `backend/migrations/`). `seed.py`
inserts the default categories: Food, Travel, Shopping, Bills, Health,
Education, Entertainment, Other.

## 5. Verify

```bash
psql -U expense_user -d expense_tracker -h localhost -c "\dt"
```

You should see `users`, `categories`, `expenses`, and `alembic_version`.

## Schema overview

| Table      | Key columns                                                             |
|------------|--------------------------------------------------------------------------|
| users      | id, username (unique), email (unique), password_hash, created_at        |
| categories | id, name (unique)                                                        |
| expenses   | id, user_id (FK → users), category_id (FK → categories), amount, date, description, created_at, updated_at |

Each expense belongs to exactly one user and one category. Deleting a user
cascades and deletes their expenses (see `User.expenses` relationship in
`backend/app/models/user.py`).
