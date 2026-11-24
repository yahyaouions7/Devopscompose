const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function createToken(user) {
  return jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
}

// POST /api/auth/signup — toute inscription publique crée obligatoirement un user.
router.post('/signup', async (req, res, next) => {
  try {
    const username = String(req.body.username || '').trim();
    const password = String(req.body.password || '');

    if (username.length < 3 || username.length > 30) {
      return res.status(400).json({ message: 'Le nom doit contenir entre 3 et 30 caractères' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères' });
    }

    const exists = await User.findOne({ username });
    if (exists) return res.status(409).json({ message: 'Ce nom utilisateur existe déjà' });

    const hash = await bcrypt.hash(password, 10);
    // Ne jamais accepter req.body.role ici: aucun utilisateur ne peut s'inscrire admin.
    const user = await User.create({ username, password: hash, role: 'user' });
    const token = createToken(user);
    return res.status(201).json({
      token,
      username: user.username,
      role: user.role,
      message: 'Compte créé avec succès',
    });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Ce nom utilisateur existe déjà' });
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const username = String(req.body.username || '').trim();
    const { password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username et mot de passe requis' });
    }

    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: 'Identifiants incorrects' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Identifiants incorrects' });

    // Compatibilité avec l'ancien document admin créé avant l'ajout du champ role.
    if (!user.role) {
      user.role = user.username === (process.env.ADMIN_USERNAME || 'admin') ? 'admin' : 'user';
      await user.save();
    }

    res.json({ token: createToken(user), username: user.username, role: user.role });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
