import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import Login from './pages/Login.jsx';
import SignUp from './pages/SignUp.jsx';
import Cars from './pages/Cars.jsx';
import CarForm from './pages/CarForm.jsx';
import Users from './pages/Users.jsx';

function AdminRoute({ children }) {
  const { user } = useAuth();
  return user?.role === 'admin' ? children : <Navigate to="/" replace />;
}

export default function App() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <>
      <header className="navbar">
        <Link to="/" className="logo">🚗 Mes Voitures</Link>
        <nav>
          {user ? (
            <>
              {isAdmin && <Link to="/cars/new" className="btn btn-primary">+ Ajouter</Link>}
              {isAdmin && <Link to="/users" className="btn">Utilisateurs</Link>}
              <span className="user">👤 {user.username} ({isAdmin ? 'Admin' : 'User'})</span>
              <button className="btn" onClick={logout}>Déconnexion</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn">Connexion</Link>
              <Link to="/signup" className="btn btn-primary">Créer un compte</Link>
            </>
          )}
        </nav>
      </header>

      <main className="container">
        <Routes>
          <Route path="/" element={<Cars />} />
          <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/signup" element={user ? <Navigate to="/" replace /> : <SignUp />} />
          <Route path="/cars/new" element={<AdminRoute><CarForm /></AdminRoute>} />
          <Route path="/cars/:id/edit" element={<AdminRoute><CarForm /></AdminRoute>} />
          <Route path="/users" element={<AdminRoute><Users /></AdminRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
