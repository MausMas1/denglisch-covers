import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import Landing from './pages/Landing';
import Display from './pages/Display';
import Admin from './pages/Admin';
import Play from './pages/Play';
import AccessGate from './components/AccessGate';

function App() {
  return (
    <GameProvider>
      <Router basename={import.meta.env.BASE_URL}>
        <Routes>
          {/* Landing requires general access code */}
          <Route path="/" element={
            <AccessGate>
              <Landing />
            </AccessGate>
          } />
          {/* Display requires general access code */}
          <Route path="/display" element={
            <AccessGate>
              <Display />
            </AccessGate>
          } />
          {/* Admin requires admin PIN */}
          <Route path="/admin" element={
            <AccessGate requireAdmin={true}>
              <Admin />
            </AccessGate>
          } />
          {/* Play requires general access code */}
          <Route path="/play" element={
            <AccessGate>
              <Play />
            </AccessGate>
          } />
        </Routes>
      </Router>
    </GameProvider>
  );
}

export default App;
