const router = require('express').Router();
const auth = require('../middleware/auth');
const adminOnly = auth.adminOnly;
const User = require('../models/User');

// GET /api/users — réservé à l'admin
router.get('/', auth, adminOnly, async (req, res, next) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('username role createdAt')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
