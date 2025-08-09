import { useState, ChangeEvent, KeyboardEvent } from 'react';
import { FiLoader, FiTrash2, FiEdit, FiMousePointer } from 'react-icons/fi';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface Message {
  text: string;
  sender: 'bot' | 'user';
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { text: 'Comment puis-je vous aider dans votre apprentissage des mathématiques de 3ème ?', sender: 'bot' },
  ]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const sendMessage = async () => {
    if (input.trim() === '') return;

    const newMessage: Message = { text: input, sender: 'user' };
    setMessages((prev) => [...prev, newMessage]);
    setInput('');

    const botMessage: Message = { text: '...', sender: 'bot' };
    setMessages((prev) => [...prev, botMessage]);
    setLoading(true);

    try {
      const encodedQuestion = encodeURIComponent(input);
      const response = await fetch(
        `https://back-rh.onrender.com/ask_question?question=${encodedQuestion}`,
        {
          method: 'POST',
          headers: { accept: 'application/json' },
        }
      );

      const data = await response.json();

      // Formatage du message bot avec réponse + documents
      let formattedText = data.Reponse;
      if (data.Documents && Array.isArray(data.Documents)) {
        formattedText += `\n\n**📄 Documents associés :**\n`;
        data.Documents.forEach((doc: any, idx: number) => {
          formattedText += `\n${idx + 1}. **Source :** ${doc.source} *(page ${doc.page})*\n> ${doc.extrait}`;
        });
      }

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].text = formattedText;
        return updated;
      });
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].text = 'Désolé, une erreur est survenue.';
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  const resendMessage = async (index: number) => {
    const messageToResend = messages[index].text;
    const botMessage: Message = { text: '...', sender: 'bot' };
    setMessages((prev) => [...prev, botMessage]);
    setLoading(true);

    try {
      const encodedQuestion = encodeURIComponent(messageToResend);
      const response = await fetch(`https://back-rh.onrender.com/ask_question?question=${encodedQuestion}`, {
        method: 'POST',
        headers: { accept: 'application/json' },
      });

      const data = await response.json();
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].text = data.Reponse;
        return updated;
      });
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].text = 'Désolé, une erreur est survenue.';
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteMessage = (index: number) => {
    setMessages((prev) => prev.filter((_, i) => i !== index));
  };

  const editMessage = (index: number) => {
    setInput(messages[index].text);
    setEditingIndex(index);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading) {
      if (editingIndex !== null) {
        const updated = [...messages];
        updated[editingIndex].text = input;
        setMessages(updated);
        resendMessage(editingIndex);
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
        <Image src="/logo.jpeg" alt="Logo" className="w-8 h-8 mr-2" height={500} width={500} />
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
                      src="/logo.jpeg"
                      alt="Bot Logo"
                      className="w-8 h-8 mr-2 rounded-full"
                      height={500}
                      width={500}
                    />
                  </div>
                )}

                <ReactMarkdown
                  className="bg-green-300 text-black p-2 rounded-md"
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                >
                  {message.text}
                </ReactMarkdown>

                {index !== 0 && (
                  <div className="flex space-x-2 ml-2">
                    <button onClick={() => deleteMessage(index)} className="text-red-500 hover:text-red-700">
                      <FiTrash2 size={20} />
                    </button>
                    <button onClick={() => editMessage(index)} className="text-blue-500 hover:text-blue-700">
                      <FiEdit size={20} />
                    </button>
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
              placeholder="Votre question ..."
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
