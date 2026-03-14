import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuth, setIsAuth] = useState(
    () => localStorage.getItem('maquila_auth') === 'true'
  );
  const [user, setUser] = useState(
    () => JSON.parse(localStorage.getItem('maquila_user') || 'null')
  );

  const login = (userData) => {
    localStorage.setItem('maquila_auth', 'true');
    localStorage.setItem('maquila_user', JSON.stringify(userData));
    setIsAuth(true);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('maquila_auth');
    localStorage.removeItem('maquila_user');
    setIsAuth(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuth, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
