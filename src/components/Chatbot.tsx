import { useState, ChangeEvent, KeyboardEvent } from 'react';
import { FiSend, FiLoader, FiTrash2, FiEdit, FiMousePointer } from 'react-icons/fi';
import Image from 'next/image';

interface Message {
  text: string;
  sender: 'bot' | 'user';
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { text: 'Comment puis-je vous aider ?', sender: 'bot' }, // Premier message du bot
  ]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const sendMessage = async () => {
    if (input.trim() === '') return;

    const newMessage: Message = { text: input, sender: 'user' };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInput('');

    const botMessage: Message = { text: '...', sender: 'bot' };
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
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        updatedMessages[updatedMessages.length - 1].text = data.Reponse;
        return updatedMessages;
      });
    } catch (error) {
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        updatedMessages[updatedMessages.length - 1].text = 'Désolé, une erreur est survenue.';
        return updatedMessages;
      });
    } finally {
      setLoading(false);
    }
  };

  const resendMessage = async (index: number) => {
    const messageToResend = messages[index].text;
    const botMessage: Message = { text: '...', sender: 'bot' };
    setMessages((prevMessages) => [...prevMessages, botMessage]);
    setLoading(true);

    try {
      const encodedQuestion = encodeURIComponent(messageToResend);
      const response = await fetch(`https://back-rh.onrender.com/ask_question?question=${encodedQuestion}`, {
        method: 'POST',
        headers: {
          accept: 'application/json',
        },
      });

      const data = await response.json();
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        updatedMessages[updatedMessages.length - 1].text = data.Reponse;
        return updatedMessages;
      });
    } catch (error) {
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        updatedMessages[updatedMessages.length - 1].text = 'Désolé, une erreur est survenue.';
        return updatedMessages;
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteMessage = (index: number) => {
    setMessages((prevMessages) => prevMessages.filter((_, i) => i !== index));
  };

  const editMessage = (index: number) => {
    const messageToEdit = messages[index].text;
    setInput(messageToEdit);
    setEditingIndex(index);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading) {
      if (editingIndex !== null) {
        const updatedMessages = [...messages];
        updatedMessages[editingIndex].text = input;
        setMessages(updatedMessages);
        resendMessage(editingIndex); // Renvoyer le message modifié pour une nouvelle réponse
        setEditingIndex(null);
        setInput('');
      } else {
        sendMessage();
      }
    }
  };

  return (
    <div className="flex h-screen bg-green-50 flex-col">
      <header className="p-4 font-bold text-xl">
        <Image
          src="/logo.jpeg"
          alt="Logo"
          className="w-8 h-8 mr-2"
          height={500}
          width={500}
        />
      </header>

      <div className="flex h-full">
        <div className="flex flex-col flex-grow">
          <div className="flex-grow p-6 overflow-auto">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-center my-2 p-4 rounded-lg ${
                  message.sender === 'user' ? 'justify-start' : 'justify-end'
                }`}
              >
                {message.sender === 'bot' && (
                  <div className="flex items-center mr-2">
                    <Image
                      src="/logo.jpeg" // Image du logo du bot
                      alt="Bot Logo"
                      className="w-8 h-8 rounded-full"
                      height={500}
                      width={500}
                    />
                  </div>
                )}

                <span className="bg-green-300 text-black p-2 rounded-md">
                  {message.text}
                </span>

                {index !== 0 && message.sender === 'user' && (
                  <div className="flex space-x-2 ml-2">
                    <button onClick={() => deleteMessage(index)} className="text-red-500 hover:text-red-700">
                      <FiTrash2 size={20} />
                    </button>
                    <button onClick={() => editMessage(index)} className="text-blue-500 hover:text-blue-700">
                      <FiEdit size={20} />
                    </button>
                  </div>
                )}
                {index !== 0 && message.sender === 'bot' && (
                  <div className="flex space-x-2 ml-2">
                    <button onClick={() => deleteMessage(index)} className="text-red-500 hover:text-red-700">
                      <FiTrash2 size={20} />
                    </button>
                    {/* Aucune icône d'envoi (FiSend) pour les messages du bot */}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex p-4 bg-white border-t border-gray-200">
            <input
              className="flex-grow p-2 border border-gray-300 rounded-full focus:outline-none bg-green-500 text-white placeholder-white"
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Quel est la durée légale de la période d'essaie en entreprise ?"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              className="ml-2 p-2 bg-green-500 text-white rounded-full flex items-center justify-center"
              disabled={loading}
            >
              {loading ? <FiLoader className="animate-spin" size={20} /> : <FiMousePointer size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;





