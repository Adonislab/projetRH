// Export des stores principaux
export { useChatStore, useCurrentConversation, useCurrentMessages, useChatActions } from './chatStore';
export { useThemeStore, useResponsiveDetection, useSystemThemeDetection, useTheme, useSidebar, useThemeActions } from './themeStore';
export { useSettingsStore, useUserStats, useApiSettings, useUserPreferences, useOnboarding, useSettings, useSettingsActions } from './settingsStore';

// Export des types
export type { 
  Message, 
  Conversation, 
  ChatStore, 
  ThemeStore, 
  SettingsStore, 
  UserSettings,
  ApiResponse,
  ApiError
} from '../types/store';

// Export des utilitaires de persistance
export { createPersistentStorage, serializeState, deserializeState, cleanupOldData, exportAllData, importAllData } from './utils/persistence';

// Hook combiné pour initialiser tous les stores
import { useEffect } from 'react';
import { useChatStore, useChatActions } from './chatStore';
import { useThemeStore, useResponsiveDetection, useSystemThemeDetection, useThemeActions } from './themeStore';
import { useSettingsStore, useSettingsActions } from './settingsStore';

/**
 * Hook principal pour initialiser et configurer tous les stores au démarrage de l'application
 * À utiliser dans le composant racine ou layout principal
 */
export const useStoreInitialization = () => {
  const checkIsMobile = useResponsiveDetection();
  const { syncWithSystemTheme, listenToSystemTheme } = useSystemThemeDetection();
  const updateLastActiveDate = useSettingsStore(state => state.updateLastActiveDate);
  
  useEffect(() => {
    // Vérifier si nous sommes côté client
    if (typeof window === 'undefined') return;
    
    // Initialisation du responsive
    checkIsMobile();
    const handleResize = () => {
      checkIsMobile();
    };
    
    window.addEventListener('resize', handleResize);
    
    // Initialisation du thème système
    syncWithSystemTheme();
    const cleanupSystemTheme = listenToSystemTheme();
    
    // Mise à jour de la dernière activité
    updateLastActiveDate();
    
    // Nettoyage des anciennes données (plus de 30 jours)
    import('./utils/persistence').then(({ cleanupOldData }) => {
      cleanupOldData('chat-');
      cleanupOldData('theme-');
      cleanupOldData('settings-');
    });
    
    return () => {
      window.removeEventListener('resize', handleResize);
      cleanupSystemTheme();
    };
  }, [checkIsMobile, syncWithSystemTheme, listenToSystemTheme, updateLastActiveDate]);
};

/**
 * Hook pour obtenir l'état global de l'application
 */
export const useAppState = () => {
  const chatStore = useChatStore();
  const themeStore = useThemeStore();
  const settingsStore = useSettingsStore();
  
  return {
    chat: chatStore,
    theme: themeStore,
    settings: settingsStore
  };
};

/**
 * Hook pour les actions globales de l'application
 */
export const useAppActions = () => {
  const chatActions = useChatActions();
  const themeActions = useThemeActions();
  const settingsActions = useSettingsActions();
  
  return {
    chat: chatActions,
    theme: themeActions,
    settings: settingsActions
  };
};

/**
 * Hook pour exporter toutes les données de l'application
 */
export const useDataExport = () => {
  const exportConversation = useChatStore(state => state.exportConversation);
  const exportSettings = useSettingsStore(state => state.exportSettings);
  
  const exportAllAppData = async () => {
    try {
      const { exportAllData } = await import('./utils/persistence');
      return exportAllData();
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      throw new Error('Impossible d\'exporter les données');
    }
  };
  
  const exportSingleConversation = (conversationId: string) => {
    return exportConversation(conversationId);
  };
  
  const exportUserSettings = () => {
    return exportSettings();
  };
  
  return {
    exportAllAppData,
    exportSingleConversation,
    exportUserSettings
  };
};

/**
 * Hook pour importer des données dans l'application
 */
export const useDataImport = () => {
  const importConversation = useChatStore(state => state.importConversation);
  const importSettings = useSettingsStore(state => state.importSettings);
  
  const importAllAppData = async (jsonData: string) => {
    try {
      const { importAllData } = await import('./utils/persistence');
      return importAllData(jsonData);
    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      throw new Error('Impossible d\'importer les données');
    }
  };
  
  const importSingleConversation = (conversationData: string) => {
    return importConversation(conversationData);
  };
  
  const importUserSettings = (settingsData: string) => {
    return importSettings(settingsData);
  };
  
  return {
    importAllAppData,
    importSingleConversation,
    importUserSettings
  };
};

/**
 * Hook pour réinitialiser complètement l'application
 */
export const useAppReset = () => {
  const clearAllConversations = useChatStore(state => state.clearAllConversations);
  const resetTheme = useThemeStore(state => state.resetTheme);
  const resetSettings = useSettingsStore(state => state.resetSettings);
  
  const resetAllData = () => {
    clearAllConversations();
    resetTheme();
    resetSettings();
    
    // Nettoyer le localStorage
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('chat-') || key.startsWith('theme-') || key.startsWith('settings-'))) {
        keys.push(key);
      }
    }
    keys.forEach(key => localStorage.removeItem(key));
  };
  
  return { resetAllData };
};
