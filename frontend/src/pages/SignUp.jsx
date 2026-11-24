import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

export default function SignUp() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    setLoading(true);
    try {
      await signup(username, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la création du compte");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="card form login" onSubmit={submit}>
      <h2>Créer un compte utilisateur</h2>
      {error && <div className="alert">{error}</div>}
      <label>Username
        <input value={username} onChange={(e) => setUsername(e.target.value)} minLength="3" maxLength="30" required autoFocus />
      </label>
      <label>Mot de passe (6 caractères minimum)
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength="6" required />
      </label>
      <label>Confirmer le mot de passe
        <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} minLength="6" required />
      </label>
      <button className="btn btn-primary" disabled={loading}>
        {loading ? 'Création...' : 'Créer mon compte'}
      </button>
      <p className="hint">Déjà inscrit ? <Link to="/login">Se connecter</Link></p>
    </form>
  );
}
