import { useState, useEffect, useCallback } from 'react';
import { Snackbar, Button, Box, Typography } from '@mui/material';
import GetAppIcon from '@mui/icons-material/GetApp';

/**
 * PWAInstallPrompt
 * Muestra un banner en la parte inferior de la pantalla cuando el navegador
 * dispara el evento `beforeinstallprompt` (Chrome/Edge/Android).
 * En iOS el banner da instrucciones manuales.
 */
export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Detectar iOS (no soporta beforeinstallprompt)
    const ios =
      /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase()) &&
      !window.MSStream;
    setIsIOS(ios);

    // Detectar si ya está instalada como PWA (display standalone)
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    setIsInstalled(standalone);

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowBanner(false);
      setIsInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Mostrar instrucciones iOS si no está instalada y es Safari
    if (ios && !standalone) {
      const shown = sessionStorage.getItem('pwa-ios-banner-shown');
      if (!shown) setShowBanner(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
    setShowBanner(false);
  }, [deferredPrompt]);

  const handleClose = () => {
    setShowBanner(false);
    if (isIOS) sessionStorage.setItem('pwa-ios-banner-shown', '1');
  };

  // No mostrar nada si ya está instalada
  if (isInstalled) return null;

  const iosMessage = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      <Typography variant="body2" fontWeight={600}>
        Instalar Maquila en tu iPhone
      </Typography>
      <Typography variant="caption">
        Toca el botón <strong>Compartir</strong> ↑ y luego{' '}
        <strong>"Agregar a pantalla de inicio"</strong>.
      </Typography>
    </Box>
  );

  const androidMessage = (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <GetAppIcon fontSize="small" />
      <Typography variant="body2">
        Instalar <strong>Maquila</strong> en este dispositivo
      </Typography>
    </Box>
  );

  return (
    <Snackbar
      open={showBanner}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{ mb: { xs: 2, sm: 3 } }}
      message={isIOS ? iosMessage : androidMessage}
      action={
        isIOS ? (
          <Button color="inherit" size="small" onClick={handleClose}>
            Cerrar
          </Button>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button color="inherit" size="small" onClick={handleClose}>
              Ahora no
            </Button>
            <Button
              color="primary"
              variant="contained"
              size="small"
              onClick={handleInstall}
            >
              Instalar
            </Button>
          </Box>
        )
      }
    />
  );
}
