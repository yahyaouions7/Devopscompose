import { useState } from 'react';
import { Link } from 'react-router-dom';
import { imageUrl } from '../api.js';

export default function CarCard({ car, isAdmin, onDelete }) {
  const [current, setCurrent] = useState(0);
  const images = car.images || [];

  return (
    <div className="card car">
      <div className="gallery">
        {images.length > 0 ? (
          <>
            <img className="main-img" src={imageUrl(images[current])} alt={car.name} />
            {images.length > 1 && (
              <div className="thumbs">
                {images.map((img, i) => (
                  <img
                    key={img}
                    src={imageUrl(img)}
                    alt=""
                    className={i === current ? 'active' : ''}
                    onClick={() => setCurrent(i)}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="no-img">Pas d'image</div>
        )}
      </div>

      <div className="car-body">
        <h3>{car.name}</h3>
        <p className="muted">
          {car.brand} {car.year ? `• ${car.year}` : ''}
        </p>
        <p className="price">{Number(car.price).toLocaleString('fr-FR')} DT</p>
        {car.description && <p className="desc">{car.description}</p>}

        {isAdmin && (
          <div className="actions">
            <Link to={`/cars/${car._id}/edit`} className="btn">Modifier</Link>
            <button className="btn btn-danger" onClick={() => onDelete(car._id)}>
              Supprimer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
