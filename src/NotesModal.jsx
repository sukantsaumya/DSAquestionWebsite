// src/NotesModal.jsx
import React, { useState } from 'react';

const NotesModal = ({ problem, onSave, onClose }) => {
  // Local state to manage the text inside the textarea
  const [noteText, setNoteText] = useState(problem.notes || '');

  const handleSave = () => {
    onSave(problem.id, noteText);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">Notes for: {problem.name}</h3>
        <textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Enter your notes, thoughts, or solution here..."
        />
        <div className="modal-actions">
          <button className="modal-button-secondary" onClick={onClose}>Cancel</button>
          <button className="modal-button-primary" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default NotesModal;
