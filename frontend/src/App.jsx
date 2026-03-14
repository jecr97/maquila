import AppRouter from './router/AppRouter';
import { AuthProvider } from './context/AuthContext';
import { ThemeModeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeModeProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ThemeModeProvider>
  );
}

export default App;
