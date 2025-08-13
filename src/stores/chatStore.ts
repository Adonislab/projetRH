import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { ChatStore, Message, Conversation } from '../types/store';
import { createPersistentStorage, serializeState, deserializeState } from './utils/persistence';

// Message de bienvenue par défaut
const defaultWelcomeMessage: Message = {
  id: 'welcome-1',
  text: `👋 **Bienvenue dans votre Assistant Mathématiques de 3ème !**

Je peux vous aider avec :

📐 **Géométrie** : Théorème de Pythagore $a^2 + b^2 = c^2$, aires et volumes

📊 **Algèbre** : Équations du second degré $ax^2 + bx + c = 0$

📈 **Fonctions** : Fonctions linéaires $f(x) = ax + b$, trigonométrie

🧮 **Calculs** : Fractions, pourcentages, proportionnalité

> 💡 **Astuce** : Vous pouvez utiliser des formules LaTeX comme \`$x^2$\` ou \`$$\\frac{a}{b}$$\` dans vos questions !

Comment puis-je vous aider aujourd'hui ?`,
  sender: 'bot',
  timestamp: new Date()
};

// Conversation par défaut
const createDefaultConversation = (): Conversation => ({
  id: 'default-1',
  title: 'Nouvelle conversation',
  messages: [defaultWelcomeMessage],
  lastMessage: new Date(),
  createdAt: new Date()
});

// Fonction utilitaire pour générer un ID unique
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// État initial du store
const initialState = {
  conversations: [createDefaultConversation()],
  currentConversationId: 'default-1',
  loading: false,
  editingMessageId: null,
  editingText: ''
};

