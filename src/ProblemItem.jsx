// src/ProblemItem.jsx

import React from 'react';

const ProblemItem = ({ problem, onStatusChange }) => {
  // Destructure all needed properties from the problem object
  const { id, name, difficulty, status, link } = problem;

  // This function prevents the status from changing when you click the link icon
  const handleLinkClick = (e) => {
    e.stopPropagation();
  };

  return (
    // This is the main container with the ".problem-item" class for the box style
    <div className="problem-item" data-status={status} onClick={() => onStatusChange(id)}>

      {/* This div uses flexbox to align everything horizontally */}
      <div className="problem-content">

        {/* This div is the status indicator on the left */}
        <div className="status-indicator"></div>

        {/* This div holds the problem name */}
        <div className="problem-title">{name}</div>

        {/* This div groups the difficulty and number on the right */}
        <div className="problem-meta">
          <span className={`difficulty-badge difficulty-${difficulty.toLowerCase()}`}>
            {difficulty}
          </span>
          <span className="problem-number">#{id.toString().padStart(3, '0')}</span>
        </div>

        {/* This is the clickable link icon that appears if a link exists */}
        {link && (
          <a
            href={link}
            className="problem-link"
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleLinkClick}
            aria-label={`Practice ${name}`}
          >
            &#x2197;
          </a>
        )}
      </div>
    </div>
  );
};

export default ProblemItem;