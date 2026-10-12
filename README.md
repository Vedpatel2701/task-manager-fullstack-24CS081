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

## Practical 8: Performance Optimization and Lazy Loading

The frontend keeps the existing authentication and task-management behavior while splitting the authenticated and unauthenticated route views into separate React lazy-loaded chunks. The task list is also loaded as an additional chunk when the task dashboard is rendered. `Suspense` provides a user-friendly loading state, and an error boundary gives a safe refresh message if a lazy chunk cannot be loaded.

### Production build evidence

The pre-optimization baseline was recorded before the lazy-loading changes. Replace the manual placeholders below only with values captured from the same production build and browser conditions:

| Measurement | Baseline | Optimized | How to record |
| --- | --- | --- | --- |
| Initial JavaScript bundle | 228.27 kB (71.06 kB gzip) | 225.25 kB (70.61 kB gzip) | Compare the Vite build output |
| JavaScript transferred on initial view | `[collect manually]` | `[collect manually]` | Chrome DevTools Network, disable cache |
| Page-load measurement | `[collect manually]` | `[collect manually]` | Chrome DevTools Performance or Lighthouse |

To observe lazy loading, run `npm run build` and `npm run preview` in `frontend`, open the preview URL, and open Chrome DevTools **Network**. Enable **Disable cache**, select **Slow 3G** throttling, reload, and filter by `JS`. The authentication and task dashboard chunks should load separately when their views are needed; the loading fallback should be visible during a delayed chunk request.

Use **React DevTools Profiler** to record a login-to-dashboard interaction and a task edit or completion. Select a commit with a larger update, inspect the component that rendered, and use the “why did this render?” information to investigate whether changed props or state caused an unnecessary re-render. Do not report a finding unless it is visible in the profiler recording.

### Practical 8 screenshots

1. The optimized `npm run build` output showing multiple JavaScript chunks.
2. Chrome DevTools Network with Slow 3G and the lazy chunk request/loading fallback visible.
3. The authenticated task dashboard after navigation, showing existing task functionality.
4. React DevTools Profiler showing the recorded interaction and selected component render details.
