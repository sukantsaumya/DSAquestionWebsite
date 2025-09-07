// src/App.jsx

import { useState, useEffect } from 'react';
import './App.css';
import ProblemItem from './ProblemItem';
import { initialProblems } from './data';

// --- The quotes array is placed outside the component ---
const quotes = [
  "The secret of getting ahead is getting started.",
  "Don't watch the clock; do what it does. Keep going.",
  "The only way to do great work is to love what you do.",
  "Success is the sum of small efforts, repeated day in and day out.",
  "Code is like humor. When you have to explain it, it’s bad.",
  "The best error message is the one that never shows up.",
  "Consistency is the key to mastering algorithms.",
  "A little progress each day adds up to big results."
];

function App() {
  const [problemsByTopic, setProblemsByTopic] = useState(() => {
    try {
      const savedProgress = localStorage.getItem('dsaProgress');
      return savedProgress ? JSON.parse(savedProgress) : initialProblems;
    } catch (error) {
      console.error("Error parsing dsaProgress from localStorage", error);
      return initialProblems;
    }
  });

  const [missionCountInput, setMissionCountInput] = useState('3');
  const [missionCount, setMissionCount] = useState(3);
  const [dailyMissions, setDailyMissions] = useState([]);

  useEffect(() => {
    localStorage.setItem('dsaProgress', JSON.stringify(problemsByTopic));
  }, [problemsByTopic]);

  useEffect(() => {
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

  const allProblems = problemsByTopic.flatMap(topic => topic.problems);
  const stats = {
    untouched: allProblems.filter(p => p.status === 'untouched').length,
    inProgress: allProblems.filter(p => p.status === 'in-progress').length,
    cleared: allProblems.filter(p => p.status === 'cleared').length
  };

  // --- Date and Quote logic is safely placed inside the component ---
  const today = new Date();
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = today.toLocaleDateString("en-US", dateOptions);

  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  const quoteIndex = dayOfYear % quotes.length;
  const dailyQuote = quotes[quoteIndex];

  return (
    <div className="container">
      <div className="header">
        <h1 className="title">DSA Tracker</h1>
        <p className="subtitle">// SEQUENTIAL PROTOCOL ENGAGED</p>

        {/* Date and Quote are displayed here */}
        <p className="date-display">{formattedDate}</p>
        <p className="quote-display">"{dailyQuote}"</p>
      </div>

      <div className="stats-container">
        <div className="stat-item">
          <div className="stat-value">{stats.untouched}</div>
          <div className="stat-label">Untouched</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{stats.inProgress}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{stats.cleared}</div>
          <div className="stat-label">Cleared</div>
        </div>
      </div>

      <form className="mission-form" onSubmit={handleGoalSubmit}>
        <label htmlFor="mission-count">How many questions today?</label>
        <input
          type="number"
          id="mission-count"
          value={missionCountInput}
          onChange={(e) => setMissionCountInput(e.target.value)}
          min="1"
        />
        <button type="submit">Set Goal</button>
      </form>

      {dailyMissions.length > 0 && (
        <div className="daily-mission-container">
          <h2 className="section-title mission-title">Today's Goals</h2>
          {dailyMissions.map(mission => (
            <ProblemItem
              key={mission.id}
              problem={mission}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {problemsByTopic.map(topicSection => (
        <section key={topicSection.topic}>
          <h2 className="section-title">{topicSection.topic}</h2>
          <div className="problem-list">
            {topicSection.problems.map(problem => (
              <ProblemItem
                key={problem.id}
                problem={problem}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export default App;