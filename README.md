# Expense Tracker

A full-stack expense tracking app: React frontend, Flask REST API backend,
PostgreSQL database via SQLAlchemy. Built to run locally first, with
frontend and backend fully decoupled so Docker/Kubernetes can be layered on
later without touching application code.

## Tech stack

- **Frontend:** React 18 (Vite), React Router, Axios, Recharts
- **Backend:** Flask 3, Flask-SQLAlchemy, Flask-Migrate (Alembic), Flask-JWT-Extended, Flask-CORS
- **Database:** PostgreSQL
- **Auth:** JWT (JSON Web Tokens), passwords hashed with Werkzeug's `generate_password_hash`

## Project structure

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
│   ├── requirements.txt
│   ├── run.py
│   ├── seed.py           # Seeds the 8 default categories
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

- Python 3.10+
- Node.js 18+ and npm
- PostgreSQL 14+ (see `database/README.md` for setup)

## 1. Set up the database

Follow `database/README.md` first — it creates the `expense_tracker`
database and a `expense_user` role.

## 2. Run the backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# edit .env if your DB credentials differ from the defaults

flask db upgrade                # creates tables
python seed.py                  # seeds default categories

python run.py                   # starts on http://localhost:5000
```

Check it's alive:
```bash
curl http://localhost:5000/api/health
# {"status": "ok"}
```

### Backend environment variables (`backend/.env`)

| Variable                          | Description                                  |
|------------------------------------|-----------------------------------------------|
| `DATABASE_URL`                     | PostgreSQL connection string                  |
| `JWT_SECRET_KEY`                   | Secret used to sign JWTs — change in production |
| `JWT_ACCESS_TOKEN_EXPIRES_MINUTES` | Token lifetime in minutes                     |
| `CORS_ORIGINS`                     | Comma-separated list of allowed frontend origins |
| `FLASK_ENV` / `FLASK_DEBUG`        | development / production                      |

No credentials are hardcoded anywhere in the source — everything is read
from environment variables via `python-dotenv`.

## 3. Run the frontend

In a second terminal:
```bash
cd frontend
npm install

cp .env.example .env
# VITE_API_BASE_URL=http://localhost:5000/api

npm run dev                     # starts on http://localhost:5173
```

Open http://localhost:5173, register a new account, and start adding
expenses.

### Frontend environment variables (`frontend/.env`)

| Variable              | Description                          |
|------------------------|---------------------------------------|
| `VITE_API_BASE_URL`   | Base URL of the Flask backend's API   |

No backend URL is hardcoded in source — it's always read from this variable,
so pointing the frontend at a different backend (staging, a Kubernetes
service, etc.) later is a config change, not a code change.

## API overview

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

All authenticated endpoints expect `Authorization: Bearer <access_token>`.

## Making database changes later

If you change a model in `backend/app/models/`, generate and apply a new
migration:
```bash
cd backend
flask db migrate -m "describe your change"
flask db upgrade
```

## Notes for the DevOps phase (not done yet, on purpose)

This app was deliberately built to run without Docker first, per the brief.
When Docker/Kubernetes/Helm/Jenkins/Argo CD get layered on:

- Backend and frontend are separate folders/processes — each can get its
  own Dockerfile and be deployed as its own container/deployment.
- Nothing reads a hardcoded URL or credential — `DATABASE_URL`,
  `JWT_SECRET_KEY`, and `VITE_API_BASE_URL` are all meant to become
  Kubernetes ConfigMap/Secret values later.
- `backend/migrations/` already contains a working initial migration, so a
  Kubernetes Job or init container can run `flask db upgrade` against RDS
  PostgreSQL without regenerating migrations.
- The React build (`npm run build`) produces static files that can be
  served from an nginx container, separate from the Flask API container.

## Troubleshooting

- **`psycopg2` fails to install:** make sure PostgreSQL dev headers are
  installed (`sudo apt install libpq-dev` on Ubuntu), or just use the
  `psycopg2-binary` wheel already pinned in `requirements.txt`.
- **CORS errors in the browser console:** confirm `CORS_ORIGINS` in
  `backend/.env` includes `http://localhost:5173` exactly.
- **401 errors right after login:** check `VITE_API_BASE_URL` matches
  where Flask is actually running.
