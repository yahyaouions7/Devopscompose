const mongoose = require('mongoose');

const carSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, trim: true, default: '' },
    price: { type: Number, required: true, min: 0 },
    year: { type: Number },
    description: { type: String, default: '' },
    images: { type: [String], default: [] }, // noms des fichiers dans /uploads
  },
  { timestamps: true }
);

module.exports = mongoose.model('Car', carSchema);
