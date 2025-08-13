import { useCallback } from 'react';
import { useChatStore, useCurrentConversation, useCurrentMessages } from '../stores/chatStore';
import { useApiSettings } from '../stores/settingsStore';
import { ApiResponse, ApiError } from '../types/store';

/**
 * Hook personnalisé pour gérer les interactions de chat avec l'API
 */
export const useChat = () => {
  const currentConversation = useCurrentConversation();
  const messages = useCurrentMessages();
  const { apiEndpoint, maxTokens, temperature } = useApiSettings();
  const { 
    addMessage, 
    updateMessage, 
    setLoading, 
    loading,
    currentConversationId,
    updateConversationTitle
  } = useChatStore();

  // Fonction pour générer un ID unique
  const generateId = useCallback((): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Fonction pour envoyer un message
  const sendMessage = useCallback(async (text: string): Promise<void> => {
    if (!text.trim() || loading || !currentConversationId) {
      return;
    }

    const messageText = text.trim();

    // Ajouter le message utilisateur
    addMessage(currentConversationId, {
      text: messageText,
      sender: 'user'
    });

    // Ajouter un message bot temporaire
    const botMessageId = generateId();
    addMessage(currentConversationId, {
      text: '...',
      sender: 'bot'
    });

    // Mettre à jour le titre de la conversation si c'est le premier message
    if (currentConversation && currentConversation.messages.length === 1) {
      const title = messageText.slice(0, 30) + (messageText.length > 30 ? '...' : '');
      updateConversationTitle(currentConversationId, title);
    }

    setLoading(true);

    try {
      // Appel à l'API
      const encodedQuestion = encodeURIComponent(messageText);
      const response = await fetch(
        `${apiEndpoint}/ask_question?question=${encodedQuestion}`,
        {
          method: 'POST',
          headers: { 
            accept: 'application/json',
            'Content-Type': 'application/json'
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      let formattedText = data.Reponse ?? 'Désolé, je n\'ai pas pu traiter votre demande.';

      // Ajouter les documents associés si présents
      if (data.Documents && Array.isArray(data.Documents)) {
        formattedText += `\n\n**📄 Documents associés :**\n`;
        data.Documents.forEach((doc, idx) => {
          formattedText += `\n${idx + 1}. **Source :** ${doc.source} *(page ${doc.page})*\n> ${doc.extrait}`;
        });
      }

      // Mettre à jour le message bot avec la réponse
      const botMessages = messages.filter(msg => msg.sender === 'bot' && msg.text === '...');
      if (botMessages.length > 0) {
        const latestBotMessage = botMessages[botMessages.length - 1];
        updateMessage(currentConversationId, latestBotMessage.id, formattedText);
      }

    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      
      let errorMessage = 'Désolé, une erreur est survenue lors de la communication avec le serveur.';
      
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.';
        } else if (error.message.includes('HTTP')) {
          errorMessage = 'Le serveur a retourné une erreur. Veuillez réessayer plus tard.';
        }
      }

      // Mettre à jour le message bot avec l'erreur
      const botMessages = messages.filter(msg => msg.sender === 'bot' && msg.text === '...');
      if (botMessages.length > 0) {
        const latestBotMessage = botMessages[botMessages.length - 1];
        updateMessage(currentConversationId, latestBotMessage.id, errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [
    loading,
    currentConversationId,
    currentConversation,
    messages,
    apiEndpoint,
    addMessage,
    updateMessage,
    setLoading,
    generateId,
    updateConversationTitle
  ]);

  // Fonction pour renvoyer le dernier message
  const resendLastMessage = useCallback(async (): Promise<void> => {
    if (!currentConversation || currentConversation.messages.length < 2) {
      return;
    }

    const lastUserMessage = [...currentConversation.messages]
      .reverse()
      .find(msg => msg.sender === 'user');

    if (lastUserMessage) {
      await sendMessage(lastUserMessage.text);
    }
  }, [currentConversation, sendMessage]);

  // Fonction pour arrêter la génération
  const stopGeneration = useCallback((): void => {
    setLoading(false);
    
    // Mettre à jour le dernier message bot en cours si nécessaire
    if (currentConversationId) {
      const botMessages = messages.filter(msg => msg.sender === 'bot' && msg.text === '...');
      if (botMessages.length > 0) {
        const latestBotMessage = botMessages[botMessages.length - 1];
        updateMessage(currentConversationId, latestBotMessage.id, 'Génération interrompue par l\'utilisateur.');
      }
    }
  }, [currentConversationId, messages, setLoading, updateMessage]);

  return {
    // État
    currentConversation,
    messages,
    loading,
    
    // Actions
    sendMessage,
    resendLastMessage,
    stopGeneration,
    
    // Configuration
    apiEndpoint,
    maxTokens,
    temperature
  };
};

/**
 * Hook pour les statistiques de conversation
 */
export const useChatStats = () => {
  const currentConversation = useCurrentConversation();
  
  const getMessageCount = useCallback((): { total: number; user: number; bot: number } => {
    if (!currentConversation) {
      return { total: 0, user: 0, bot: 0 };
    }
    
    const total = currentConversation.messages.length;
    const user = currentConversation.messages.filter(msg => msg.sender === 'user').length;
    const bot = currentConversation.messages.filter(msg => msg.sender === 'bot').length;
    
    return { total, user, bot };
  }, [currentConversation]);
  
  const getConversationDuration = useCallback((): number | null => {
    if (!currentConversation || currentConversation.messages.length === 0) {
      return null;
    }
    
    const firstMessage = currentConversation.messages[0];
    const lastMessage = currentConversation.messages[currentConversation.messages.length - 1];
    
    return lastMessage.timestamp.getTime() - firstMessage.timestamp.getTime();
  }, [currentConversation]);
  
  const getAverageResponseTime = useCallback((): number | null => {
    if (!currentConversation) return null;
    
    const responseTimes: number[] = [];
    
    for (let i = 0; i < currentConversation.messages.length - 1; i++) {
      const currentMsg = currentConversation.messages[i];
      const nextMsg = currentConversation.messages[i + 1];
      
      if (currentMsg.sender === 'user' && nextMsg.sender === 'bot') {
        responseTimes.push(nextMsg.timestamp.getTime() - currentMsg.timestamp.getTime());
      }
    }
    
    if (responseTimes.length === 0) return null;
    
    return responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
  }, [currentConversation]);
  
  return {
    getMessageCount,
    getConversationDuration,
    getAverageResponseTime
  };
};
