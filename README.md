# Expense Tracker

A full-stack expense tracking app: React frontend, Flask REST API backend, PostgreSQL database via SQLAlchemy. Built to run locally first, with frontend and backend fully decoupled so Docker/Kubernetes can be layered on later without touching application code.

## Tech Stack

- **Frontend:** React 18 (Vite), React Router, Axios, Recharts
- **Backend:** Flask 3, Flask-SQLAlchemy, Flask-Migrate (Alembic), Flask-JWT-Extended, Flask-CORS
- **Database:** PostgreSQL
- **Auth:** JWT (JSON Web Tokens), passwords hashed with Werkzeug's `generate_password_hash`
- <img width="1919" height="869" alt="image" src="https://github.com/user-attachments/assets/712035ad-eaf3-46c0-b111-f0dcbb3eb52d" />


## Local Architecture

```
React Frontend
http://localhost:5173
        |
        | REST API / JSON
        v
Flask Backend
http://127.0.0.1:5000
        |
        | SQLAlchemy
        v
PostgreSQL
expense_tracker : 5432
```

## Project Structure

```
expense-tracker/
├── backend/
│   ├── app/
│   │   ├── models/      # User, Category, Expense (SQLAlchemy models)
│   │   ├── routes/      # Flask blueprints (auth, expenses, categories, dashboard)
│   │   ├── services/    # Business logic, separate from routes
│   │   ├── config/      # Env-driven configuration
│   │   ├── utils/       # Error handlers
│   │   ├── extensions.py
│   │   └── __init__.py  # App factory
│   ├── migrations/      # Alembic migrations (already generated)
│   ├── venv/
│   ├── requirements.txt
│   ├── run.py
│   ├── seed.py           # Seeds the 8 default categories
│   ├── .env
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/   # Navbar, ExpenseForm, ExpenseList, Filters, charts...
│   │   ├── pages/        # Login, Register, Dashboard, Expenses
│   │   ├── services/     # Axios API calls
│   │   ├── hooks/        # useAuth
│   │   ├── context/      # AuthContext
│   │   └── App.jsx
│   ├── package.json
│   ├── index.html
│   ├── vite.config.js
│   └── .env.example
├── database/
│   └── README.md         # PostgreSQL local setup instructions
└── .gitignore
```

## Features

- Register / login / logout with JWT auth, passwords hashed (never stored in plain text)
- Every expense is scoped to the logged-in user
- Add, edit, delete, and list expenses
- Filter expenses by category and by date range
- Dashboard: total expenses, current month's expenses, category-wise breakdown (pie chart), recent expenses
- 8 built-in categories: Food, Travel, Shopping, Bills, Health, Education, Entertainment, Other

## Prerequisites

- Python 3.13
- Node.js and npm
- PostgreSQL 18
- pgAdmin 4
- Git

## Run the Project Locally

### 1. Create PostgreSQL Database

Open pgAdmin and create a database:

- Database name: `expense_tracker`
- Create/use a PostgreSQL login role for the application

The backend uses this connection format:

```
postgresql://<username>:<password>@localhost:5432/expense_tracker
```

Example:

```
postgresql://expense_user:expense_password@localhost:5432/expense_tracker
```

Make sure PostgreSQL is running before starting the backend. See `database/README.md` for full setup instructions.

### 2. Backend Setup

Open PowerShell:

```powershell
cd expense-tracker\backend
```

Create and activate a virtual environment:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

You should see `(venv)` in your prompt. Install dependencies:

```powershell
python -m pip install -r requirements.txt
```

### 3. Backend Environment Variables

Create `backend/.env` with your local PostgreSQL credentials:

```
FLASK_APP=run.py
FLASK_ENV=development
FLASK_DEBUG=1

DATABASE_URL=postgresql://expense_user:expense_password@localhost:5432/expense_tracker

JWT_SECRET_KEY=change-this-to-a-long-random-secret
JWT_ACCESS_TOKEN_EXPIRES_MINUTES=60

CORS_ORIGINS=http://localhost:5173
```

> Do not commit `.env` to GitHub. Commit `.env.example` instead.

| Variable                          | Description                                      |
|------------------------------------|---------------------------------------------------|
| `DATABASE_URL`                     | PostgreSQL connection string                       |
| `JWT_SECRET_KEY`                   | Secret used to sign JWTs — change in production    |
| `JWT_ACCESS_TOKEN_EXPIRES_MINUTES` | Token lifetime in minutes                          |
| `CORS_ORIGINS`                     | Comma-separated list of allowed frontend origins    |
| `FLASK_ENV` / `FLASK_DEBUG`        | development / production                           |

No credentials are hardcoded anywhere in the source — everything is read from environment variables via `python-dotenv`.

