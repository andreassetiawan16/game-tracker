// pages/index.js
import nookies from "nookies";
import { useRouter } from "next/router";
import { useEffect } from "react";
import admin from "@/lib/firebaseAdmin";

export default function Home({name}) {

  const router = useRouter();

  const handleLogout = () => {
    // Hapus cookie token
    nookies.destroy(null, "token");
    // Redirect ke halaman login
    router.push("/login");
  };

  return (
      <div>
        <h1>Welcome to Game Tracker! {name || 'Guest'}</h1>
        <p><button onClick={handleLogout}>Logout</button></p>
      </div>
    );
}

// Server-side auth check
export async function getServerSideProps(context) {
  try {

    const cookies = nookies.get(context);

    if (!cookies.token) {
      throw new Error("No token found in cookies");
    }

    const token = await admin.auth().verifyIdToken(cookies.token);
    const userRecord = await admin.auth().getUser(token.uid);

    return {
      props: {
        name: userRecord.displayName || "Kiyoma"
      },
    };
  } catch (err) {
    console.error('Auth error on index:', err);
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
}
