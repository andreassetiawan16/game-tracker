// lib/checkAuth.js
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "firebase";

const auth = getAuth(app);

export const checkAuthState = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      if (user) resolve(user);
      else reject("No user");
    }, reject);
  });
};
