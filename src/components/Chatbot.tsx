import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { 
  Send, 
  Mic, 
  Paperclip, 
  MessageSquare, 
  Trash2, 
  Edit3, 
  MoreVertical,
  Sun,
  Moon,
  Menu,
  X,
  Plus,
  User,
  Bot,
  Loader2,
  Check,
  XCircle
} from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import LatexMarkdownRenderer from '../MessageRender';
import 'katex/dist/katex.min.css';

// Import des stores et hooks
import { 
  useCurrentConversation,
  useCurrentMessages,
  useChatActions,
  useChatStore,
  useTheme,
  useSidebar,
  useThemeActions
} from '../stores';
import { useChat } from '../hooks/useChat';

// Les interfaces sont maintenant importées depuis les stores

const Chatbot: React.FC = () => {
  // Hooks des stores
  const currentConversation = useCurrentConversation();
  const messages = useCurrentMessages();
  const { darkMode } = useTheme();
  const { sidebarOpen, isMobile, toggleSidebar, setSidebarOpen } = useSidebar();
  const { toggleDarkMode } = useThemeActions();
  const { 
    createNewConversation,
    deleteConversation,
    setCurrentConversation,
    startEditMessage,
    cancelEditMessage,
    saveEditMessage,
    deleteMessage
  } = useChatActions();
  
  // États du store chat
  const { 
    conversations,
    editingMessageId,
    editingText,
    currentConversationId
  } = useChatStore();
  
  // Hook personnalisé pour le chat
  const { sendMessage, loading } = useChat();

  // États locaux restants
  const [input, setInput] = useState<string>('');
  const [localEditingText, setLocalEditingText] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLTextAreaElement>(null);

  // Effets

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [loading]);

  // Fonctions utilitaires
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fonction pour envoyer un message (simplifiée)
  const handleSendMessage = async () => {
    if (input.trim() === '' || loading) return;
    
    const messageText = input.trim();
    setInput('');
    
    await sendMessage(messageText);
  };


  // Les fonctions de gestion des conversations et messages sont maintenant dans les stores

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading) {
      handleSendMessage();
    }
  };

  const handleEditKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSaveEdit();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  const handleSaveEdit = () => {
    if (editingMessageId && localEditingText.trim()) {
      const { updateMessage } = useChatStore.getState();
      updateMessage(currentConversationId, editingMessageId, localEditingText.trim());
      cancelEditMessage();
      setLocalEditingText('');
    }
  };

  const handleCancelEdit = () => {
    cancelEditMessage();
    setLocalEditingText('');
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: `rgb(var(--bg-primary))` }}>
      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || !isMobile) && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className={`${
              isMobile ? 'absolute z-50' : 'relative'
            } w-80 h-full border-r flex flex-col`}
            style={{ 
              background: `rgb(var(--bg-sidebar))`, 
              borderColor: `rgb(var(--border-primary))` 
            }}
          >
            {/* Sidebar Header */}
            <div className="p-6 border-b" style={{ borderColor: `rgb(var(--border-primary))` }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Image
                      src="/logo.jpeg"
                      alt="Logo"
                      className="w-10 h-10 rounded-xl shadow-md"
                      height={40}
                      width={40}
                    />
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold" style={{ color: `rgb(var(--text-primary))` }}>
                      Assistant Maths
                    </h1>
                    <p className="text-sm" style={{ color: `rgb(var(--text-secondary))` }}>
                      3ème année
                    </p>
                  </div>
                </div>
                {isMobile && (
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 rounded-lg transition-all-smooth hover:bg-opacity-10"
                    style={{ color: `rgb(var(--text-secondary))` }}
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
              
              <button
                onClick={createNewConversation}
                className="w-full p-3 rounded-xl transition-all-smooth flex items-center space-x-3 hover:scale-105"
                style={{ 
                  background: `var(--gradient-primary)`,
                  color: `rgb(var(--text-user))`,
                  boxShadow: `var(--shadow-md)`
                }}
              >
                <Plus size={18} />
                <span className="font-medium">Nouvelle conversation</span>
              </button>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {conversations.map((conversation) => (
                <motion.div
                  key={conversation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3 rounded-xl cursor-pointer transition-all-smooth group relative ${
                    currentConversationId === conversation.id
                      ? 'shadow-md'
                      : 'hover:shadow-sm'
                  }`}
                  style={{
                    background: currentConversationId === conversation.id
                      ? `rgb(var(--bg-tertiary))`
                      : 'transparent',
                    borderColor: `rgb(var(--border-primary))`
                  }}
                  onClick={() => setCurrentConversation(conversation.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg" style={{ background: `rgb(var(--bg-secondary))` }}>
                      <MessageSquare size={16} style={{ color: `rgb(var(--accent-primary))` }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 
                        className="font-medium text-sm truncate"
                        style={{ color: `rgb(var(--text-primary))` }}
                      >
                        {conversation.title}
                      </h3>
                      <p 
                        className="text-xs mt-1"
                        style={{ color: `rgb(var(--text-tertiary))` }}
                      >
                        {conversation.messages.length} message{conversation.messages.length > 1 ? 's' : ''}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conversation.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-lg transition-all-smooth hover:bg-red-100 dark:hover:bg-red-900"
                      style={{ color: `rgb(var(--accent-error))` }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Theme Toggle */}
            <div className="p-4 border-t" style={{ borderColor: `rgb(var(--border-primary))` }}>
              <button
                onClick={toggleDarkMode}
                className="w-full p-3 rounded-xl transition-all-smooth flex items-center space-x-3 hover:scale-105"
                style={{ 
                  background: `rgb(var(--bg-secondary))`,
                  color: `rgb(var(--text-primary))`
                }}
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                <span className="font-medium">
                  {darkMode ? 'Mode clair' : 'Mode sombre'}
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay pour mobile */}
      {isMobile && sidebarOpen && (
        <div
          className="absolute inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full">
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4 border-b"
          style={{ 
            background: `rgb(var(--bg-secondary))`,
            borderColor: `rgb(var(--border-primary))`
          }}
        >
          <div className="flex items-center space-x-3">
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg transition-all-smooth"
                style={{ color: `rgb(var(--text-secondary))` }}
              >
                <Menu size={20} />
              </button>
            )}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `var(--gradient-primary)` }}>
                  <Bot size={20} className="text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h2 className="font-semibold" style={{ color: `rgb(var(--text-primary))` }}>
                  Assistant Mathématiques
                </h2>
                <p className="text-sm" style={{ color: `rgb(var(--text-secondary))` }}>
                  En ligne • Réactif
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6" style={{ background: `rgb(var(--bg-chat))` }}>
          <div className="max-w-4xl mx-auto space-y-6">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} group`}
                >
                  <div className={`flex items-start space-x-3 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {message.sender === 'user' ? (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `rgb(var(--bg-user-message))` }}>
                          <User size={16} className="text-white" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `var(--gradient-primary)` }}>
                          <Bot size={16} className="text-white" />
                        </div>
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div className={`message-bubble relative ${message.sender === 'user' ? 'rounded-br-md' : 'rounded-bl-md'}`}
                         style={{
                           background: message.sender === 'user' 
                             ? `rgb(var(--bg-user-message))` 
                             : `rgb(var(--bg-bot-message))`,
                           color: message.sender === 'user' 
                             ? `rgb(var(--text-user))` 
                             : `rgb(var(--text-bot))`,
                           boxShadow: `var(--shadow-sm)`
                         }}>
                      
                      {/* Action Buttons (Top Right) */}
                      {index !== 0 && message.text !== '...' && editingMessageId !== message.id && (
                        <div className="absolute -top-2 -right-2 flex opacity-0 group-hover:opacity-100 transition-opacity z-10 action-buttons-container">
                          {/* Edit Button - Only for User Messages */}
                          {message.sender === 'user' && (
                            <button
                              onClick={() => {
                                startEditMessage(message.id, message.text);
                                setLocalEditingText(message.text);
                              }}
                              className="p-1.5 rounded-full transition-all-smooth hover:scale-110 edit-button"
                              style={{
                                color: `rgb(var(--text-secondary))`,
                                boxShadow: `var(--shadow-md)`
                              }}
                            >
                              <Edit3 size={12} />
                            </button>
                          )}
                          
                          {/* Delete Button - For All Messages */}
                          <button
                            onClick={() => deleteMessage(currentConversationId, message.id)}
                            className="p-1.5 rounded-full transition-all-smooth hover:scale-110 edit-button"
                            style={{
                              color: `rgb(var(--accent-error))`,
                              boxShadow: `var(--shadow-md)`
                            }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}

                      {/* Message Content */}
                      <div className="px-4 py-3">
                        {message.text === '...' ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-pulse-soft flex space-x-1">
                              <div className="w-2 h-2 rounded-full bg-current opacity-60"></div>
                              <div className="w-2 h-2 rounded-full bg-current opacity-40" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 rounded-full bg-current opacity-20" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        ) : editingMessageId === message.id ? (
                          /* Edit Mode */
                          <div className="space-y-3">
                            <textarea
                              ref={editInputRef}
                              value={localEditingText}
                              onChange={(e) => setLocalEditingText(e.target.value)}
                              onKeyDown={handleEditKeyDown}
                              className="w-full p-3 rounded-xl border-0 outline-none message-edit-textarea"
                              style={{
                                color: message.sender === 'user' 
                                  ? `rgb(var(--text-user))` 
                                  : `rgb(var(--text-primary))`,
                                minHeight: '80px'
                              }}
                              placeholder="Modifiez votre message..."
                            />
                            
                            {/* Edit Action Buttons */}
                            <div className="flex items-center justify-end space-x-2 edit-action-buttons">
                              <button
                                onClick={handleCancelEdit}
                                className="px-3 py-1.5 rounded-lg cancel-button flex items-center space-x-1"
                                style={{
                                  color: message.sender === 'user' 
                                    ? `rgb(var(--text-user))` 
                                    : `rgb(var(--text-secondary))`
                                }}
                              >
                                <XCircle size={14} />
                                <span className="text-sm font-medium">Annuler</span>
                              </button>
                              <button
                                onClick={handleSaveEdit}
                                disabled={!localEditingText.trim()}
                                className="px-3 py-1.5 rounded-lg save-button disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                                style={{
                                  color: 'white'
                                }}
                              >
                                <Check size={14} />
                                <span className="text-sm font-medium">Enregistrer</span>
                              </button>
                            </div>
                            
                            <div className="text-xs opacity-70 mt-1">
                              💡 Ctrl + Entrée pour enregistrer • Échap pour annuler
                            </div>
                          </div>
                        ) : (
                          /* Display Mode */
                          <LatexMarkdownRenderer
                            content={message.text}
                            isUser={message.sender === 'user'}
                            darkMode={darkMode}
                            className="w-full"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-6" style={{ background: `rgb(var(--bg-primary))` }}>
          <div className="max-w-4xl mx-auto">
            <div className="floating-input rounded-2xl p-4">
              <div className="flex items-end space-x-4">
                <button className="p-2 rounded-xl transition-all-smooth hover:scale-110"
                        style={{ color: `rgb(var(--text-tertiary))` }}>
                  <Paperclip size={20} />
                </button>
                
                <div className="flex-1">
                  <input
                    ref={inputRef}
                    className="w-full px-4 py-3 rounded-xl border-0 outline-none resize-none transition-all-smooth placeholder:font-normal"
                    style={{
                      background: `rgb(var(--bg-secondary))`,
                      color: `rgb(var(--text-primary))`,
                    }}
                    placeholder="Écrivez votre message..."
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                  />
                </div>

                <button className="p-2 rounded-xl transition-all-smooth hover:scale-110"
                        style={{ color: `rgb(var(--text-tertiary))` }}>
                  <Mic size={20} />
                </button>

                <button
                  onClick={handleSendMessage}
                  disabled={loading || input.trim() === ''}
                  className="p-3 rounded-xl transition-all-smooth disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 flex items-center justify-center"
                  style={{
                    background: input.trim() ? `var(--gradient-primary)` : `rgb(var(--bg-tertiary))`,
                    color: input.trim() ? 'white' : `rgb(var(--text-tertiary))`,
                    boxShadow: input.trim() ? `var(--shadow-md)` : 'none'
                  }}
                >
                  {loading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Send size={20} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
