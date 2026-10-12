import { lazy, Suspense } from 'react'

const TaskList = lazy(() => import('./TaskList.jsx'))

function TaskDashboard({
  editForm,
  editingId,
  error,
  form,
  loading,
  notice,
  submitting,
  tasks,
  user,
  workingId,
  onAddTask,
  onDeleteTask,
  onEditFormChange,
  onLogout,
  onStartEditing,
  onSubmitEdit,
  onToggleTask,
  onUpdateForm,
  onCancelEdit,
}) {
  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-mark">TM</div>
        <div>
          <p className="eyebrow">Practical 7 / 24CS081</p>
          <p className="student-name">{user.email}</p>
        </div>
        <div className="topbar-actions"><span className="api-status">Mongo-backed workspace</span><button className="logout-button" type="button" onClick={onLogout}>Logout</button></div>
      </header>
      <section className="intro">
        <p className="eyebrow">A clear place to begin</p>
        <h1>Make room for what matters.</h1>
        <p className="intro-copy">Capture the next thing, give it shape, and move it across the finish line.</p>
      </section>
      <section className="workspace">
        <form className="task-form" onSubmit={onAddTask}>
          <div className="section-label"><span>01</span><h2>New task</h2></div>
          <label htmlFor="title">Task title</label>
          <input id="title" name="title" value={form.title} onChange={onUpdateForm} placeholder="What needs your attention?" maxLength="120" />
          <label htmlFor="description">Description <span>(optional)</span></label>
          <textarea id="description" name="description" value={form.description} onChange={onUpdateForm} placeholder="Add a little context..." rows="4" maxLength="500" />
          <button className="primary-button" type="submit" disabled={submitting}>{submitting ? 'Adding...' : 'Add Task'} <span aria-hidden="true">+</span></button>
        </form>
        <section className="task-panel" aria-live="polite">
          <div className="section-heading">
            <div className="section-label"><span>02</span><h2>Your tasks</h2></div>
            <span className="task-count">{tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}</span>
          </div>
          {notice && <div className="message success" role="status">{notice}</div>}
          {error && <div className="message error" role="alert">{error}</div>}
          <Suspense fallback={<div className="state-card"><span className="loader" />Loading your task list...</div>}>
            <TaskList
              editingId={editingId}
              editForm={editForm}
              loading={loading}
              tasks={tasks}
              workingId={workingId}
              onDelete={onDeleteTask}
              onEditFormChange={onEditFormChange}
              onStartEditing={onStartEditing}
              onSubmitEdit={onSubmitEdit}
              onToggle={onToggleTask}
              onCancelEdit={onCancelEdit}
            />
          </Suspense>
        </section>
      </section>
      <footer>React + Node.js + MongoDB <span>///</span> Task Manager</footer>
    </main>
  )
}

export default TaskDashboard
