import { useEffect, useState } from 'react';
import api from '../api.js';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/users')
      .then(({ data }) => setUsers(data))
      .catch((err) => setError(err.response?.data?.message || 'Impossible de charger les utilisateurs'));
  }, []);

  return (
    <section className="card users-page">
      <h1>Comptes utilisateurs</h1>
      {error && <div className="alert">{error}</div>}
      {!error && users.length === 0 && <p>Aucun utilisateur inscrit pour le moment.</p>}
      {users.length > 0 && (
        <div className="users-list">
          {users.map((item) => (
            <div className="user-row" key={item._id}>
              <strong>{item.username}</strong>
              <span>Utilisateur</span>
              <small>Inscrit le {new Date(item.createdAt).toLocaleDateString('fr-FR')}</small>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
