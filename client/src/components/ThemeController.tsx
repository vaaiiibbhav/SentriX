import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

function resolveTheme(mode: 'light' | 'dark' | 'system', prefersDark: boolean) {
  if (mode === 'system') {
    return prefersDark ? 'dark' : 'light';
  }

  return mode;
}

export default function ThemeController() {
  const themeMode = useAppStore((state) => state.themeMode);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      const resolvedTheme = resolveTheme(themeMode, mediaQuery.matches);
      const root = document.documentElement;
      root.dataset.theme = resolvedTheme;
      root.style.colorScheme = resolvedTheme;
    };

    applyTheme();

    if (themeMode !== 'system') {
      return;
    }

    mediaQuery.addEventListener('change', applyTheme);
    return () => mediaQuery.removeEventListener('change', applyTheme);
  }, [themeMode]);

  return null;
}