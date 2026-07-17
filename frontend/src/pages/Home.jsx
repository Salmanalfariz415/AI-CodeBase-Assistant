import React, { useState } from 'react';
import UrlForm from '../components/UrlForm'; // Note the '../' to go up and into components

const Home = () => {
  const [submittedUrl, setSubmittedUrl] = useState('');

  const handleUrlSubmit = (url) => {
    setSubmittedUrl(url);
    // You can make API calls with the URL here!
    console.log("URL received in Home Page:", url);
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1>GitHub Repository Analyzer</h1>
        <p>Enter a repository URL below to get started.</p>
      </header>

      <main style={styles.container}>
        <UrlForm onSubmit={handleUrlSubmit} />
        
        {submittedUrl && (
          <div style={styles.resultBox}>
            <h3>Ready to process:</h3>
            <code>{submittedUrl}</code>
          </div>
        )}
      </main>
    </div>
  );
};

const styles = {
  page: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#f6f8fa', padding: '40px 20px' },
  header: { textAlign: 'center', marginBottom: '30px' },
  container: { width: '100%', maxWidth: '450px', backgroundColor: '#ffffff', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
  resultBox: { marginTop: '20px', padding: '15px', backgroundColor: '#f1f8ff', borderRadius: '6px', border: '1px solid #c8e1ff' }
};

export default Home;