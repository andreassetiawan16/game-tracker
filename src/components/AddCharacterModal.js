import { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const AddCharacterModal = ({ isOpen, onClose, games, onCharacterAdded, tasks }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('main');
  const [gameId, setGameId] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const taskStatus = {};

    tasks
      .filter(task => task.gameId === gameId)
      .forEach(task => {
        taskStatus[task.id] = false;
      });

    const newChar = {
      name,
      gameId,
      type,
      taskStatus,
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'characters'), newChar);
    onCharacterAdded({ id: docRef.id, ...newChar });
    onClose();
    setName('');
    setGameId('');
  };

  if (!isOpen) return null;

  return (
    <div style={{ background: '#000000aa', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      <div style={{ background: 'white', padding: '1rem', maxWidth: 400, margin: '10% auto' }}>
        <h2>Add Character</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Character Name:</label>
            <input value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div>
            <label>Type:</label>
            <select value={type} onChange={(e) => setType(e.target.value)} required>
              <option value="main">Main</option>
              <option value="sub">Sub</option>
            </select>
          </div>
          <div>
            <label>Game:</label>
            <select value={gameId} onChange={e => setGameId(e.target.value)} required>
              <option value="">Select Game</option>
              {games.map(game => (
                <option key={game.id} value={game.id}>{game.name}</option>
              ))}
            </select>
          </div>
          <button type="submit">Add</button>
          <button type="button" onClick={onClose} style={{ marginLeft: '1rem' }}>Cancel</button>
        </form>
      </div>
    </div>
  );
};

export default AddCharacterModal;
