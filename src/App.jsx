import { useState, useEffect, useMemo } from 'react';
import './App.css';
import ProblemItem from './ProblemItem';
import NotesModal from './NotesModal';
import { initialProblems } from './data';
import { auth, db } from './firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [problemsByTopic, setProblemsByTopic] = useState(initialProblems);
  const [missionCountInput, setMissionCountInput] = useState('3');
  const [missionCount, setMissionCount] = useState(3);
  const [dailyMissions, setDailyMissions] = useState([]);
  const [editingProblem, setEditingProblem] = useState(null);

  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const progressData = userDocSnap.data()?.progress;
          if (Array.isArray(progressData)) {
            setProblemsByTopic(progressData);
          } else {
            await setDoc(userDocRef, { progress: initialProblems });
            setProblemsByTopic(initialProblems);
          }
        } else {
          await setDoc(userDocRef, { progress: initialProblems });
          setProblemsByTopic(initialProblems);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !Array.isArray(problemsByTopic) || loading) return;
    const userDocRef = doc(db, "users", user.uid);
    setDoc(userDocRef, { progress: problemsByTopic });
  }, [problemsByTopic, user, loading]);

  useEffect(() => {
    if (!Array.isArray(problemsByTopic)) return;
    const allProblems = problemsByTopic.flatMap(topic => topic.problems);
    const firstUnfinishedIndex = allProblems.findIndex(p => p.status !== 'cleared');
    let nextMissions = [];
    if (firstUnfinishedIndex !== -1) {
      const unfinishedProblems = allProblems.slice(firstUnfinishedIndex);
      nextMissions = unfinishedProblems.slice(0, missionCount);
    }
    setDailyMissions(nextMissions);
  }, [problemsByTopic, missionCount]);

  const handleStatusChange = (id) => {
    const newProblemsByTopic = problemsByTopic.map(topicSection => {
      const newProblems = topicSection.problems.map(problem => {
        if (problem.id === id) {
          const statuses = ['untouched', 'in-progress', 'cleared'];
          const currentIndex = statuses.indexOf(problem.status);
          const nextIndex = (currentIndex + 1) % statuses.length;
          return { ...problem, status: statuses[nextIndex] };
        }
        return problem;
      });
      return { ...topicSection, problems: newProblems };
    });
    setProblemsByTopic(newProblemsByTopic);
  };

  const handleGoalSubmit = (e) => {
    e.preventDefault();
    const count = parseInt(missionCountInput, 10);
    if (count > 0) {
      setMissionCount(count);
    }
  };

  const handleSignUp = async (e) => { e.preventDefault(); setError(''); try { await createUserWithEmailAndPassword(auth, email, password); } catch (err) { setError(err.message); } };
  const handleLogIn = async (e) => { e.preventDefault(); setError(''); try { await signInWithEmailAndPassword(auth, email, password); } catch (err) { setError(err.message); } };
  const handleLogOut = async () => { await signOut(auth); };

  const signInWithGoogle = async () => {
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      setError(err.message);
    }
  };

  const signInWithGitHub = async () => {
    setError('');
    try {
      const provider = new GithubAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      setError(err.message);
    }
  };

  const openNotesModal = (problem) => { setEditingProblem(problem); };
  const closeNotesModal = () => { setEditingProblem(null); };
  const handleSaveNote = (problemId, newNoteText) => {
    const newProblemsByTopic = problemsByTopic.map(topicSection => {
      const newProblems = topicSection.problems.map(problem => {
        if (problem.id === problemId) {
          return { ...problem, notes: newNoteText };
        }
        return problem;
      });
      return { ...topicSection, problems: newProblems };
    });
    setProblemsByTopic(newProblemsByTopic);
  };

  const filteredProblemsByTopic = useMemo(() => {
    if (!Array.isArray(problemsByTopic)) return [];
    return problemsByTopic.map(topicSection => {
      const filteredProblems = topicSection.problems.filter(problem => {
        if (difficultyFilter !== 'All' && problem.difficulty !== difficultyFilter) {
          return false;
        }
        if (statusFilter !== 'All' && problem.status !== statusFilter) {
          return false;
        }
        if (searchTerm && !problem.name.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }
        return true;
      });
      return { ...topicSection, problems: filteredProblems };
    }).filter(topicSection => topicSection.problems.length > 0);
  }, [problemsByTopic, searchTerm, difficultyFilter, statusFilter]);

  const allProblems = Array.isArray(problemsByTopic) ? problemsByTopic.flatMap(topic => topic.problems) : [];
  const stats = {
    untouched: allProblems.filter(p => p.status === 'untouched').length,
    inProgress: allProblems.filter(p => p.status === 'in-progress').length,
    cleared: allProblems.filter(p => p.status === 'cleared').length
  };

  if (loading) {
    return <div className="container loading-screen"></div>;
  }

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
          <div className="social-login-divider"><span>OR</span></div>
          <button className="social-button google" onClick={signInWithGoogle}>Sign In with Google</button>
          <button className="social-button github" onClick={signInWithGitHub}>Sign In with GitHub</button>
          {error && <p className="auth-error">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1 className="title">DSA Tracker</h1>
        <div className="header-controls">
          <p className="user-email">{user.email}</p>
          <button onClick={handleLogOut} className="logout-button">Log Out</button>
        </div>
      </div>

      <div className="stats-container">
        <div className="stat-item"><div className="stat-value">{stats.untouched}</div><div className="stat-label">Untouched</div></div>
        <div className="stat-item"><div className="stat-value">{stats.inProgress}</div><div className="stat-label">In Progress</div></div>
        <div className="stat-item"><div className="stat-value">{stats.cleared}</div><div className="stat-label">Cleared</div></div>
      </div>

      <form className="mission-form" onSubmit={handleGoalSubmit}>
        <label htmlFor="mission-count">How many questions today?</label>
        <input type="number" id="mission-count" value={missionCountInput} onChange={(e) => setMissionCountInput(e.target.value)} min="1"/>
        <button type="submit">Set Goal</button>
      </form>
      
      <div className="filter-container">
        <input
          type="text"
          placeholder="Search problems..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="select-group">
          <label htmlFor="difficulty-filter">Difficulty:</label>
          <select id="difficulty-filter" value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value)}>
            <option value="All">All</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
        <div className="select-group">
          <label htmlFor="status-filter">Status:</label>
          <select id="status-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All</option>
            <option value="untouched">Untouched</option>
            <option value="in-progress">In Progress</option>
            <option value="cleared">Cleared</option>
          </select>
        </div>
      </div>

      {dailyMissions.length > 0 && (
        <div className="daily-mission-container">
          <h2 className="section-title mission-title">Today's Goals</h2>
          {dailyMissions.map(mission => (
            <ProblemItem key={mission.id} problem={mission} onStatusChange={handleStatusChange} onOpenNotes={openNotesModal} />
          ))}
        </div>
      )}

      {filteredProblemsByTopic.map(topicSection => (
        <section key={topicSection.topic}>
          <h2 className="section-title">{topicSection.topic}</h2>
          <div className="problem-list">
            {topicSection.problems.map(problem => (
              <ProblemItem key={problem.id} problem={problem} onStatusChange={handleStatusChange} onOpenNotes={openNotesModal} />
            ))}
          </div>
        </section>
      ))}

      {editingProblem && (
        <NotesModal problem={editingProblem} onSave={handleSaveNote} onClose={closeNotesModal} />
      )}
    </div>
  );
}

export default App;
