import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="card form login" onSubmit={submit}>
      <h2>Connexion</h2>
      {error && <div className="alert">{error}</div>}
      <label>Username
        <input value={username} onChange={(e) => setUsername(e.target.value)} required autoFocus />
      </label>
      <label>Mot de passe
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </label>
      <button className="btn btn-primary" disabled={loading}>
        {loading ? '...' : 'Se connecter'}
      </button>
      <p className="hint">Pas encore de compte ? <Link to="/signup">Créer un compte</Link></p>
      <p className="hint">Admin par défaut : admin / admin123</p>
    </form>
  );
}
