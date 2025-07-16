import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  doc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import AddTaskModal from '@/components/AddTaskModal';

const TaskList = () => {
  const [games, setGames] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchGames = async () => {
      const gameSnapshot = await getDocs(collection(db, 'games'));
      const gameList = gameSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setGames(gameList);
    };

    const fetchTasks = async () => {
      const taskSnapshot = await getDocs(collection(db, 'tasks'));
      const taskList = taskSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTasks(taskList);
    };

    fetchGames();
    fetchTasks();
  }, [showModal]);

  const handleDelete = async (taskId) => {
    await deleteDoc(doc(db, 'tasks', taskId));
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const groupedTasks = games.map((game) => ({
    game,
    tasks: tasks.filter((task) => task.gameId === game.id),
  }));

  return (
    <div>
      <h1>Task List</h1>
      <button onClick={() => setShowModal(true)}>+ Add Task</button>

      {groupedTasks.map(({ game, tasks }) => (
        <div key={game.id} style={{ marginTop: '24px' }}>
          <h2>{game.name}</h2>
          <table border="1" cellPadding="8">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Reset Time</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td>{task.name}</td>
                  <td>{task.type}</td>
                  <td>{task.resetTime}</td>
                  <td>
                    <button onClick={() => handleDelete(task.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {tasks.length === 0 && (
                <tr>
                  <td colSpan={4}>No task yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ))}

      {showModal && (
        <AddTaskModal games={games} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
};

export default TaskList;
