// Types pour les messages et conversations
export interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
  isEditing?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  lastMessage: Date;
  createdAt: Date;
}

// Types pour l'état du chat
export interface ChatState {
  conversations: Conversation[];
  currentConversationId: string;
  loading: boolean;
  editingMessageId: string | null;
  editingText: string;
}

export interface ChatActions {
  // Gestion des conversations
  createNewConversation: () => void;
  deleteConversation: (conversationId: string) => void;
  setCurrentConversation: (conversationId: string) => void;
  updateConversationTitle: (conversationId: string, title: string) => void;
  
  // Gestion des messages
  addMessage: (conversationId: string, message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateMessage: (conversationId: string, messageId: string, text: string) => void;
  deleteMessage: (conversationId: string, messageId: string) => void;
  
  // État de chargement et édition
  setLoading: (loading: boolean) => void;
  startEditMessage: (messageId: string, text: string) => void;
  cancelEditMessage: () => void;
  saveEditMessage: (conversationId: string) => void;
  
  // Actions utilitaires
  clearAllConversations: () => void;
  exportConversation: (conversationId: string) => string;
  importConversation: (conversationData: string) => void;
}

export type ChatStore = ChatState & ChatActions;

// Types pour le thème et l'UI
export interface ThemeState {
  darkMode: boolean;
  sidebarOpen: boolean;
  isMobile: boolean;
  fontSize: 'small' | 'medium' | 'large';
  chatLayout: 'comfortable' | 'compact';
}

export interface ThemeActions {
  toggleDarkMode: () => void;
  setDarkMode: (darkMode: boolean) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setIsMobile: (isMobile: boolean) => void;
  setFontSize: (fontSize: ThemeState['fontSize']) => void;
  setChatLayout: (layout: ThemeState['chatLayout']) => void;
  resetTheme: () => void;
}

export type ThemeStore = ThemeState & ThemeActions;

// Types pour les paramètres utilisateur
export interface UserSettings {
  username: string;
  avatar: string | null;
  language: 'fr' | 'en';
  mathNotation: 'latex' | 'ascii';
  autoSave: boolean;
  soundEnabled: boolean;
  apiEndpoint: string;
  maxTokens: number;
  temperature: number;
}

export interface SettingsState {
  settings: UserSettings;
  isFirstVisit: boolean;
  lastActiveDate: Date | null;
  sessionStartTime: Date;
}

export interface SettingsActions {
  updateSettings: (settings: Partial<UserSettings>) => void;
  resetSettings: () => void;
  setFirstVisit: (isFirst: boolean) => void;
  updateLastActiveDate: () => void;
  exportSettings: () => string;
  importSettings: (settingsData: string) => void;
}

export type SettingsStore = SettingsState & SettingsActions;

// Types pour la persistance
export interface PersistedState {
  chat: Partial<ChatState>;
  theme: Partial<ThemeState>;
  settings: Partial<SettingsState>;
}

// Types pour les actions API
export interface ApiResponse {
  Reponse: string;
  Documents?: Array<{
    source: string;
    page: number;
    extrait: string;
  }>;
}

export interface ApiError {
  message: string;
  code?: number;
  timestamp: Date;
}

// Types pour les hooks personnalisés
export interface UseConversationReturn {
  currentConversation: Conversation | undefined;
  messages: Message[];
  sendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  error: ApiError | null;
}

export interface UseChatActionsReturn {
  createConversation: () => string;
  deleteConversation: (id: string) => void;
  switchConversation: (id: string) => void;
  editMessage: (messageId: string) => void;
  deleteMessage: (messageId: string) => void;
}
