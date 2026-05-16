import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/Layout/AppLayout';
import { AdminRoute } from './components/ProtectedRoute/AdminRoute';
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute';
import { AdminPage } from './pages/Admin/AdminPage';
import { FeedbackPage } from './pages/Feedback/FeedbackPage';
import { HomePage } from './pages/Home/HomePage';
import { LoginPage } from './pages/Login/LoginPage';
import { MatchesPage } from './pages/Matches/MatchesPage';
import { PlayersPage } from './pages/Players/PlayersPage';
import { RegisterPage } from './pages/Register/RegisterPage';
import { WatchlistPage } from './pages/Watchlist/WatchlistPage';
import './App.css';

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/players" element={<PlayersPage />} />
          <Route path="/watchlist" element={<WatchlistPage />} />
          <Route path="/matches" element={<MatchesPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />

          {/* Admin-only routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}

export default App;
