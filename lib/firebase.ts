import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyClgK0jIp0wPpeuXXg1806-RhfpBYQ3uWM",
  authDomain: "cactus-bear-5a918.firebaseapp.com",
  projectId: "cactus-bear-5a918",
  storageBucket: "cactus-bear-5a918.firebasestorage.app",
  messagingSenderId: "910060104059",
  appId: "1:910060104059:web:fb2f173e4f5bce223ff5de"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);

export const provider = new GoogleAuthProvider();
// THIS forces Google to always show the account picker:
provider.setCustomParameters({
  prompt: "select_account"
});
