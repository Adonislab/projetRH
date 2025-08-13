import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { ThemeStore } from '../types/store';
import { createPersistentStorage } from './utils/persistence';

// État initial du thème
const initialState = {
  darkMode: false,
  sidebarOpen: true,
  isMobile: false,
  fontSize: 'medium' as const,
  chatLayout: 'comfortable' as const
};

// Création du store avec persistance et Immer
export const useThemeStore = create<ThemeStore>()(
  persist(
    immer((set, get) => ({
      ...initialState,

      // === Gestion du mode sombre ===
      toggleDarkMode: () => {
        set((state) => {
          state.darkMode = !state.darkMode;
        });
        
        // Appliquer le thème immédiatement au DOM (côté client seulement)
        if (typeof window !== 'undefined') {
          const { darkMode } = get();
          document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
        }
      },

      setDarkMode: (darkMode: boolean) => {
        set((state) => {
          state.darkMode = darkMode;
        });
        
        // Appliquer le thème immédiatement au DOM (côté client seulement)
        if (typeof window !== 'undefined') {
          document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
        }
      },

      // === Gestion de la sidebar ===
      toggleSidebar: () => {
        set((state) => {
          state.sidebarOpen = !state.sidebarOpen;
        });
      },

      setSidebarOpen: (open: boolean) => {
        set((state) => {
          state.sidebarOpen = open;
        });
      },

      // === Gestion du responsive ===
      setIsMobile: (isMobile: boolean) => {
        set((state) => {
          state.isMobile = isMobile;
          // Fermer automatiquement la sidebar sur mobile
          if (isMobile) {
            state.sidebarOpen = false;
          }
        });
      },

      // === Préférences d'affichage ===
      setFontSize: (fontSize) => {
        set((state) => {
          state.fontSize = fontSize;
        });
        
        // Appliquer la taille de police au body (côté client seulement)
        if (typeof window !== 'undefined') {
          const fontSizeMap = {
            small: '14px',
            medium: '16px',
            large: '18px'
          };
          document.body.style.fontSize = fontSizeMap[fontSize];
        }
      },

      setChatLayout: (layout) => {
        set((state) => {
          state.chatLayout = layout;
        });
      },

      // === Réinitialisation ===
      resetTheme: () => {
        set((state) => {
          Object.assign(state, initialState);
        });
        
        // Réinitialiser le DOM (côté client seulement)
        if (typeof window !== 'undefined') {
          document.documentElement.setAttribute('data-theme', 'light');
          document.body.style.fontSize = '16px';
        }
      }
    })),
    {
      name: 'theme-store',
      partialize: (state) => ({
        darkMode: state.darkMode,
        fontSize: state.fontSize,
        chatLayout: state.chatLayout
      }),
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        if (state && typeof window !== 'undefined') {
          // Appliquer les paramètres du thème après la réhydratation
          document.documentElement.setAttribute('data-theme', state.darkMode ? 'dark' : 'light');
          
          const fontSizeMap = {
            small: '14px',
            medium: '16px',
            large: '18px'
          };
          document.body.style.fontSize = fontSizeMap[state.fontSize];
          
          // Réinitialiser les états non persistés
          state.sidebarOpen = true;
          state.isMobile = false;
        }
      }
    }
  )
);

// Hook pour détecter automatiquement les changements de taille d'écran
export const useResponsiveDetection = () => {
  const setIsMobile = useThemeStore(state => state.setIsMobile);
  
  const checkIsMobile = () => {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 768;
      setIsMobile(isMobile);
    }
  };

  return checkIsMobile;
};

// Hook pour synchroniser les préférences système
export const useSystemThemeDetection = () => {
  const { darkMode, setDarkMode } = useThemeStore();
  
  const syncWithSystemTheme = () => {
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches && !darkMode) {
      setDarkMode(true);
    }
  };

  const listenToSystemTheme = () => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e: MediaQueryListEvent) => {
        setDarkMode(e.matches);
      };
      
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
    return () => {};
  };

  return { syncWithSystemTheme, listenToSystemTheme };
};

// Hooks personnalisés pour un accès simplifié
export const useTheme = () => {
  const { darkMode, fontSize, chatLayout } = useThemeStore();
  return { darkMode, fontSize, chatLayout };
};

export const useSidebar = () => {
  const { sidebarOpen, isMobile, toggleSidebar, setSidebarOpen } = useThemeStore();
  return { sidebarOpen, isMobile, toggleSidebar, setSidebarOpen };
};

export const useThemeActions = () => {
  const {
    toggleDarkMode,
    setDarkMode,
    setFontSize,
    setChatLayout,
    resetTheme
  } = useThemeStore();

  return {
    toggleDarkMode,
    setDarkMode,
    setFontSize,
    setChatLayout,
    resetTheme
  };
};
