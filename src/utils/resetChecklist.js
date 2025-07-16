import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  updateDoc,
  doc,
} from 'firebase/firestore';

/**
 * Reset checklist karakter (daily & weekly) berdasarkan waktu reset dari task.
 * Disarankan dipanggil sekali saat halaman checklist dibuka.
 */
export const checkAndResetCharacterChecklist = async () => {
  try {

    // Konversi waktu sekarang ke WIB (UTC+7)
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const wib = new Date(utc + 7 * 60 * 60 * 1000); // GMT+7

    const todayStr = wib.toDateString();
    const nowMinutes = wib.getHours() * 60 + wib.getMinutes();
    const currentWeek = getWeekNumber(wib);

    // Ambil semua task & karakter
    const taskSnap = await getDocs(collection(db, 'tasks'));
    const tasks = taskSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const charSnap = await getDocs(collection(db, 'characters'));

    for (const charDoc of charSnap.docs) {
      const char = charDoc.data();
      const taskStatus = { ...char.taskStatus };

      const lastResetDaily = char.lastResetDaily?.toDate?.() || new Date(0);
      const lastResetWeekly = char.lastResetWeekly?.toDate?.() || new Date(0);

      const lastDailyStr = lastResetDaily.toDateString();
      const lastWeeklyWeek = getWeekNumber(lastResetWeekly);

      let changed = false;
      let resetDailyOccurred = false;
      let resetWeeklyOccurred = false;

      for (const task of tasks.filter(t => t.gameId === char.gameId)) {
        const status = taskStatus?.[task.id];
        if (status === undefined) continue;

        const type = task.type?.toLowerCase?.();
        const [h, m] = (task.resetTime || '04:00').split(':').map(Number);
        const resetMinutes = h * 60 + m;

        let shouldReset = false;

        if (type === 'daily') {
          shouldReset = (
            nowMinutes >= resetMinutes &&
            todayStr !== lastDailyStr
          );
        }

        if (type === 'weekly') {
          shouldReset = (
            nowMinutes >= resetMinutes &&
            currentWeek !== lastWeeklyWeek
          );
        }

        if (shouldReset && status !== false) {
          taskStatus[task.id] = false;
          changed = true;

          if (type === 'daily') resetDailyOccurred = true;
          if (type === 'weekly') resetWeeklyOccurred = true;

        }
      }

      if (changed) {
        const updateData = {
          taskStatus,
        };
        if (resetDailyOccurred) updateData.lastResetDaily = wib;
        if (resetWeeklyOccurred) updateData.lastResetWeekly = wib;

        await updateDoc(doc(db, 'characters', charDoc.id), updateData);
      }
    }

  } catch (err) {
    console.error('❌ Error saat reset otomatis:', err);
  }

};

// Fungsi bantu: ambil nomor minggu dari sebuah tanggal
const getWeekNumber = (date) => {
  const tempDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = tempDate.getUTCDay() || 7;
  tempDate.setUTCDate(tempDate.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tempDate.getUTCFullYear(), 0, 1));
  return Math.ceil((((tempDate - yearStart) / 86400000) + 1) / 7);
};
