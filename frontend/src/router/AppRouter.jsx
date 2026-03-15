import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Login from '../pages/Login';
import MainLayout from '../layout/MainLayout';
import Dashboard from '../pages/Dashboard';
import Usuarios from '../pages/Usuarios';
import Proveedores from '../pages/Proveedores';
import TiposPrenda from '../pages/TiposPrenda';
import TiposCorte from '../pages/TiposCorte';
import PreciosMaquila from '../pages/PreciosMaquila';
import Cortes from '../pages/Cortes';
import Produccion from '../pages/Produccion';
import PiezasFaltantes from '../pages/PiezasFaltantes';
import Reportes from '../pages/Reportes';

function PrivateRoute({ children }) {
  const { isAuth } = useAuth();
  return isAuth ? children : <Navigate to="/login" replace />;
}

/** Protege una ruta individual según los módulos asignados al usuario */
function ModuleRoute({ path, children }) {
  const { tieneAcceso } = useAuth();
  return tieneAcceso(path) ? children : <Navigate to="/" replace />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="usuarios" element={<ModuleRoute path="/usuarios"><Usuarios /></ModuleRoute>} />
          <Route path="proveedores" element={<ModuleRoute path="/proveedores"><Proveedores /></ModuleRoute>} />
          <Route path="tipos-prenda" element={<ModuleRoute path="/tipos-prenda"><TiposPrenda /></ModuleRoute>} />
          <Route path="tipos-corte" element={<ModuleRoute path="/tipos-corte"><TiposCorte /></ModuleRoute>} />
          <Route path="precios-maquila" element={<ModuleRoute path="/precios-maquila"><PreciosMaquila /></ModuleRoute>} />
          <Route path="cortes" element={<ModuleRoute path="/cortes"><Cortes /></ModuleRoute>} />
          <Route path="produccion" element={<ModuleRoute path="/produccion"><Produccion /></ModuleRoute>} />
          <Route path="piezas-faltantes" element={<ModuleRoute path="/piezas-faltantes"><PiezasFaltantes /></ModuleRoute>} />
          <Route path="reportes" element={<ModuleRoute path="/reportes"><Reportes /></ModuleRoute>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
