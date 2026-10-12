# Task Manager Full Stack - Practical 7

**Student:** Ved Patel  
**Roll No:** 24CS081

A React and Node.js task manager with MongoDB persistence and JWT authentication. Practical 6 task CRUD is preserved and now protected by a login session.

## Structure

- `backend/` - Express REST API, Mongoose Task model, and MongoDB connection
- `frontend/` - React task manager interface

## Requirements

- Node.js 18+
- MongoDB running locally, or a MongoDB Atlas connection string

## Run the backend

```powershell
cd backend
Copy-Item .env.example .env
# Update MONGO_URI and JWT_SECRET in .env if needed
npm run dev
```

The API runs at `http://localhost:5000`.

## Run the frontend

```powershell
cd frontend
npm run dev
```

Vite prints the local frontend URL, usually `http://localhost:5173`.

The frontend uses `VITE_API_URL` when provided and otherwise calls `http://localhost:5000/api`.

## Authentication and API endpoints

- `POST /api/register` - create an account and receive a one-hour JWT
- `POST /api/login` - verify credentials and receive a one-hour JWT
- `GET /api/me` - return the authenticated user
- `GET /api/tasks` - list the authenticated user's tasks
- `POST /api/tasks` - create a task for the authenticated user
- `PUT /api/tasks/:id` - update the authenticated user's task
- `DELETE /api/tasks/:id` - delete the authenticated user's task
- `GET /api/health` - health check

Task endpoints require `Authorization: Bearer <token>`. Passwords are hashed with bcryptjs and JWT_SECRET is loaded from `backend/.env`; never commit `.env`.

## Practical 7 verification

1. Register a new account, then verify a user document contains a bcrypt hash rather than the plain password.
2. Test valid and invalid login credentials and copy the returned token.
3. Request `/api/tasks` without a token, with an invalid token, and with an expired token; each must return HTTP 401.
4. Send the token as a Bearer header and verify task create, list, update/complete, and delete operations.
5. Request `/api/me` with the token and verify the returned email.
6. Use the frontend Logout button, refresh, and verify the login screen appears.
