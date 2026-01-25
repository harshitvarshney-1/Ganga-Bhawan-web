import React from 'react';
import './Loader.css';

const Loader = ({ text = 'LOADING', size = 'large' }) => {
  return (
    <div className="loader-overlay">
      <div className="loader-container">
        <div className={`loader-spinner ${size}`}>
          <div className="loader-circle"></div>
          <div className="loader-text">{text}</div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
