import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { SettingsStore, UserSettings } from '../types/store';
import { createPersistentStorage, serializeState, deserializeState } from './utils/persistence';

// Paramètres par défaut
const defaultSettings: UserSettings = {
  username: 'Utilisateur',
  avatar: null,
  language: 'fr',
  mathNotation: 'latex',
  autoSave: true,
  soundEnabled: true,
  apiEndpoint: 'https://back-rh.onrender.com',
  maxTokens: 2048,
  temperature: 0.7
};

// État initial du store
const initialState = {
  settings: defaultSettings,
  isFirstVisit: true,
  lastActiveDate: null as Date | null,
  sessionStartTime: new Date()
};

// Création du store avec persistance et Immer
export const useSettingsStore = create<SettingsStore>()(
  persist(
    immer((set, get) => ({
      ...initialState,

      // === Gestion des paramètres ===
      updateSettings: (newSettings: Partial<UserSettings>) => {
        set((state) => {
          Object.assign(state.settings, newSettings);
        });
        
        // Déclencher des actions secondaires si nécessaire
        const { settings } = get();
        
        // Appliquer la langue si elle a changé
        if (newSettings.language && newSettings.language !== settings.language) {
          // Ici on pourrait déclencher un changement de langue
          console.log(`Langue changée vers: ${newSettings.language}`);
        }
      },

      resetSettings: () => {
        set((state) => {
          state.settings = { ...defaultSettings };
        });
      },

      // === Gestion de la première visite ===
      setFirstVisit: (isFirst: boolean) => {
        set((state) => {
          state.isFirstVisit = isFirst;
        });
      },

      // === Gestion de l'activité ===
      updateLastActiveDate: () => {
        set((state) => {
          state.lastActiveDate = new Date();
        });
      },

      // === Import/Export ===
      exportSettings: (): string => {
        const state = get();
        return JSON.stringify({
          exportedAt: new Date().toISOString(),
          version: '1.0.0',
          settings: serializeState(state.settings),
          lastActiveDate: state.lastActiveDate,
          isFirstVisit: state.isFirstVisit
        }, null, 2);
      },

      importSettings: (settingsData: string) => {
        try {
          const imported = JSON.parse(settingsData);
          
          if (!imported.settings) {
            throw new Error('Format de paramètres invalide');
          }

          const settings = deserializeState(imported.settings) as UserSettings;
          
          // Valider les paramètres
          const validatedSettings: UserSettings = {
            username: typeof settings.username === 'string' ? settings.username : defaultSettings.username,
            avatar: typeof settings.avatar === 'string' || settings.avatar === null ? settings.avatar : defaultSettings.avatar,
            language: ['fr', 'en'].includes(settings.language) ? settings.language : defaultSettings.language,
            mathNotation: ['latex', 'ascii'].includes(settings.mathNotation) ? settings.mathNotation : defaultSettings.mathNotation,
            autoSave: typeof settings.autoSave === 'boolean' ? settings.autoSave : defaultSettings.autoSave,
            soundEnabled: typeof settings.soundEnabled === 'boolean' ? settings.soundEnabled : defaultSettings.soundEnabled,
            apiEndpoint: typeof settings.apiEndpoint === 'string' ? settings.apiEndpoint : defaultSettings.apiEndpoint,
            maxTokens: typeof settings.maxTokens === 'number' && settings.maxTokens > 0 ? settings.maxTokens : defaultSettings.maxTokens,
            temperature: typeof settings.temperature === 'number' && settings.temperature >= 0 && settings.temperature <= 2 ? settings.temperature : defaultSettings.temperature
          };

          set((state) => {
            state.settings = validatedSettings;
            if (imported.lastActiveDate) {
              state.lastActiveDate = new Date(imported.lastActiveDate);
            }
            if (typeof imported.isFirstVisit === 'boolean') {
              state.isFirstVisit = imported.isFirstVisit;
            }
          });
        } catch (error) {
          console.error('Erreur lors de l\'import des paramètres:', error);
          throw new Error('Impossible d\'importer les paramètres');
        }
      }
    })),
    {
      name: 'settings-store',
      partialize: (state) => ({
        settings: state.settings,
        isFirstVisit: state.isFirstVisit,
        lastActiveDate: state.lastActiveDate
      }),
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Réinitialiser le temps de début de session
          state.sessionStartTime = new Date();
          
          // Mettre à jour la dernière date d'activité
          state.lastActiveDate = new Date();
        }
      }
    }
  )
);

// Hook pour les statistiques d'utilisation
export const useUserStats = () => {
  const { sessionStartTime, lastActiveDate, isFirstVisit } = useSettingsStore();
  
  const getSessionDuration = (): number => {
    return Date.now() - sessionStartTime.getTime();
  };
  
  const getDaysSinceLastVisit = (): number | null => {
    if (!lastActiveDate) return null;
    return Math.floor((Date.now() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24));
  };
  
  return {
    sessionStartTime,
    lastActiveDate,
    isFirstVisit,
    getSessionDuration,
    getDaysSinceLastVisit
  };
};

// Hook pour les paramètres API
export const useApiSettings = () => {
  const { apiEndpoint, maxTokens, temperature } = useSettingsStore(state => state.settings);
  const updateSettings = useSettingsStore(state => state.updateSettings);
  
  const updateApiSettings = (apiSettings: Partial<Pick<UserSettings, 'apiEndpoint' | 'maxTokens' | 'temperature'>>) => {
    updateSettings(apiSettings);
  };
  
  return {
    apiEndpoint,
    maxTokens,
    temperature,
    updateApiSettings
  };
};

// Hook pour les préférences utilisateur
export const useUserPreferences = () => {
  const { username, avatar, language, mathNotation, autoSave, soundEnabled } = useSettingsStore(state => state.settings);
  const updateSettings = useSettingsStore(state => state.updateSettings);
  
  const updateUserPreferences = (preferences: Partial<Pick<UserSettings, 'username' | 'avatar' | 'language' | 'mathNotation' | 'autoSave' | 'soundEnabled'>>) => {
    updateSettings(preferences);
  };
  
  return {
    username,
    avatar,
    language,
    mathNotation,
    autoSave,
    soundEnabled,
    updateUserPreferences
  };
};

// Hook pour l'onboarding
export const useOnboarding = () => {
  const { isFirstVisit, setFirstVisit } = useSettingsStore();
  
  const completeOnboarding = () => {
    setFirstVisit(false);
  };
  
  return {
    isFirstVisit,
    completeOnboarding
  };
};

// Hooks personnalisés pour un accès simplifié
export const useSettings = () => {
  const { settings, updateSettings, resetSettings } = useSettingsStore();
  return { settings, updateSettings, resetSettings };
};

export const useSettingsActions = () => {
  const {
    updateSettings,
    resetSettings,
    updateLastActiveDate,
    exportSettings,
    importSettings
  } = useSettingsStore();

  return {
    updateSettings,
    resetSettings,
    updateLastActiveDate,
    exportSettings,
    importSettings
  };
};
