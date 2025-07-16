import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import CharacterChecklistTable from '@/components/CharacterChecklistTable';
import AddCharacterModal from '@/components/AddCharacterModal';
import EditCharacterModal from '@/components/EditCharacterModal';

import { checkAndResetCharacterChecklist } from '@/utils/resetChecklist';

const UserListPage = () => {
  const [games, setGames] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editCharacter, setEditCharacter] = useState(null); // <--- ini
  const [showEditModal, setShowEditModal] = useState(false); // <--- ini

  const fetchData = async () => {
    const gamesSnapshot = await getDocs(collection(db, 'games'));
    const gamesData = gamesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setGames(gamesData);

    const charactersSnapshot = await getDocs(collection(db, 'characters'));
    const charactersData = charactersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setCharacters(charactersData);

    const tasksSnapshot = await getDocs(collection(db, 'tasks'));
    const tasksData = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setTasks(tasksData);
  };

  useEffect(() => {
    (async () => {
      await checkAndResetCharacterChecklist();
      await fetchData();
    })();
  }, []);

  const handleCharacterAdded = (newCharacter) => {
    setCharacters(prev => [...prev, newCharacter]);
  };

  const handleEditCharacter = (character) => {
    setEditCharacter(character);
    setShowEditModal(true);
  };

  const refreshCharacters = async () => {
    const snapshot = await getDocs(collection(db, 'characters'));
    const charactersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setCharacters(charactersData);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>User List (Characters)</h1>
      <button onClick={() => setShowModal(true)}>Add Character</button>
      {games.map(game => {
        const gameCharacters = characters.filter(char => char.gameId === game.id);
        return (
          <CharacterChecklistTable
            key={game.id}
            game={game}
            characters={gameCharacters}
            tasks={tasks.filter(task => task.gameId === game.id)}
            onCharacterUpdated={setCharacters}
            onEditCharacter={handleEditCharacter}
          />
        );
      })}

      <AddCharacterModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        games={games}
        onCharacterAdded={handleCharacterAdded}
        tasks={tasks}
      />

      <EditCharacterModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        character={editCharacter}
        onCharacterUpdated={refreshCharacters}
      />
    </div>
  );
};

export default UserListPage;
