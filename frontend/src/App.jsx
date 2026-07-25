import React, { useState } from 'react';
import Home from './pages/Home';
import ReadmePage from './pages/ReadmePage';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [readmeData, setReadmeData] = useState(null);

  const handleViewReadme = (readmeContent, repoName) => {
    setReadmeData({ content: readmeContent, repoName });
    setCurrentPage('readme');
  };

  const handleBackHome = () => {
    setCurrentPage('home');
  };

  return (
    <div>
      {currentPage === 'home' ? (
        <Home onViewReadme={handleViewReadme} />
      ) : (
        <ReadmePage 
          readmeContent={readmeData?.content} 
          repoName={readmeData?.repoName}
          onBack={handleBackHome}
        />
      )}
    </div>
  );
}

export default App;