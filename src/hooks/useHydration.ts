import { useEffect, useState } from 'react';

/**
 * Hook pour gérer l'état d'hydratation
 * Évite les erreurs d'hydratation en attendant que le composant soit monté côté client
 */
export const useHydration = (): boolean => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated;
};

export default useHydration;
