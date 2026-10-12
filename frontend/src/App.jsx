import { useEffect, useState } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

async function request(endpoint, options = {}, token = '') {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new ApiError(data.message || 'Request failed', response.status)
  return data
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('task_manager_token') || '')
  const [user, setUser] = useState(null)
  const [authMode, setAuthMode] = useState('login')
  const [authForm, setAuthForm] = useState({ email: '', password: '' })
  const [authLoading, setAuthLoading] = useState(false)
  const [tasks, setTasks] = useState([])
  const [form, setForm] = useState({ title: '', description: '' })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [workingId, setWorkingId] = useState('')
  const [editingId, setEditingId] = useState('')
  const [editForm, setEditForm] = useState({ title: '', description: '' })

  useEffect(() => {
    if (!token) {
      setLoading(false)
      setUser(null)
      setTasks([])
      return
    }
    restoreSession()
  }, [token])

  async function restoreSession() {
    setLoading(true)
    try {
      const session = await request('/me', {}, token)
      setUser(session.user)
      await loadTasks(token)
    } catch (requestError) {
      if (requestError.status === 401) logout()
      else setError(requestError.message)
      setLoading(false)
    }
  }

  async function loadTasks(authToken = token) {
    setLoading(true)
    setError('')
    try {
      setTasks(await request('/tasks', {}, authToken))
    } catch (requestError) {
      if (requestError.status === 401) logout()
      else setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  function logout() {
    localStorage.removeItem('task_manager_token')
    setToken('')
    setUser(null)
    setTasks([])
    setNotice('')
    setError('')
  }

  function updateAuthForm(event) {
    setAuthForm({ ...authForm, [event.target.name]: event.target.value })
  }

  async function submitAuth(event) {
    event.preventDefault()
    setAuthLoading(true)
    setError('')
    setNotice('')
    try {
      const result = await request(`/${authMode}`, {
        method: 'POST',
        body: JSON.stringify(authForm),
      })
      localStorage.setItem('task_manager_token', result.token)
      setUser(result.user)
      setAuthForm({ email: '', password: '' })
      setToken(result.token)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setAuthLoading(false)
    }
  }

  function updateForm(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  async function addTask(event) {
    event.preventDefault()
    if (!form.title.trim()) return setError('Please enter a task title.')

    setSubmitting(true)
    setError('')
    setNotice('')
    try {
      const newTask = await request('/tasks', {
        method: 'POST',
        body: JSON.stringify(form),
      }, token)
      setTasks([newTask, ...tasks])
      setForm({ title: '', description: '' })
      setNotice('Task added successfully.')
    } catch (requestError) {
      if (requestError.status === 401) logout()
      else setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function toggleTask(task) {
    setWorkingId(task._id)
    setError('')
    try {
      const updatedTask = await request(`/tasks/${task._id}`, {
        method: 'PUT',
        body: JSON.stringify({ completed: !task.completed }),
      }, token)
      setTasks(tasks.map((item) => item._id === task._id ? updatedTask : item))
      setNotice(updatedTask.completed ? 'Task marked complete.' : 'Task moved back to your list.')
    } catch (requestError) {
      if (requestError.status === 401) logout()
      else setError(requestError.message)
    } finally {
      setWorkingId('')
    }
  }

  function startEditing(task) {
    setEditingId(task._id)
    setEditForm({ title: task.title, description: task.description || '' })
    setError('')
    setNotice('')
  }

  function updateEditForm(event) {
    setEditForm({ ...editForm, [event.target.name]: event.target.value })
  }

  async function updateTask(event, task) {
    event.preventDefault()
    if (!editForm.title.trim()) return setError('Please enter a task title.')

    setWorkingId(task._id)
    setError('')
    try {
      const updatedTask = await request(`/tasks/${task._id}`, {
        method: 'PUT',
        body: JSON.stringify(editForm),
      }, token)
      setTasks(tasks.map((item) => item._id === task._id ? updatedTask : item))
      setEditingId('')
      setNotice('Task updated successfully.')
    } catch (requestError) {
      if (requestError.status === 401) logout()
      else setError(requestError.message)
    } finally {
      setWorkingId('')
    }
  }

  async function deleteTask(task) {
    if (!window.confirm(`Delete "${task.title}"? This cannot be undone.`)) return

    setWorkingId(task._id)
    setError('')
    try {
      await request(`/tasks/${task._id}`, { method: 'DELETE' }, token)
      setTasks(tasks.filter((item) => item._id !== task._id))
      setNotice('Task deleted successfully.')
    } catch (requestError) {
      if (requestError.status === 401) logout()
      else setError(requestError.message)
    } finally {
      setWorkingId('')
    }
  }

  if (!token || !user) {
    return (
      <main className="auth-shell">
        <section className="auth-panel">
          <div className="brand-mark">TM</div>
          <p className="eyebrow">Practical 7 / 24CS081</p>
          <h1>{authMode === 'login' ? 'Welcome back.' : 'Start with a clean slate.'}</h1>
          <p className="intro-copy">Sign in to manage your private task workspace.</p>
          {error && <div className="message error" role="alert">{error}</div>}
          <form className="auth-form" onSubmit={submitAuth}>
            <label htmlFor="auth-email">Email</label>
            <input id="auth-email" name="email" type="email" value={authForm.email} onChange={updateAuthForm} placeholder="you@example.com" autoComplete="email" required />
            <label htmlFor="auth-password">Password</label>
            <input id="auth-password" name="password" type="password" value={authForm.password} onChange={updateAuthForm} placeholder="At least 6 characters" minLength="6" autoComplete={authMode === 'login' ? 'current-password' : 'new-password'} required />
            <button className="primary-button" type="submit" disabled={authLoading}>{authLoading ? 'Please wait...' : authMode === 'login' ? 'Login' : 'Register'} <span aria-hidden="true">→</span></button>
          </form>
          <button className="switch-auth" type="button" onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setError('') }}>
            {authMode === 'login' ? 'Need an account? Register' : 'Already registered? Login'}
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-mark">TM</div>
        <div>
          <p className="eyebrow">Practical 7 / 24CS081</p>
          <p className="student-name">{user.email}</p>
        </div>
        <div className="topbar-actions"><span className="api-status">Mongo-backed workspace</span><button className="logout-button" type="button" onClick={logout}>Logout</button></div>
      </header>

      <section className="intro">
        <p className="eyebrow">A clear place to begin</p>
        <h1>Make room for what matters.</h1>
        <p className="intro-copy">Capture the next thing, give it shape, and move it across the finish line.</p>
      </section>

      <section className="workspace">
        <form className="task-form" onSubmit={addTask}>
          <div className="section-label"><span>01</span><h2>New task</h2></div>
          <label htmlFor="title">Task title</label>
          <input id="title" name="title" value={form.title} onChange={updateForm} placeholder="What needs your attention?" maxLength="120" />
          <label htmlFor="description">Description <span>(optional)</span></label>
          <textarea id="description" name="description" value={form.description} onChange={updateForm} placeholder="Add a little context..." rows="4" maxLength="500" />
          <button className="primary-button" type="submit" disabled={submitting}>
            {submitting ? 'Adding...' : 'Add Task'} <span aria-hidden="true">+</span>
          </button>
        </form>

        <section className="task-panel" aria-live="polite">
          <div className="section-heading">
            <div className="section-label"><span>02</span><h2>Your tasks</h2></div>
            <span className="task-count">{tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}</span>
          </div>
          {notice && <div className="message success" role="status">{notice}</div>}
          {error && <div className="message error" role="alert">{error}</div>}
          {loading ? (
            <div className="state-card"><span className="loader" />Loading your tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="state-card empty-state"><strong>A clean slate.</strong><span>Your next task belongs here.</span></div>
          ) : (
            <div className="task-list">
              {tasks.map((task) => (
                <article className={`task-card ${task.completed ? 'is-complete' : ''}`} key={task._id}>
                  {editingId === task._id ? (
                    <form className="edit-form" onSubmit={(event) => updateTask(event, task)}>
                      <input name="title" value={editForm.title} onChange={updateEditForm} maxLength="120" aria-label="Edit task title" autoFocus />
                      <textarea name="description" value={editForm.description} onChange={updateEditForm} maxLength="500" rows="3" aria-label="Edit task description" />
                      <div className="task-actions">
                        <button type="submit" className="text-button" disabled={workingId === task._id}>{workingId === task._id ? 'Saving...' : 'Save'}</button>
                        <button type="button" className="muted-button" onClick={() => setEditingId('')} disabled={workingId === task._id}>Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="task-card-copy">
                        <span className="task-dot" aria-hidden="true" />
                        <div><h3>{task.title}</h3>{task.description && <p>{task.description}</p>}</div>
                      </div>
                      <div className="task-actions">
                        <button type="button" className="text-button" onClick={() => startEditing(task)} disabled={workingId === task._id}>Edit</button>
                        <button type="button" className="text-button" onClick={() => toggleTask(task)} disabled={workingId === task._id}>{workingId === task._id ? 'Working...' : task.completed ? 'Undo' : 'Complete'}</button>
                        <button type="button" className="delete-button" onClick={() => deleteTask(task)} disabled={workingId === task._id} aria-label={`Delete ${task.title}`}>Delete</button>
                      </div>
                    </>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
      <footer>React + Node.js + MongoDB <span>///</span> Task Manager</footer>
    </main>
  )
}

export default App
