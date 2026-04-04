import { useState } from 'react';
import Navbar from './components/Navbar';
import HomeView from './components/HomeView';
import ChatView from './components/ChatView';

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [repoUrl, setRepoUrl] = useState('vercel/next.js');
  const navigate = (page) => setCurrentPage(page);

  return (
    <div style={{
      height: '100vh', width: '100vw',
      display: 'flex', flexDirection: 'column',
      background: '#0d0f14', color: '#e8eaf0',
      overflow: 'hidden', fontFamily: 'sans-serif',
    }}>
      <Navbar currentPage={currentPage} navigate={navigate} />
      {currentPage === 'home' && <HomeView setRepoUrl={setRepoUrl} navigate={navigate} />}
      {currentPage === 'chat' && <ChatView repoUrl={repoUrl} navigate={navigate} />}
    </div>
  );
};

export default App;