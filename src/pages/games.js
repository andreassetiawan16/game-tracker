import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp
} from "firebase/firestore";

export default function GameListPage() {
  const [games, setGames] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [newGame, setNewGame] = useState("");

  const fetchData = async () => {
    const gamesSnapshot = await getDocs(collection(db, "games"));
    const charsSnapshot = await getDocs(collection(db, "characters"));

    const gamesData = gamesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const charsData = charsSnapshot.docs.map(doc => {
      const tasks = doc.data().tasks || [];
      return {
        id: doc.id,
        name: doc.data().name,
        tasks
      };
    });

    setGames(gamesData);
    setCharacters(charsData);
  };

  const countCharactersForGame = (gameId) => {
    return characters.filter(char =>
      char.tasks.some(task => task.type === "game" && task.gameId === gameId)
    ).length;
  };

  const addGame = async () => {
    if (!newGame.trim()) return;
    await addDoc(collection(db, "games"), {
      name: newGame.trim(),
      createdAt: serverTimestamp()
    });
    setNewGame("");
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>🎮 Game Tracker</h2>
      <div style={{ marginBottom: "20px" }}>
        <input
          value={newGame}
          onChange={(e) => setNewGame(e.target.value)}
          placeholder="Add new game"
          style={{ marginRight: "10px" }}
        />
        <button onClick={addGame}>Add Game</button>
      </div>

      <table border="1" cellPadding="10" cellSpacing="0">
        <thead>
          <tr>
            <th>No</th>
            <th>Nama Game</th>
            <th>Jumlah Karakter Terkait</th>
          </tr>
        </thead>
        <tbody>
          {games.map((game, index) => (
            <tr key={game.id}>
              <td>{index + 1}</td>
              <td>{game.name}</td>
              <td>{countCharactersForGame(game.id)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
