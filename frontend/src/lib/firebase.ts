import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Replace these values with your actual Firebase Client Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCVBVQXrcei_aAxPMdfVzJeJI66Bh2e7qM",
  authDomain: "deskguard-19893.firebaseapp.com",
  projectId: "deskguard-19893",
  storageBucket: "deskguard-19893.firebasestorage.app",
  messagingSenderId: "328107954952",
  appId: "1:328107954952:web:0b1ac76b22556ea8e592bd",
  measurementId: "G-L918689JD7"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
