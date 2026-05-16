import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/Layout/AppLayout';
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute';
import { FeedbackPage } from './pages/Feedback/FeedbackPage';
import { LoginPage } from './pages/Login/LoginPage';
import { MatchesPage } from './pages/Matches/MatchesPage';
import { PlayersPage } from './pages/Players/PlayersPage';
import { RegisterPage } from './pages/Register/RegisterPage';
import { WatchlistPage } from './pages/Watchlist/WatchlistPage';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/players" element={<PlayersPage />} />
          <Route path="/watchlist" element={<WatchlistPage />} />
          <Route path="/matches" element={<MatchesPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/players" replace />} />
    </Routes>
  );
}

export default App;
