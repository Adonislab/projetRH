// pages/index.tsx
'use client'
import Chatbot from '../components/Chatbot';
import StoreProvider from '../components/StoreProvider';
import NoSSR from '../components/NoSSR';

const Home: React.FC = () => {
  return (
    <NoSSR>
      <StoreProvider>
        <div className="flex justify-center items-center h-screen bg-gray-100">
          <div className="w-full h-full">
            <Chatbot />
          </div>  
        </div>
      </StoreProvider>
    </NoSSR>
  );
};

export default Home;