### 4. Create Database Tables

With the virtual environment active:

```powershell
flask db upgrade
```

This applies the Alembic migrations and creates the application tables: `users`, `categories`, `expenses`, `alembic_version`.

### 5. Add Default Categories

```powershell
python seed.py
```

Adds the default categories if they don't already exist: Food, Travel, Shopping, Bills, Health, Education, Entertainment, Other.

### 6. Start Flask Backend

```powershell
python run.py
```

Backend runs at `http://127.0.0.1:5000`. Health check: `GET http://127.0.0.1:5000/api/health` → `{"status": "ok"}`

### 7. Frontend Setup

Open a **new** PowerShell terminal (keep the backend one running):

```powershell
cd expense-tracker\frontend
npm install
```

> If `npm audit fix --force` is used, it may upgrade packages to breaking major versions. Avoid it unless dependencies are intentionally upgraded and tested.

Create `frontend/.env` from `frontend/.env.example`:

```
VITE_API_BASE_URL=http://127.0.0.1:5000/api
```

No backend URL is hardcoded in source — pointing the frontend at a different backend later (staging, a Kubernetes service, etc.) is a config change, not a code change.

### 8. Start React Frontend

```powershell
npm run dev
```

Vite shows `Local: http://localhost:5173/`. Open it in your browser, register a new account, and start adding expenses.

## API Overview

| Method | Endpoint                  | Description                          | Auth required |
|--------|----------------------------|---------------------------------------|:---:|
| POST   | `/api/auth/register`       | Create a new user                     | No  |
| POST   | `/api/auth/login`          | Log in, returns JWT                   | No  |
| POST   | `/api/auth/logout`         | Logout (client discards token)        | Yes |
| GET    | `/api/auth/me`             | Current user info                     | Yes |
| GET    | `/api/categories`          | List all categories                   | Yes |
| GET    | `/api/expenses`            | List expenses (supports `?category_id=`, `?start_date=`, `?end_date=`) | Yes |
| POST   | `/api/expenses`            | Create an expense                     | Yes |
| GET    | `/api/expenses/<id>`       | Get a single expense                  | Yes |
| PUT    | `/api/expenses/<id>`       | Update an expense                     | Yes |
| DELETE | `/api/expenses/<id>`       | Delete an expense                     | Yes |
| GET    | `/api/dashboard/summary`   | Total, current-month total, category breakdown, recent expenses | Yes |
| GET    | `/api/health`               | Health check                          | No  |

All authenticated endpoints expect `Authorization: Bearer <access_token>`. You can test these using Postman.

## How Frontend, Backend and Database Connect

```
User
 |
 v
React Frontend
localhost:5173
 |
 | Axios HTTP request / JSON
 v
Flask REST API
127.0.0.1:5000
 |
 | SQLAlchemy
 v
PostgreSQL
localhost:5432
 |
 v
expense_tracker database
```

**Example: Add Expense**

1. User enters amount/category/date
2. React sends `POST /api/expenses`
3. Flask receives the request
4. JWT identifies the logged-in user
5. SQLAlchemy creates the expense record
6. PostgreSQL stores the data
7. Flask returns JSON response
8. React updates the Expenses page

## Verify Data in pgAdmin

Open: `expense_tracker` → `Schemas` → `public` → `Tables`

Important tables: `users`, `categories`, `expenses`, `alembic_version`

```sql
SELECT *
FROM public.expenses
ORDER BY id ASC;
```

## Test the Complete Application

**Register** — `POST /api/auth/register`

```json
{
  "username": "bob",
  "email": "bob@example.com",
  "password": "bob@123"
}
```

Returns an access token.

**Login** — `POST /api/auth/login`

**Add Expense** — via the frontend Add Expense form

**Verify** — Expenses page, Dashboard total, Category-wise spending, and the PostgreSQL `expenses` table should all agree.

## Local Ports

| Component    | Port |
|--------------|------|
| React / Vite | 5173 |
| Flask        | 5000 |
| PostgreSQL   | 5432 |

## Making Database Changes Later

If you change a model in `backend/app/models/`, generate and apply a new migration:

```bash
cd backend
flask db migrate -m "describe your change"
flask db upgrade
```

## Troubleshooting

- **`psycopg2` fails to install:** make sure PostgreSQL dev headers are
  installed (`sudo apt install libpq-dev` on Ubuntu), or just use the
  `psycopg2-binary` wheel already pinned in `requirements.txt`.
- **CORS errors in the browser console:** confirm `CORS_ORIGINS` in
  `backend/.env` includes `http://localhost:5173` exactly.
- **401 errors right after login:** check `VITE_API_BASE_URL` matches
  where Flask is actually running.
 



