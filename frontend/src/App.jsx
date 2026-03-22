import AppRouter from './router/AppRouter';
import { AuthProvider } from './context/AuthContext';
import { ThemeModeProvider } from './context/ThemeContext';
import PWAInstallPrompt from './components/PWAInstallPrompt';

function App() {
  return (
    <ThemeModeProvider>
      <AuthProvider>
        <AppRouter />
        <PWAInstallPrompt />
      </AuthProvider>
    </ThemeModeProvider>
  );
}

export default App;