// Création du store avec persistance et Immer
export const useChatStore = create<ChatStore>()(
  persist(
    immer((set, get) => ({
      ...initialState,

      // === Gestion des conversations ===
      createNewConversation: () => {
        const newConversation: Conversation = {
          id: generateId(),
          title: 'Nouvelle conversation',
          messages: [{
            id: generateId(),
            text: `👋 **Nouvelle conversation !**

Je suis votre assistant pour les **mathématiques de 3ème**. 

Posez-moi vos questions sur :
- 📐 Géométrie (Pythagore, aires, volumes)
- 📊 Algèbre (équations, inéquations)  
- 📈 Fonctions (linéaires, affines)
- 🧮 Calculs (fractions, pourcentages)

Comment puis-je vous aider ?`,
            sender: 'bot',
            timestamp: new Date()
          }],
          lastMessage: new Date(),
          createdAt: new Date()
        };

        set((state) => {
          state.conversations.unshift(newConversation);
          state.currentConversationId = newConversation.id;
        });
      },

      deleteConversation: (conversationId: string) => {
        set((state) => {
          const conversationIndex = state.conversations.findIndex(c => c.id === conversationId);
          if (conversationIndex === -1) return;

          state.conversations.splice(conversationIndex, 1);

          // Si c'était la conversation actuelle, switcher vers une autre
          if (state.currentConversationId === conversationId) {
            if (state.conversations.length > 0) {
              state.currentConversationId = state.conversations[0].id;
            } else {
              // Créer une nouvelle conversation si plus aucune
              const newConversation = createDefaultConversation();
              newConversation.id = generateId();
              state.conversations.push(newConversation);
              state.currentConversationId = newConversation.id;
            }
          }
        });
      },

      setCurrentConversation: (conversationId: string) => {
        set((state) => {
          const conversation = state.conversations.find(c => c.id === conversationId);
          if (conversation) {
            state.currentConversationId = conversationId;
          }
        });
      },

      updateConversationTitle: (conversationId: string, title: string) => {
        set((state) => {
          const conversation = state.conversations.find(c => c.id === conversationId);
          if (conversation) {
            conversation.title = title.trim();
          }
        });
      },

      // === Gestion des messages ===
      addMessage: (conversationId: string, messageData: Omit<Message, 'id' | 'timestamp'>) => {
        const message: Message = {
          id: generateId(),
          timestamp: new Date(),
          ...messageData
        };

        set((state) => {
          const conversation = state.conversations.find(c => c.id === conversationId);
          if (conversation) {
            conversation.messages.push(message);
            conversation.lastMessage = new Date();
            
            // Mettre à jour le titre si c'est le premier message utilisateur
            if (conversation.messages.length === 2 && message.sender === 'user') {
              conversation.title = message.text.slice(0, 30) + (message.text.length > 30 ? '...' : '');
            }
          }
        });
      },

      updateMessage: (conversationId: string, messageId: string, text: string) => {
        set((state) => {
          const conversation = state.conversations.find(c => c.id === conversationId);
          if (conversation) {
            const message = conversation.messages.find(m => m.id === messageId);
            if (message) {
              message.text = text;
              conversation.lastMessage = new Date();
            }
          }
        });
      },

      deleteMessage: (conversationId: string, messageId: string) => {
        set((state) => {
          const conversation = state.conversations.find(c => c.id === conversationId);
          if (conversation) {
            const messageIndex = conversation.messages.findIndex(m => m.id === messageId);
            if (messageIndex !== -1) {
              conversation.messages.splice(messageIndex, 1);
              conversation.lastMessage = new Date();
            }
          }
        });
      },

      // === État de chargement et édition ===
      setLoading: (loading: boolean) => {
        set((state) => {
          state.loading = loading;
        });
      },

      startEditMessage: (messageId: string, text: string) => {
        set((state) => {
          state.editingMessageId = messageId;
          state.editingText = text;
        });
      },

      cancelEditMessage: () => {
        set((state) => {
          state.editingMessageId = null;
          state.editingText = '';
        });
      },

      saveEditMessage: (conversationId: string) => {
        set((state) => {
          if (state.editingMessageId && state.editingText.trim()) {
            const conversation = state.conversations.find(c => c.id === conversationId);
            if (conversation) {
              const message = conversation.messages.find(m => m.id === state.editingMessageId);
              if (message) {
                message.text = state.editingText.trim();
                conversation.lastMessage = new Date();
              }
            }
            state.editingMessageId = null;
            state.editingText = '';
          }
        });
      },

      // === Actions utilitaires ===
      clearAllConversations: () => {
        set((state) => {
          const defaultConv = createDefaultConversation();
          defaultConv.id = generateId();
          state.conversations = [defaultConv];
          state.currentConversationId = defaultConv.id;
          state.editingMessageId = null;
          state.editingText = '';
          state.loading = false;
        });
      },

      exportConversation: (conversationId: string): string => {
        const conversation = get().conversations.find(c => c.id === conversationId);
        if (!conversation) {
          throw new Error('Conversation non trouvée');
        }

        return JSON.stringify({
          exportedAt: new Date().toISOString(),
          conversation: serializeState(conversation)
        }, null, 2);
      },

      importConversation: (conversationData: string) => {
        try {
          const imported = JSON.parse(conversationData);
          const conversation = deserializeState(imported.conversation) as Conversation;
          
          // Générer un nouvel ID pour éviter les conflits
          conversation.id = generateId();
          conversation.messages.forEach(msg => {
            msg.id = generateId();
          });

          set((state) => {
            state.conversations.unshift(conversation);
            state.currentConversationId = conversation.id;
          });
        } catch (error) {
          console.error('Erreur lors de l\'import:', error);
          throw new Error('Impossible d\'importer la conversation');
        }
      }
    })),
    {
      name: 'chat-store',
      partialize: (state) => ({
        conversations: state.conversations,
        currentConversationId: state.currentConversationId
      }),
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Réinitialiser les états temporaires après la réhydratation
          state.loading = false;
          state.editingMessageId = null;
          state.editingText = '';
          
          // Vérifier que la conversation actuelle existe
          if (!state.conversations.find(c => c.id === state.currentConversationId)) {
            if (state.conversations.length > 0) {
              state.currentConversationId = state.conversations[0].id;
            } else {
              const defaultConv = createDefaultConversation();
              state.conversations = [defaultConv];
              state.currentConversationId = defaultConv.id;
            }
          }
        }
      }
    }
  )
);

// Hooks personnalisés pour un accès simplifié
export const useCurrentConversation = () => {
  const { conversations, currentConversationId } = useChatStore();
  return conversations.find(c => c.id === currentConversationId);
};

export const useCurrentMessages = () => {
  const currentConversation = useCurrentConversation();
  return currentConversation?.messages || [];
};

export const useChatActions = () => {
  const {
    createNewConversation,
    deleteConversation,
    setCurrentConversation,
    addMessage,
    updateMessage,
    deleteMessage,
    setLoading,
    startEditMessage,
    cancelEditMessage,
    saveEditMessage
  } = useChatStore();

  return {
    createNewConversation,
    deleteConversation,
    setCurrentConversation,
    addMessage,
    updateMessage,
    deleteMessage,
    setLoading,
    startEditMessage,
    cancelEditMessage,
    saveEditMessage
  };
};
