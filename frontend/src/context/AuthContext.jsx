import { createContext, useContext, useState, useCallback } from 'react';

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

  /** Verifica si el usuario tiene acceso a una ruta dada */
  const tieneAcceso = useCallback((ruta) => {
    if (!user) return false;
    // Admin siempre tiene acceso total
    if (user.rol === 'Admin') return true;
    // Si no hay módulos cargados, denegar
    if (!user.modulos || user.modulos.length === 0) return false;
    // Dashboard siempre accesible
    if (ruta === '/') return true;
    return user.modulos.some((m) => m.Ruta === ruta);
  }, [user]);

  return (
    <AuthContext.Provider value={{ isAuth, user, login, logout, tieneAcceso }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
