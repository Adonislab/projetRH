// pages/index.tsx
'use client'
import Chatbot from '../components/Chatbot';

const Home: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="w-full h-full">
        <Chatbot />
      </div>  
    </div>
  );
};

export default Home;
