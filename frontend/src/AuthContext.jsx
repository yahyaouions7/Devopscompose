import { createContext, useContext, useState } from 'react';
import api from './api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const username = localStorage.getItem('username');
    if (!username) return null;
    return { username, role: localStorage.getItem('role') || 'user' };
  });

  const saveSession = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('username', data.username);
    localStorage.setItem('role', data.role || 'user');
    setUser({ username: data.username, role: data.role || 'user' });
  };

  const login = async (username, password) => {
    const { data } = await api.post('/auth/login', { username, password });
    saveSession(data);
  };

  const signup = async (username, password) => {
    const { data } = await api.post('/auth/signup', { username, password });
    saveSession(data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
