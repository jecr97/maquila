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
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="proveedores" element={<Proveedores />} />
          <Route path="tipos-prenda" element={<TiposPrenda />} />
          <Route path="tipos-corte" element={<TiposCorte />} />
          <Route path="precios-maquila" element={<PreciosMaquila />} />
          <Route path="cortes" element={<Cortes />} />
          <Route path="produccion" element={<Produccion />} />
          <Route path="piezas-faltantes" element={<PiezasFaltantes />} />
          <Route path="reportes" element={<Reportes />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
