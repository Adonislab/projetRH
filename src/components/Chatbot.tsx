import { useState, ChangeEvent, KeyboardEvent } from 'react';
import { FiSend, FiUser, FiCpu } from 'react-icons/fi';
import { HfInference } from '@huggingface/inference';

interface Message {
  text: string;
  sender: 'bot' | 'user';
}

const inference = new HfInference('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');

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([{ text: 'Bonjour! Je suis votre assistant RH', sender: 'bot' }]);
  const [input, setInput] = useState<string>('');

  const sendMessage = async () => {
    if (input.trim() === '') return;

    const newMessage: Message = { text: input, sender: 'user' };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInput('');

    const botMessage: Message = { text: '', sender: 'bot' };
    setMessages((prevMessages) => [...prevMessages, botMessage]);

    for await (const chunk of inference.chatCompletionStream({
      model: 'meta-llama/Meta-Llama-3-8B-Instruct',
      messages: [{ role: 'user', content: input }],
      max_tokens: 500,
    })) {
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        updatedMessages[updatedMessages.length - 1].text += chunk.choices[0]?.delta?.content || '';
        return updatedMessages;
      });
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex-grow p-6 overflow-auto">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex items-center my-2 p-4 rounded-lg ${message.sender === 'bot' ? 'bg-blue-200 text-left' : 'bg-green-200 text-right'}`}
          >
            {message.sender === 'bot' ? <FiCpu className="mr-2" size={20} /> : <FiUser className="mr-2" size={20} />}
            <span dangerouslySetInnerHTML={{ __html: interpretSpecialChars(message.text) }} />
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
        />
        <button onClick={sendMessage} className="ml-2 p-2 bg-blue-500 text-white rounded-md flex items-center justify-center">
          <FiSend size={20} />
        </button>
      </div>
    </div>
  );
};

function interpretSpecialChars(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '*': '<b>',  // interprets '*' as bold start tag
    '_': '<i>',  // interprets '_' as italic start tag
    // Add corresponding closing tags for bold and italic
    '**': '</b>',
    '__': '</i>',
  };
  return text.replace(/[*_]{1,2}|[&<>"']/g, (m) => map[m] || m);
}

export default Chatbot;
