import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

const AddTaskModal = ({ games, onClose }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('daily');
  const [resetTime, setResetTime] = useState('');
  const [gameId, setGameId] = useState(games[0]?.id || '');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !resetTime || !gameId) return alert('Please fill all fields');

    await addDoc(collection(db, 'tasks'), {
      name,
      type,
      resetTime,
      gameId,
    });

    onClose();
  };

  return (
    <div style={modalStyle}>
      <h2>Add Task</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Task Name:</label>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div>
          <label>Type:</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="game">Game</option>
          </select>
        </div>

        <div>
          <label>Reset Time:</label>
          <input type="time" value={resetTime} onChange={(e) => setResetTime(e.target.value)} />
        </div>

        <div>
          <label>Game:</label>
          <select value={gameId} onChange={(e) => setGameId(e.target.value)}>
            {games.map((game) => (
              <option key={game.id} value={game.id}>
                {game.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginTop: '12px' }}>
          <button type="submit">Add</button>
          <button onClick={onClose} type="button" style={{ marginLeft: '8px' }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

const modalStyle = {
  position: 'fixed',
  background: 'black',
  border: '1px solid #000',
  padding: '20px',
  top: '30%',
  left: '30%',
  transform: 'translate(-20%, -20%)',
  zIndex: 1000,
};

export default AddTaskModal;
