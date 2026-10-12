const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const authenticate = require('../middleware/authMiddleware');
const { validateBody } = require('../middleware/validateMiddleware');

const router = express.Router();

router.post('/register', validateBody(['email', 'password']), register);
router.post('/login', validateBody(['email', 'password']), login);
router.get('/me', authenticate, getMe);

module.exports = router;
