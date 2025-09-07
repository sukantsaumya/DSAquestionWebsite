// src/App.jsx

import { useState, useEffect } from 'react';
import './App.css';
import ProblemItem from './ProblemItem';
import { initialProblems } from './data';
// --- NEW: Import Firebase auth and db services ---
import { auth, db } from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

function App() {
  // --- NEW: State to track the current user ---
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [problemsByTopic, setProblemsByTopic] = useState(initialProblems); // Default state
  const [missionCountInput, setMissionCountInput] = useState('3');
  const [missionCount, setMissionCount] = useState(3);
  const [dailyMissions, setDailyMissions] = useState([]);

  // --- NEW: This hook listens for login/logout state changes ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // User is logged in, now load their progress from Firestore
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          // If they have saved progress, load it
          setProblemsByTopic(userDocSnap.data().progress);
        } else {
          // New user, set initial progress
          setProblemsByTopic(initialProblems);
        }
      } else {
        setUser(null);
        // User is logged out, revert to local storage or initial state
        const savedProgress = localStorage.getItem('dsaProgress');
        setProblemsByTopic(savedProgress ? JSON.parse(savedProgress) : initialProblems);
      }
    });
    return () => unsubscribe(); // Cleanup listener on component unmount
  }, []);

  // This hook now saves progress to Firestore (if logged in) or localStorage (if not)
  useEffect(() => {
    if (user) {
      // If user is logged in, save to their Firestore document
      const userDocRef = doc(db, "users", user.uid);
      setDoc(userDocRef, { progress: problemsByTopic });
    } else {
      // If no user, save to localStorage
      localStorage.setItem('dsaProgress', JSON.stringify(problemsByTopic));
    }
  }, [problemsByTopic, user]);

  useEffect(() => {
    // Daily mission logic remains the same
    const allProblems = problemsByTopic.flatMap(topic => topic.problems);
    const firstUnfinishedIndex = allProblems.findIndex(p => p.status !== 'cleared');
    let nextMissions = [];
    if (firstUnfinishedIndex !== -1) {
      const unfinishedProblems = allProblems.slice(firstUnfinishedIndex);
      nextMissions = unfinishedProblems.slice(0, missionCount);
    }
    setDailyMissions(nextMissions);
  }, [problemsByTopic, missionCount]);

  // --- NEW: Authentication Functions ---
  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogIn = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogOut = async () => {
    await signOut(auth);
  };

  // The rest of the logic remains the same
  const handleStatusChange = (id) => { /* ... existing code ... */ };
  const handleGoalSubmit = (e) => { /* ... existing code ... */ };
  const allProblems = problemsByTopic.flatMap(topic => topic.problems);
  const stats = { /* ... existing code ... */ };

  // --- NEW: If no user, show a login/signup form ---
  if (!user) {
    return (
      <div className="container">
        <div className="auth-container">
          <h1 className="title">DSA Tracker</h1>
          <form onSubmit={handleLogIn}>
            <h2>Log In</h2>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
            <button type="submit">Log In</button>
          </form>
          <form onSubmit={handleSignUp}>
            <h2>Sign Up</h2>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
            <button type="submit">Sign Up</button>
          </form>
          {error && <p className="auth-error">{error}</p>}
        </div>
      </div>
    );
  }

  // If user is logged in, show the main app
  return (
    <div className="container">
      <div className="header">
        <h1 className="title">DSA Tracker</h1>
        <div className="header-controls">
          <p>{user.email}</p>
          <button onClick={handleLogOut} className="logout-button">Log Out</button>
        </div>
      </div>

      {/* ... Rest of your existing tracker UI ... */}

    </div>
  );
}

export default App;