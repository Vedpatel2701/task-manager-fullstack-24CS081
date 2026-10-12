function TaskList({
  editingId,
  editForm,
  loading,
  tasks,
  workingId,
  onDelete,
  onEditFormChange,
  onStartEditing,
  onSubmitEdit,
  onToggle,
  onCancelEdit,
}) {
  if (loading) {
    return <div className="state-card"><span className="loader" />Loading your tasks...</div>
  }

  if (tasks.length === 0) {
    return <div className="state-card empty-state"><strong>A clean slate.</strong><span>Your next task belongs here.</span></div>
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <article className={`task-card ${task.completed ? 'is-complete' : ''}`} key={task._id}>
          {editingId === task._id ? (
            <form className="edit-form" onSubmit={(event) => onSubmitEdit(event, task)}>
              <input name="title" value={editForm.title} onChange={onEditFormChange} maxLength="120" aria-label="Edit task title" autoFocus />
              <textarea name="description" value={editForm.description} onChange={onEditFormChange} maxLength="500" rows="3" aria-label="Edit task description" />
              <div className="task-actions">
                <button type="submit" className="text-button" disabled={workingId === task._id}>{workingId === task._id ? 'Saving...' : 'Save'}</button>
                <button type="button" className="muted-button" onClick={onCancelEdit} disabled={workingId === task._id}>Cancel</button>
              </div>
            </form>
          ) : (
            <>
              <div className="task-card-copy">
                <span className="task-dot" aria-hidden="true" />
                <div><h3>{task.title}</h3>{task.description && <p>{task.description}</p>}</div>
              </div>
              <div className="task-actions">
                <button type="button" className="text-button" onClick={() => onStartEditing(task)} disabled={workingId === task._id}>Edit</button>
                <button type="button" className="text-button" onClick={() => onToggle(task)} disabled={workingId === task._id}>{workingId === task._id ? 'Working...' : task.completed ? 'Undo' : 'Complete'}</button>
                <button type="button" className="delete-button" onClick={() => onDelete(task)} disabled={workingId === task._id} aria-label={`Delete ${task.title}`}>Delete</button>
              </div>
            </>
          )}
        </article>
      ))}
    </div>
  )
}

export default TaskList
