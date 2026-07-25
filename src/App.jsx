import { Routes, Route, NavLink } from 'react-router-dom';
import Home from './pages/Home';
import Members from './pages/Members';
import Weekend from './pages/Weekend';
import Teams from './pages/Teams';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="brand">
            <span className="brand-icon">🏏</span>
            <div>
              <h1>Weekend Cricket</h1>
              <p>Team manager for your weekend matches</p>
            </div>
          </div>
          <nav className="nav">
            <NavLink to="/" end>Home</NavLink>
            <NavLink to="/members">Members</NavLink>
            <NavLink to="/weekend">This Weekend</NavLink>
            <NavLink to="/teams">Teams</NavLink>
          </nav>
        </div>
      </header>
      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/members" element={<Members />} />
          <Route path="/weekend" element={<Weekend />} />
          <Route path="/teams" element={<Teams />} />
        </Routes>
      </main>
      <footer className="footer">
        Share this link with your group — everyone can add their details each weekend.
      </footer>
    </div>
  );
}

export default App;
