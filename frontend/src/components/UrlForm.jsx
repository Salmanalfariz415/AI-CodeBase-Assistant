import React, { useState } from 'react';

const UrlForm = ({ onSubmit }) => {
  const [url, setUrl] = useState('');

  const handleInputChange = (e) => {
    setUrl(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <input
        type="text"
        placeholder="https://github.com/username/repo"
        value={url}
        onChange={handleInputChange}
        style={styles.input}
      />
      <button type="submit" style={styles.button}>
        Submit URL
      </button>
    </form>
  );
};

const styles = {
  form: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '10px', 
    width: '100%' 
  },
  input: { 
    padding: '12px', 
    fontSize: '16px', 
    borderRadius: '6px', 
    border: '1px solid #d9d9d9', 
    outline: 'none' 
  },
  button: { 
    padding: '12px', 
    backgroundColor: '#24292e', 
    color: 'white', 
    border: 'none', 
    borderRadius: '6px', 
    cursor: 'pointer' 
  }
};

export default UrlForm;