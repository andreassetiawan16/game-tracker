// pages/add-character.js
import { useState } from "react";
import { useRouter } from "next/router";
import { getAuth } from "firebase/auth";
import { db } from "@/lib/firebase"; // pastikan path ke config firebase benar
import { collection, addDoc } from "firebase/firestore";

export default function AddCharacterPage() {
  const [name, setName] = useState("");
  const [isMain, setIsMain] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = getAuth().currentUser;

    if (!user) {
      alert("User tidak login.");
      return;
    }

    try {
      await addDoc(collection(db, "users", user.uid, "characters"), {
        name,
        isMain,
      });
      alert("Karakter berhasil ditambahkan!");
      router.push("/"); // arahkan ke halaman lain jika perlu
    } catch (err) {
      console.error("Gagal menambahkan karakter:", err);
      alert("Gagal menambahkan karakter.");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl mb-4">Tambah Karakter</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Nama karakter"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="border p-2 rounded"
        />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isMain}
            onChange={(e) => setIsMain(e.target.checked)}
          />
          Karakter utama (Main)
        </label>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Simpan
        </button>
      </form>
    </div>
  );
}
