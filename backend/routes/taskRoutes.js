const express = require('express');
const authenticate = require('../middleware/authMiddleware');
const { validateBody } = require('../middleware/validateMiddleware');
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');

const router = express.Router();

router.use(authenticate);
router.route('/').get(getTasks).post(validateBody(['title']), createTask);
router.route('/:id').put(updateTask).delete(deleteTask);

module.exports = router;
