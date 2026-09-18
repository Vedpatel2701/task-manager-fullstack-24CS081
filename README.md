# Task Manager Full Stack - Practical 6

**Student:** Ved Patel  
**Roll No:** 24CS081

A React and Node.js task manager with MongoDB persistence. The project is split into an Express/Mongoose backend and a Vite React frontend.

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
# Update MONGO_URI in .env if needed
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

## API endpoints

- `GET /api/tasks` - list tasks
- `POST /api/tasks` - create a task
- `PUT /api/tasks/:id` - update title, description, or completion state
- `DELETE /api/tasks/:id` - delete a task
- `GET /api/health` - health check

No authentication or JWT is included, as required for Practical 6.
