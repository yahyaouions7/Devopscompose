require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const app = express();
app.use(cors());
app.use(express.json());

const uploadsDir = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/cars', require('./routes/cars'));
app.use('/api/users', require('./routes/users'));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Erreur serveur' });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connecté');
    // Un seul compte admin configuré. On conserve son mot de passe existant.
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    let admin = await User.findOne({ username: adminUsername });
    if (!admin) {
      const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
      admin = await User.create({ username: adminUsername, password: hash, role: 'admin' });
      console.log('Compte admin créé');
    } else if (admin.role !== 'admin') {
      admin.role = 'admin';
      await admin.save();
      console.log('Rôle admin restauré');
    }

    // Les anciens comptes sans rôle deviennent des utilisateurs simples.
    await User.updateMany(
      { _id: { $ne: admin._id }, role: { $exists: false } },
      { $set: { role: 'user' } }
    );
    await User.updateMany(
      { _id: { $ne: admin._id }, role: 'admin' },
      { $set: { role: 'user' } }
    );
    app.listen(PORT, () => console.log(`Serveur sur http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('Erreur MongoDB:', err.message);
    process.exit(1);
  });
