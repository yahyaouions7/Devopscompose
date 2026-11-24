const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Car = require('../models/Car');
const auth = require('../middleware/auth');
const adminOnly = auth.adminOnly;

const uploadsDir = path.join(__dirname, '..', 'uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB par image
  fileFilter: (req, file, cb) => {
    if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) cb(null, true);
    else cb(new Error('Seulement les images (jpg, png, webp, gif)'));
  },
});

const deleteFile = (filename) => {
  // path.basename pour éviter toute sortie du dossier uploads
  const filePath = path.join(uploadsDir, path.basename(filename));
  fs.unlink(filePath, () => {});
};

// GET /api/cars?search=...  (public)
router.get('/', async (req, res, next) => {
  try {
    const { search } = req.query;
    const filter = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { brand: { $regex: search, $options: 'i' } },
          ],
        }
      : {};
    const cars = await Car.find(filter).sort({ createdAt: -1 });
    res.json(cars);
  } catch (err) {
    next(err);
  }
});

// GET /api/cars/:id  (public)
router.get('/:id', async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: 'Voiture introuvable' });
    res.json(car);
  } catch (err) {
    next(err);
  }
});

// POST /api/cars  (admin)  -> champs + images (multipart)
router.post('/', auth, adminOnly, upload.array('images', 10), async (req, res, next) => {
  try {
    const { name, brand, price, year, description } = req.body;
    if (!name || price === undefined || price === '') {
      (req.files || []).forEach((f) => deleteFile(f.filename));
      return res.status(400).json({ message: 'Nom et prix requis' });
    }
    const car = await Car.create({
      name,
      brand,
      price: Number(price),
      year: year ? Number(year) : undefined,
      description,
      images: (req.files || []).map((f) => f.filename),
    });
    res.status(201).json(car);
  } catch (err) {
    next(err);
  }
});

// PUT /api/cars/:id  (admin)  -> modifier nom/prix/... + ajouter/supprimer images
router.put('/:id', auth, adminOnly, upload.array('images', 10), async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      (req.files || []).forEach((f) => deleteFile(f.filename));
      return res.status(404).json({ message: 'Voiture introuvable' });
    }

    const { name, brand, price, year, description } = req.body;
    if (name !== undefined) car.name = name;
    if (brand !== undefined) car.brand = brand;
    if (price !== undefined && price !== '') car.price = Number(price);
    if (year !== undefined) car.year = year ? Number(year) : undefined;
    if (description !== undefined) car.description = description;

    // images à supprimer (JSON array de noms de fichiers)
    let toRemove = [];
    try {
      toRemove = JSON.parse(req.body.removeImages || '[]');
    } catch (e) {}
    toRemove = toRemove.filter((img) => car.images.includes(img));
    toRemove.forEach(deleteFile);
    car.images = car.images.filter((img) => !toRemove.includes(img));

    // nouvelles images
    (req.files || []).forEach((f) => car.images.push(f.filename));

    await car.save();
    res.json(car);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/cars/:id  (admin)
router.delete('/:id', auth, adminOnly, async (req, res, next) => {
  try {
    const car = await Car.findByIdAndDelete(req.params.id);
    if (!car) return res.status(404).json({ message: 'Voiture introuvable' });
    car.images.forEach(deleteFile);
    res.json({ message: 'Voiture supprimée' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
