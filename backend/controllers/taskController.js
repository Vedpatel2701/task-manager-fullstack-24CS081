const Task = require('../models/Task');

async function getTasks(req, res, next) {
  try {
    const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
}

async function createTask(req, res, next) {
  try {
    const task = await Task.create({
      user: req.user._id,
      title: req.body.title,
      description: req.body.description,
    });
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
}

async function updateTask(req, res, next) {
  try {
    const updates = {};
    if (typeof req.body.title !== 'undefined') updates.title = req.body.title;
    if (typeof req.body.description !== 'undefined') updates.description = req.body.description;
    if (typeof req.body.completed !== 'undefined') updates.completed = req.body.completed;

    const task = await Task.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, updates, {
      new: true,
      runValidators: true,
    });

    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid task id' });
    next(error);
  }
}

async function deleteTask(req, res, next) {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid task id' });
    next(error);
  }
}

module.exports = { getTasks, createTask, updateTask, deleteTask };
