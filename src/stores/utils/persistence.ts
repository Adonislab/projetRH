import { StateStorage } from 'zustand/middleware';

// Vérifier si nous sommes côté client
const isClient = typeof window !== 'undefined';

// Configuration de la persistance avec localStorage
export const createPersistentStorage = (name: string): StateStorage => ({
  getItem: (key: string): string | null => {
    if (!isClient) return null;
    
    try {
      const item = localStorage.getItem(`${name}-${key}`);
      return item;
    } catch (error) {
      console.warn(`Erreur lors de la lecture de ${name}-${key}:`, error);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    if (!isClient) return;
    
    try {
      localStorage.setItem(`${name}-${key}`, value);
    } catch (error) {
      console.warn(`Erreur lors de l'écriture de ${name}-${key}:`, error);
    }
  },
  removeItem: (key: string): void => {
    if (!isClient) return;
    
    try {
      localStorage.removeItem(`${name}-${key}`);
    } catch (error) {
      console.warn(`Erreur lors de la suppression de ${name}-${key}:`, error);
    }
  }
});

// Utilitaires pour la sérialisation/désérialisation des dates
export const serializeState = (state: any): any => {
  return JSON.parse(JSON.stringify(state, (key, value) => {
    if (value instanceof Date) {
      return { __type: 'Date', value: value.toISOString() };
    }
    return value;
  }));
};

export const deserializeState = (state: any): any => {
  return JSON.parse(JSON.stringify(state), (key, value) => {
    if (value && typeof value === 'object' && value.__type === 'Date') {
      return new Date(value.value);
    }
    return value;
  });
};

// Fonction pour nettoyer les anciennes données
export const cleanupOldData = (prefix: string, maxAge: number = 30 * 24 * 60 * 60 * 1000): void => {
  if (!isClient) return;
  
  try {
    const now = Date.now();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        const item = localStorage.getItem(key);
        if (item) {
          try {
            const data = JSON.parse(item);
            if (data.timestamp && now - data.timestamp > maxAge) {
              localStorage.removeItem(key);
            }
          } catch {
            // Si on ne peut pas parser, on garde l'item
          }
        }
      }
    }
  } catch (error) {
    console.warn('Erreur lors du nettoyage des données:', error);
  }
};

// Fonction pour exporter toutes les données
export const exportAllData = (): string => {
  if (!isClient) {
    throw new Error('Export disponible uniquement côté client');
  }
  
  const data: Record<string, any> = {};
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('chat-') || key.startsWith('theme-') || key.startsWith('settings-'))) {
        const item = localStorage.getItem(key);
        if (item) {
          data[key] = JSON.parse(item);
        }
      }
    }
    
    return JSON.stringify({
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
      data
    }, null, 2);
  } catch (error) {
    console.error('Erreur lors de l\'export:', error);
    throw new Error('Impossible d\'exporter les données');
  }
};

// Fonction pour importer toutes les données
export const importAllData = (jsonData: string): void => {
  if (!isClient) {
    throw new Error('Import disponible uniquement côté client');
  }
  
  try {
    const imported = JSON.parse(jsonData);
    
    if (!imported.data || typeof imported.data !== 'object') {
      throw new Error('Format de données invalide');
    }
    
    // Sauvegarder les données actuelles
    const backup: Record<string, string | null> = {};
    for (const key in imported.data) {
      backup[key] = localStorage.getItem(key);
    }
    
    try {
      // Importer les nouvelles données
      for (const [key, value] of Object.entries(imported.data)) {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      // Restaurer en cas d'erreur
      for (const [key, value] of Object.entries(backup)) {
        if (value === null) {
          localStorage.removeItem(key);
        } else {
          localStorage.setItem(key, value);
        }
      }
      throw error;
    }
  } catch (error) {
    console.error('Erreur lors de l\'import:', error);
    throw new Error('Impossible d\'importer les données');
  }
};
