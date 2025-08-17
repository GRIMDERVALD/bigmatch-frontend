import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import TournamentDashboard from './pages/TournamentDashboard';
import JoinTournament from './pages/JoinTournament';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tournoi/:id" element={<TournamentDashboard />} />
          <Route path="/rejoindre/:shareLink" element={<JoinTournament />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;