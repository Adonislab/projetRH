import { useState, ChangeEvent, KeyboardEvent } from 'react';
import { FiSend, FiLoader, FiTrash2, FiRefreshCw } from 'react-icons/fi'; // Importer une icône pour l'effacement et actualisation

interface Message {
  text: string;
  sender: 'bot' | 'user';
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { text: 'Bonjour, je suis le jeune RH disposé à répondre à vos questions.', sender: 'bot' },
  ]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false); // Indicateur de chargement

  const sendMessage = async () => {
    if (input.trim() === '') return;

    const newMessage: Message = { text: input, sender: 'user' };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInput('');

    // Ajouter un message vide du bot pendant que la réponse est en attente
    const botMessage: Message = { text: 'Un instant, je cherche pour la réponse', sender: 'bot' };
    setMessages((prevMessages) => [...prevMessages, botMessage]);
    setLoading(true);

    try {
      const encodedQuestion = encodeURIComponent(input);
      const response = await fetch(`https://back-rh.onrender.com/ask_question?question=${encodedQuestion}`, {
        method: 'POST',
        headers: {
          accept: 'application/json',
        },
      });

      const data = await response.json();

      // Mise à jour du message du bot avec la réponse reçue
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        updatedMessages[updatedMessages.length - 1].text = data.Reponse; // Mettre à jour avec la réponse complète
        return updatedMessages;
      });
    } catch (error) {
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        updatedMessages[updatedMessages.length - 1].text = 'Désolé, une erreur est survenue.'; // Gérer les erreurs
        return updatedMessages;
      });
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour supprimer un message spécifique
  const deleteMessage = (index: number) => {
    setMessages((prevMessages) => prevMessages.filter((_, i) => i !== index));
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading) sendMessage(); // Bloquer l'envoi si déjà en attente
  };

  const refreshPage = () => {
    window.location.reload(); // Actualiser la page
  };

  return (
    <div className="flex h-screen bg-green-50 flex-col">
      {/* Header pour présenter le projet */}
      <header className="bg-green-600 text-white text-center p-4 font-bold text-xl">
        Votre Assistant RH
      </header>

      <div className="flex h-full">
        {/* Colonne pour le bouton de rafraîchissement */}
        <div className="w-16 bg-green-200 flex flex-col justify-center items-center">
          <button onClick={refreshPage} className="p-4 bg-green-500 text-white rounded-full hover:bg-green-700">
            <FiRefreshCw size={24} />
          </button>
        </div>

        <div className="flex flex-col flex-grow">
          <div className="flex-grow p-6 overflow-auto">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-center my-2 p-4 rounded-lg justify-between ${
                  message.sender === 'bot' ? 'bg-green-300 text-left' : 'bg-green-400 text-right'
                }`}
              >
                <span className="text-white font-bold">{message.text}</span> {/* Texte en blanc et en gras */}
                <button onClick={() => deleteMessage(index)} className="ml-4 text-red-500 hover:text-red-700">
                  <FiTrash2 size={20} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex p-4 bg-white border-t border-gray-200">
            <input
              className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none"
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Votre question pour votre expert RH..."
              disabled={loading} // Désactiver le champ pendant le chargement
            />
            <button onClick={sendMessage} className="ml-2 p-2 bg-green-500 text-white rounded-md flex items-center justify-center" disabled={loading}>
              {loading ? <FiLoader className="animate-spin" size={20} /> : <FiSend size={20} />} {/* Spinner ou icône d'envoi */}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
