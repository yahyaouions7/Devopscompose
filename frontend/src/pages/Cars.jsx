import { useEffect, useState } from 'react';
import api from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import CarCard from '../components/CarCard.jsx';

export default function Cars() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [cars, setCars] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async (q = '') => {
    setLoading(true);
    try {
      const { data } = await api.get('/cars', { params: { search: q } });
      setCars(data);
      setError('');
    } catch (e) {
      setError('Impossible de charger les voitures (backend lancé ?)');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => load(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const remove = async (id) => {
    if (!window.confirm('Supprimer cette voiture ?')) return;
    try {
      await api.delete(`/cars/${id}`);
      setCars((prev) => prev.filter((c) => c._id !== id));
    } catch (e) {
      alert(e.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  return (
    <>
      <div className="toolbar">
        <h1>Liste des voitures</h1>
        <input
          className="search"
          placeholder="Rechercher (nom, marque)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <div className="alert">{error}</div>}
      {loading && <p>Chargement...</p>}
      {!loading && !error && cars.length === 0 && <p>Aucune voiture.</p>}

      <div className="grid">
        {cars.map((car) => (
          <CarCard key={car._id} car={car} isAdmin={isAdmin} onDelete={remove} />
        ))}
      </div>
    </>
  );
}
