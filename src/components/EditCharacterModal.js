// components/EditCharacterModal.js
import React, { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function EditCharacterModal({ open, onClose, character, onCharacterUpdated }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('main');

  useEffect(() => {
    if (character){
      setName(character.name || '');
      setType(character.type || 'main');
    };
  }, [character]);

  const handleSave = async () => {
    if (!name || !character) return;

    const charRef = doc(db, 'characters', character.id);
    await updateDoc(charRef, {
      name: name.trim(),
      type: type,
    });

    if (onCharacterUpdated) onCharacterUpdated();
    onClose();
  };

  if (!open) return null;

  return (
    <div style={{ background: '#000000aa', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
        <div style={{ background: 'white', padding: '1rem', maxWidth: 400, margin: '10% auto' }}>
            <div className="modal">
                <h2>Edit Character</h2>
                <div style={{ marginBottom: '1rem' }}>
                  <label>Name:</label><br />
                  <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Character Name"
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label>Type:</label><br />
                    <select value={type} onChange={(e) => setType(e.target.value)} required>
                      <option value="main">Main</option>
                      <option value="sub">Sub</option>
                    </select>
                </div>
                <button onClick={handleSave}>Save</button>
                <button onClick={onClose}>Cancel</button>
            </div>
        </div>
    </div>
  );
}
