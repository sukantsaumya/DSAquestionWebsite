// src/ProblemItem.jsx
import React from 'react';

const ProblemItem = ({ problem, onStatusChange, onOpenNotes }) => {
  const { id, name, difficulty, status, link, notes } = problem;

  const handleLinkClick = (e) => {
    e.stopPropagation();
  };

  // --- NEW: This function handles the notes button click ---
  const handleNotesClick = (e) => {
    e.stopPropagation(); // Prevents the status from changing
    onOpenNotes(problem); // Tells the App component to open the modal
  };

  return (
    <div className="problem-item" data-status={status} onClick={() => onStatusChange(id)}>
      <div className="problem-content">
        <div className="status-indicator"></div>
        <div className="problem-title">{name}</div>
        <div className="problem-meta">
          <span className={`difficulty-badge difficulty-${difficulty.toLowerCase()}`}>
            {difficulty}
          </span>
          <span className="problem-number">#{id.toString().padStart(3, '0')}</span>
        </div>
        
        {/* --- NEW: Notes button/icon --- */}
        <button className="notes-button" onClick={handleNotesClick} aria-label="Open Notes">
          📝
        </button>

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
