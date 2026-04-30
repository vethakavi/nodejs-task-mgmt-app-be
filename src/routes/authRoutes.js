// routes/authRoutes.js
const router = require('express').Router();
const auth = require('../middleware/auth');
const { register, login, getUser, updateUser } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.get('/user', auth, getUser);
router.put('/user/:id', auth, updateUser);

module.exports = router;