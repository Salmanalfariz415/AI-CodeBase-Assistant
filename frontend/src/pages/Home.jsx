import React, { useState } from 'react';
import UrlForm from '../components/UrlForm';

const Home = ({ onViewReadme }) => {
  const [submittedUrl, setSubmittedUrl] = useState('');
  const [repoData, setRepoData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUrlSubmit = async (url) => {
    setSubmittedUrl(url);
    setError('');
    setLoading(true);  // ✅ Fixed: was setLoaded
    
    try {
      // ✅ Fixed: removed backticks
      const response = await fetch('http://localhost:5000/api/link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch repository');
      }
      
      setRepoData(data);
      console.log("URL received in Home Page:", url);
      
    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);  // ✅ Added: turn off loading
    }
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1>GitHub Repository Analyzer</h1>
        <p>Enter a repository URL below to get started.</p>
      </header>

      <main style={styles.container}>
        <UrlForm onSubmit={handleUrlSubmit} />
        
        {/* ✅ submittedUrl IS used here - shows which URL is being analyzed */}
        {loading && (
          <p style={styles.loading}>
            Analyzing <strong>{submittedUrl}</strong>...
          </p>
        )}
        
        {error && (
          <div style={styles.errorBox}>
            <p>❌ {error}</p>
          </div>
        )}
        
        {repoData && (
          <div style={styles.resultBox}>
            {/* ✅ submittedUrl IS used here - shows what URL was submitted */}
            <h3>Repository Details</h3>
            <p style={styles.submittedUrl}>
              📎 <strong>URL:</strong> {submittedUrl}
            </p>
            <div style={styles.repoInfo}>
              <p><strong>Name:</strong> {repoData.name}</p>
              <p><strong>Description:</strong> {repoData.description || 'No description'}</p>
              <p><strong>⭐ Stars:</strong> {repoData.stars.toLocaleString()}</p>
              <p><strong>🍴 Forks:</strong> {repoData.forks.toLocaleString()}</p>
              <p><strong>⚠️ Issues:</strong> {repoData.issues.toLocaleString()}</p>
              <p><strong>Language:</strong> {repoData.language || 'Not specified'}</p>
              <a href={repoData.url} target="_blank" rel="noopener noreferrer">
                View on GitHub →
              </a>
            </div>
            
            {/* Display Generated README */}
            {repoData.generatedReadme && (
              <div style={styles.readmeBox}>
                <div style={styles.readmeHeader}>
                  <h3>📄 AI-Generated README</h3>
                  <button 
                    onClick={() => onViewReadme(repoData.generatedReadme, repoData.name)}
                    style={styles.viewFullButton}
                  >
                    View Full README →
                  </button>
                </div>
                <div style={styles.readmePreview}>
                  {repoData.generatedReadme.split('\n').slice(0, 10).map((line, idx) => (
                    <div key={idx} style={styles.readmeLine}>
                      {line}
                    </div>
                  ))}
                  <div style={styles.readmeMoreHint}>... (click "View Full README" to see more)</div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* ✅ Bonus: Show a message when no URL submitted yet */}
        {!submittedUrl && !loading && !error && !repoData && (
          <p style={styles.emptyState}>Enter a URL to get started</p>
        )}
      </main>
    </div>
  );
};

const styles = {
  page: { 
    minHeight: '100vh', 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    backgroundColor: '#f6f8fa', 
    padding: '40px 20px' 
  },
  header: { 
    textAlign: 'center', 
    marginBottom: '30px' 
  },
  container: { 
    width: '100%', 
    maxWidth: '900px', 
    backgroundColor: '#ffffff', 
    padding: '30px', 
    borderRadius: '8px', 
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)' 
  },
  loading: { 
    marginTop: '15px', 
    color: '#0366d6',
    textAlign: 'center'
  },
  errorBox: { 
    marginTop: '15px', 
    padding: '15px', 
    backgroundColor: '#ffe3e6', 
    borderRadius: '6px', 
    border: '1px solid #ffa7a7', 
    color: '#d73a49' 
  },
  resultBox: { 
    marginTop: '20px', 
    padding: '20px', 
    backgroundColor: '#f1f8ff', 
    borderRadius: '6px', 
    border: '1px solid #c8e1ff',
    maxHeight: '80vh',
    overflowY: 'auto'
  },
  submittedUrl: {
    padding: '8px',
    backgroundColor: '#ffffff',
    borderRadius: '4px',
    border: '1px solid #d0d7de',
    fontSize: '14px',
    wordBreak: 'break-all'
  },
  repoInfo: { 
    marginTop: '15px' 
  },
  readmeBox: {
    marginTop: '25px',
    padding: '20px',
    backgroundColor: '#ffffff',
    borderRadius: '6px',
    border: '2px solid #28a745',
    maxHeight: '500px',
    overflowY: 'auto'
  },
  readmeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
    gap: '10px'
  },
  viewFullButton: {
    padding: '8px 16px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
    transition: 'background-color 0.2s'
  },
  readmePreview: {
    fontFamily: 'Courier New, monospace',
    fontSize: '13px',
    lineHeight: '1.6',
    color: '#24292e',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    maxHeight: '400px',
    overflowY: 'auto'
  },
  readmeLine: {
    margin: '2px 0'
  },
  readmeMoreHint: {
    marginTop: '10px',
    fontStyle: 'italic',
    color: '#6a737d',
    textAlign: 'center'
  },
  readmeContent: {
    fontFamily: 'Courier New, monospace',
    fontSize: '13px',
    lineHeight: '1.6',
    color: '#24292e',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word'
  },
  emptyState: {
    textAlign: 'center',
    color: '#8b949e',
    marginTop: '20px'
  }
};

export default Home;