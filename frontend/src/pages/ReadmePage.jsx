import React from 'react';

const ReadmePage = ({ readmeContent, repoName, onBack }) => {
  if (!readmeContent) {
    return (
      <div style={styles.container}>
        <button onClick={onBack} style={styles.backButton}>← Back</button>
        <div style={styles.emptyState}>
          <p>No README content available</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={onBack} style={styles.backButton}>← Back</button>
        <h1>📄 {repoName} - README</h1>
      </div>

      <div style={styles.readmeContainer}>
        <div style={styles.readmeContent}>
          {/* Render markdown as formatted text */}
          {readmeContent.split('\n').map((line, idx) => {
            // Handle headers
            if (line.startsWith('# ')) {
              return <h1 key={idx} style={styles.h1}>{line.substring(2)}</h1>;
            }
            if (line.startsWith('## ')) {
              return <h2 key={idx} style={styles.h2}>{line.substring(3)}</h2>;
            }
            if (line.startsWith('### ')) {
              return <h3 key={idx} style={styles.h3}>{line.substring(4)}</h3>;
            }
            
            // Handle bold and italic
            let formattedLine = line
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/\*(.*?)\*/g, '<em>$1</em>')
              .replace(/`(.*?)`/g, '<code>$1</code>');

            // Handle code blocks
            if (line.startsWith('    ') || line.startsWith('\t')) {
              return (
                <pre key={idx} style={styles.codeBlock}>
                  {line}
                </pre>
              );
            }

            // Handle lists
            if (line.startsWith('- ')) {
              return (
                <li key={idx} style={styles.listItem}>
                  {line.substring(2)}
                </li>
              );
            }

            // Regular paragraphs
            if (line.trim() === '') {
              return <br key={idx} />;
            }

            return (
              <p key={idx} style={styles.paragraph}>
                <span dangerouslySetInnerHTML={{ __html: formattedLine }} />
              </p>
            );
          })}
        </div>
      </div>

      {/* Download button */}
      <div style={styles.footer}>
        <button 
          onClick={() => downloadReadme(readmeContent, repoName)}
          style={styles.downloadButton}
        >
          ⬇️ Download README.md
        </button>
      </div>
    </div>
  );
};

// Helper function to download README
const downloadReadme = (content, repoName) => {
  const element = document.createElement('a');
  const file = new Blob([content], { type: 'text/markdown' });
  element.href = URL.createObjectURL(file);
  element.download = `${repoName}-README.md`;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f6f8fa',
    padding: '20px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '30px',
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  backButton: {
    padding: '10px 20px',
    backgroundColor: '#0366d6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'background-color 0.2s',
  },
  readmeContainer: {
    maxWidth: '900px',
    margin: '0 auto',
    backgroundColor: '#ffffff',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    marginBottom: '30px',
  },
  readmeContent: {
    lineHeight: '1.8',
    color: '#24292e',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
  },
  h1: {
    fontSize: '32px',
    fontWeight: '700',
    marginTop: '24px',
    marginBottom: '16px',
    paddingBottom: '10px',
    borderBottom: '1px solid #e1e4e8',
    color: '#24292e',
  },
  h2: {
    fontSize: '24px',
    fontWeight: '600',
    marginTop: '20px',
    marginBottom: '12px',
    paddingBottom: '8px',
    borderBottom: '1px solid #e1e4e8',
    color: '#24292e',
  },
  h3: {
    fontSize: '18px',
    fontWeight: '600',
    marginTop: '16px',
    marginBottom: '10px',
    color: '#24292e',
  },
  paragraph: {
    marginBottom: '12px',
    color: '#24292e',
  },
  listItem: {
    marginLeft: '20px',
    marginBottom: '8px',
    color: '#24292e',
  },
  codeBlock: {
    backgroundColor: '#f6f8fa',
    border: '1px solid #e1e4e8',
    borderRadius: '6px',
    padding: '16px',
    overflow: 'auto',
    marginBottom: '12px',
    fontSize: '13px',
    fontFamily: 'Courier New, monospace',
    color: '#24292e',
  },
  footer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
  },
  downloadButton: {
    padding: '12px 24px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'background-color 0.2s',
  },
  emptyState: {
    textAlign: 'center',
    color: '#8b949e',
    padding: '40px',
  },
};

export default ReadmePage;
