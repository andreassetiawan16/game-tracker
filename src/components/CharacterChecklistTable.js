import { useEffect, useState } from 'react';
import { updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const CharacterChecklistTable = ({ game, characters, tasks, onCharacterUpdated, onEditCharacter }) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const isTaskReset = (task, lastUpdated) => {
    const nowTime = now.getTime();
    const lastTime = lastUpdated?.toMillis ? lastUpdated.toMillis() : new Date(lastUpdated).getTime();
    const resetHour = task.resetTime || 0;
    const nowDate = new Date(now);
    nowDate.setHours(resetHour, 0, 0, 0);

    if (task.resetType === 'daily') {
      return nowTime >= nowDate.getTime() && lastTime < nowDate.getTime();
    } else if (task.resetType === 'weekly') {
      const day = now.getDay(); // 0: Sunday
      const resetDate = new Date(now);
      resetDate.setDate(now.getDate() - day + 1); // Monday
      resetDate.setHours(resetHour, 0, 0, 0);
      return nowTime >= resetDate.getTime() && lastTime < resetDate.getTime();
    }
    return false;
  };

  const toggleTask = async (character, taskId) => {
    const newStatus = { ...character.taskStatus };
    newStatus[taskId] = !newStatus[taskId];

    await updateDoc(doc(db, 'characters', character.id), {
      taskStatus: newStatus,
      updatedAt: new Date()
    });

    onCharacterUpdated(prev =>
      prev.map(c => (c.id === character.id ? { ...c, taskStatus: newStatus, updatedAt: new Date() } : c))
    );
  };

  const handleDelete = async (characterId) => {
    await deleteDoc(doc(db, 'characters', characterId));
    onCharacterUpdated(prev => prev.filter(c => c.id !== characterId));
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3>{game.name}</h3>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Character Name</th>
            {tasks.map(task => (
              <th key={task.id}>{task.name}</th>
            ))}
            <th></th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {characters.map(char => (
            <tr key={char.id}>
              <td>{char.name}</td>
              <td>{char.type || ''}</td>
              {tasks.map(task => {
                const shouldReset = isTaskReset(task, char.updatedAt);
                const checked = shouldReset ? false : char.taskStatus?.[task.id] || false;
                return (
                  <td key={task.id}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleTask(char, task.id)}
                    />
                  </td>
                );
              })}
              <td>
                <button onClick={() => onEditCharacter(char)}>Edit</button>
                <button onClick={() => handleDelete(char.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CharacterChecklistTable;
