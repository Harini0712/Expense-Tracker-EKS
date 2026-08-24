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
 

AWS ECS + ECR Deployment

The Expense Tracker can also be deployed to AWS using Docker, Amazon ECR, Amazon ECS (Fargate), an Application Load Balancer (ALB), Amazon RDS PostgreSQL, and CloudWatch Logs.

AWS Architecture

                         Internet
                            |
                            v
                 Application Load Balancer
                            |
                 +----------+----------+
                 |                     |
                 v                     v
          Frontend Target       Backend Target
             Group                  Group
                 |                     |
                 v                     v
          ECS Frontend           ECS Backend
          Container :80          Container :5000
                                       |
                                       v
                                Amazon RDS
                                PostgreSQL

AWS Services Used

Amazon ECR - stores the frontend and backend Docker images.

Amazon ECS (Fargate) - runs the frontend and backend containers.

Application Load Balancer (ALB) - provides the public entry point and routes traffic.

Amazon RDS PostgreSQL - stores application data.

Amazon CloudWatch Logs - stores ECS container logs.

ECR Repositories

Two ECR repositories are used:

expense-tracker-frontend
expense-tracker-backend

Example frontend image:

<AWS_ACCOUNT_ID>.dkr.ecr.ap-southeast-2.amazonaws.com/expense-tracker-frontend:v4

Build and Push Docker Images

Authenticate Docker with ECR:

aws ecr get-login-password --region ap-southeast-2 | docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.ap-southeast-2.amazonaws.com

Build the frontend image:

docker build --no-cache \
  --build-arg VITE_API_BASE_URL=http://<ALB-DNS>/api \
  -t expense-tracker-frontend:v1 .

Tag the image:

docker tag expense-tracker-frontend:v1 \
  <AWS_ACCOUNT_ID>.dkr.ecr.ap-southeast-2.amazonaws.com/expense-tracker-frontend:v1

Push the image to ECR:

docker push \
  <AWS_ACCOUNT_ID>.dkr.ecr.ap-southeast-2.amazonaws.com/expense-tracker-frontend:v1

The same build, tag, and push process is used for the backend image.

ECS Cluster and Services

The ECS cluster runs two services:

expense-tracker-frontend-service
expense-tracker-backend-service

The frontend service runs the React application through Nginx:

Frontend container
Port: 80

The backend service runs the Flask API through Gunicorn:

Backend container
Port: 5000

Application Load Balancer

The ALB provides the public endpoint for the application.

The listener routes traffic based on the request path:

/       -> Frontend Target Group
/api/*  -> Backend Target Group

Therefore, the frontend uses the ALB as the public API base URL:

http://<ALB-DNS>/api

The browser does not connect directly to the private ECS backend IP.

Environment Variables

The backend uses environment variables for database and application configuration.

Example:

FLASK_APP=run.py
FLASK_ENV=production
FLASK_DEBUG=0

DATABASE_URL=postgresql://<username>:<password>@<RDS-ENDPOINT>:5432/expense_tracker

JWT_SECRET_KEY=<long-random-secret>
JWT_ACCESS_TOKEN_EXPIRES_MINUTES=60

CORS_ORIGINS=http://<ALB-DNS>

The frontend API URL is provided during the Docker build because Vite VITE_* variables are compiled into the frontend application:

docker build \
  --build-arg VITE_API_BASE_URL=http://<ALB-DNS>/api \
  -t expense-tracker-frontend:v1 .

Do not commit production secrets or .env files to GitHub. Use environment variables or a secrets-management solution for production credentials.

ECS Deployment Flow

Dockerfile
    |
    v
Docker Build
    |
    v
Docker Image
    |
    v
Amazon ECR
    |
    v
ECS Task Definition
    |
    v
ECS Service
    |
    v
Running Container

When ECS starts a task, the task is registered with the appropriate ALB target group. ECS handles registration and deregistration as tasks are replaced.

Health Checks

Frontend target group:

Protocol: HTTP
Path: /
Port: 80
Success code: 200

Backend target group:

Protocol: HTTP
Path: /
Port: 5000
Success code: 200

Healthy ECS targets receive traffic from the ALB.

CloudWatch Logs

ECS container logs are sent to Amazon CloudWatch Logs.

Typical log groups:

/ecs/expense-tracker-frontend
/ecs/expense-tracker-backend

Frontend logs contain Nginx startup and access logs.

Backend logs contain Gunicorn and application logs.

AWS Application Flow

User
 |
 v
Application Load Balancer
 |
 +----------------------------+
 |                            |
 v                            v
Frontend ECS                Backend ECS
Nginx :80                   Flask :5000
                              |
                              v
                         RDS PostgreSQL

Local vs AWS

Local development:

React :5173
   |
Flask :5000
   |
PostgreSQL :5432

AWS deployment:

ALB :80
   |
   +--> Frontend ECS :80
   |
   +--> Backend ECS :5000
              |
              v
          RDS PostgreSQL

The application code remains decoupled from the infrastructure. Docker and ECS provide the runtime environment, while environment variables configure the application for each environment.

Git Commands

From the project root:

git status
git add .
git commit -m "Add local full stack expense tracker setup"
git push origin main

Current Status

The application has been tested locally with:

React frontend running on Vite

Flask backend running locally

PostgreSQL database connected

Alembic migrations applied

Default categories seeded

JWT authentication working

Expense CRUD working

Dashboard working

Frontend → Backend → PostgreSQL flow verified

Next Phase

Local Full-Stack Application
          |
          v
Docker
          |
          v
Docker Compose
          |
          v
Jenkins CI/CD
          |
          v
Kubernetes

