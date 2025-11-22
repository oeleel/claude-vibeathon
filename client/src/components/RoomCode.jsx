import React, { useState } from 'react';
import styles from '../styles/RoomCode.module.css';

function RoomCode({ code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.container}>
      <div className={styles.label}>Room Code</div>
      <div className={styles.codeDisplay}>
        <span className={styles.code}>{code}</span>
        <button 
          className={styles.copyButton}
          onClick={handleCopy}
          title="Copy room code"
        >
          {copied ? '✓' : '📋'}
        </button>
      </div>
      {copied && <div className={styles.copiedMessage}>Copied!</div>}
    </div>
  );
}

export default RoomCode;

