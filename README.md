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
- `GET /api/tasks/:id` - return one of the authenticated user's tasks
- `PUT /api/tasks/:id` - update the authenticated user's task
- `DELETE /api/tasks/:id` - delete the authenticated user's task
- `GET /api/cache/stats` - authenticated cache hit/miss counters and configuration
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

## Practical 9: In-Memory Caching and Query Optimization

The backend uses a shared `node-cache` instance with a default 60-second TTL. Task list
and task detail cache keys include the authenticated user's ID, so one user's task data
cannot be served to another user. A successful task create, update, or delete invalidates
that user's list cache and the affected detail cache where applicable. Database errors,
invalid task IDs, authorization, validation, and the existing MongoDB-backed CRUD behavior
remain unchanged.

`GET /api/tasks` and `GET /api/tasks/:id` increment the cache hit counter when a cached
response is returned. A cache miss queries MongoDB, stores the result for 60 seconds, and
returns it. `GET /api/cache/stats` requires the same Bearer token as task endpoints and
returns the in-process counters. Counters reset when the backend process restarts.

### Response-time comparison

Collect both measurements against the same running backend, MongoDB database, user,
task dataset, machine, and request conditions. Do not replace the placeholders with
estimates; record measured values from browser DevTools or a request timing tool.

| Measurement | MongoDB query (cache miss) | In-memory response (cache hit) | How to record |
| --- | --- | --- | --- |
| `GET /api/tasks` response time | `[collect manually]` | `[collect manually]` | Time the first request after invalidation, then the next request with the same Bearer token |
| `GET /api/tasks/:id` response time | `[collect manually]` | `[collect manually]` | Time the first detail request, then repeat it with the same Bearer token |

### Manual cache verification

1. Start MongoDB and the backend with the existing `backend/.env` configuration; do not
   replace MongoDB with mock data.
2. Register or log in as User A and save the returned JWT.
3. Call `GET /api/tasks` with `Authorization: Bearer <user-a-token>`. This is a cache
   miss. Repeat the request; it is a cache hit and should not query MongoDB.
4. Call `GET /api/cache/stats` with User A's token and record the `hits`, `misses`,
   `totalRequests`, `keys`, and `ttlSeconds` values.
5. Call `GET /api/tasks/:id` twice for an existing User A task and verify the detail
   request changes from miss to hit. Try a malformed ID and a nonexistent ID and verify
   the existing 400 and 404 responses.
6. Create a task with `POST /api/tasks`, then request the list again. The mutation must
   invalidate the list cache, so the next list request is a miss and includes the new task.
7. Update a task with `PUT /api/tasks/:id`, verify the list/detail responses contain the
   update, then delete it with `DELETE /api/tasks/:id` and verify it no longer appears.
   Confirm each successful mutation causes the next relevant GET to miss.
8. Register or log in as User B. Request the same list and detail endpoints with User B's
   token and verify User A's tasks are not returned. Check the cache stats using each
   token to confirm keys are user-scoped.
9. Repeat the unauthenticated, invalid-token, validation, and authorization checks from
   Practical 7 to confirm caching did not bypass existing protections.

### Practical 9 screenshots

1. Backend terminal showing the server connected to MongoDB and running.
2. API client or browser Network panel showing two identical authenticated list requests
   and the `/api/cache/stats` response with hit/miss counters.
3. API client showing cache invalidation after a successful create, update, and delete.
4. API client showing User A and User B requests with isolated task data.
5. Your completed response-time comparison table with measured values from the same test
   conditions.
