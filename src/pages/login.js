// pages/login.js
import { useState } from "react";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import nookies from "nookies";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) router.push("/");
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        const token = await userCred.user.getIdToken();
    //   nookies.set(null, "token", token, { path: "/" });
        nookies.set(null, "token", token, {
            path: "/",
            maxAge: 60 * 60 * 24, // 1 hari
        });
        // window.location.href = "/";
        router.push('/');
    } catch (err) {
        alert("Login gagal: " + err.message);
    }
  };

  return (
    <div>
        <form onSubmit={handleLogin}>
            <h1>Login</h1>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            /><br />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            /><br />
            <input type="submit" placeholder="Login" />
        </form>
    </div>
  );
}
