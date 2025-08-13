'use client';

import { useEffect, useState } from 'react';
import { useHydration } from '../hooks/useHydration';

interface StoreProviderProps {
  children: React.ReactNode;
}

/**
 * Composant qui initialise tous les stores Zustand au démarrage de l'application
 * À utiliser une fois dans le composant racine
 * Gère aussi l'hydratation pour éviter les erreurs SSR/Client
 */
export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  const isHydrated = useHydration();
  const [storesInitialized, setStoresInitialized] = useState(false);
  
  useEffect(() => {
    if (isHydrated && !storesInitialized) {
      // Hydratation manuelle des stores côté client seulement
      import('../stores').then(({ useChatStore, useThemeStore, useSettingsStore, useStoreInitialization }) => {
        // Réhydrater les stores
        useChatStore.persist.rehydrate();
        useThemeStore.persist.rehydrate();
        useSettingsStore.persist.rehydrate();
        
        // Marquer comme initialisé
        setStoresInitialized(true);
      });
    }
  }, [isHydrated, storesInitialized]);

  // Afficher un loader pendant l'hydratation
  if (!isHydrated || !storesInitialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return <ClientStoreInitializer>{children}</ClientStoreInitializer>;
};

/**
 * Composant interne qui initialise les stores seulement côté client
 */
const ClientStoreInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Initialisation manuelle des stores côté client
    let cleanupResize: (() => void) | undefined;
    
    import('../stores').then(({ useThemeStore, useSettingsStore }) => {
      // Détection responsive
      const handleResize = () => {
        if (typeof window !== 'undefined') {
          const isMobile = window.innerWidth < 768;
          useThemeStore.getState().setIsMobile(isMobile);
        }
      };
      
      // Initialisation
      handleResize();
      window.addEventListener('resize', handleResize);
      
      // Mise à jour de la dernière activité
      useSettingsStore.getState().updateLastActiveDate();
      
      // Configuration du nettoyage
      cleanupResize = () => {
        window.removeEventListener('resize', handleResize);
      };
      
      // Nettoyage des anciennes données
      import('../stores/utils/persistence').then(({ cleanupOldData }) => {
        cleanupOldData('chat-');
        cleanupOldData('theme-');
        cleanupOldData('settings-');
      });
    });
    
    return () => {
      if (cleanupResize) {
        cleanupResize();
      }
    };
  }, []);
  
  return <>{children}</>;
};

export default StoreProvider;
