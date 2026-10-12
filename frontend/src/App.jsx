import { Component, lazy, Suspense, useEffect, useState } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const AuthView = lazy(() => import('./AuthView.jsx'))
const TaskDashboard = lazy(() => import('./TaskDashboard.jsx'))
const AUTH_ROUTES = ['/login', '/register']

function getRoute() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/login'
  return [...AUTH_ROUTES, '/dashboard'].includes(path) ? path : '/login'
}

class LazyLoadErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="loading-shell">
          <section className="loading-card">
            <strong>We could not load this part of the app.</strong>
            <span>Refresh the page and try again.</span>
          </section>
        </main>
      )
    }
    return this.props.children
  }
}

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

function LoadingFallback() {
  return (
    <main className="loading-shell">
      <section className="loading-card" role="status" aria-live="polite">
        <span className="loader" />
        <strong>Loading your workspace...</strong>
        <span>Preparing the next view.</span>
      </section>
    </main>
  )
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('task_manager_token') || '')
  const [route, setRoute] = useState(getRoute)
  const [user, setUser] = useState(null)
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
    function handlePopState() {
      setRoute(getRoute())
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  function navigate(nextRoute, replace = false) {
    if (window.location.pathname !== nextRoute) {
      window.history[replace ? 'replaceState' : 'pushState']({}, '', nextRoute)
    }
    setRoute(nextRoute)
  }

  useEffect(() => {
    if (!token) {
      setLoading(false)
      setUser(null)
      setTasks([])
      if (route === '/dashboard') navigate('/login', true)
      return
    }
    restoreSession()
  }, [token, route])

  useEffect(() => {
    if (token && user && AUTH_ROUTES.includes(route)) navigate('/dashboard', true)
  }, [token, user, route])

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
    navigate('/login', true)
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
      const authMode = route === '/register' ? 'register' : 'login'
      const result = await request(`/${authMode}`, { method: 'POST', body: JSON.stringify(authForm) })
      localStorage.setItem('task_manager_token', result.token)
      setUser(result.user)
      setAuthForm({ email: '', password: '' })
      setToken(result.token)
      navigate('/dashboard', true)
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
      const newTask = await request('/tasks', { method: 'POST', body: JSON.stringify(form) }, token)
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
      const updatedTask = await request(`/tasks/${task._id}`, { method: 'PUT', body: JSON.stringify({ completed: !task.completed }) }, token)
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
      const updatedTask = await request(`/tasks/${task._id}`, { method: 'PUT', body: JSON.stringify(editForm) }, token)
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

  const view = route !== '/dashboard'
    ? <AuthView
        authForm={authForm}
        authLoading={authLoading}
        authMode={route === '/register' ? 'register' : 'login'}
        error={error}
        onAuthFormChange={updateAuthForm}
        onAuthSubmit={submitAuth}
        onAuthModeChange={() => {
          setError('')
          navigate(route === '/login' ? '/register' : '/login')
        }}
      />
    : token && user
      ? <TaskDashboard
        editForm={editForm}
        editingId={editingId}
        error={error}
        form={form}
        loading={loading}
        notice={notice}
        submitting={submitting}
        tasks={tasks}
        user={user}
        workingId={workingId}
        onAddTask={addTask}
        onDeleteTask={deleteTask}
        onEditFormChange={updateEditForm}
        onLogout={logout}
        onStartEditing={startEditing}
        onSubmitEdit={updateTask}
        onToggleTask={toggleTask}
        onUpdateForm={updateForm}
        onCancelEdit={() => setEditingId('')}
      />
      : <LoadingFallback />

  return (
    <LazyLoadErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>{view}</Suspense>
    </LazyLoadErrorBoundary>
  )
}

export default App
