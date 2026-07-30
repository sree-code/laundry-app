import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, GuestRoute } from './components/ProtectedRoute';
import Layout from './components/Layout';

import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import UserMatches from './pages/UserMatches';
import MatchDetail from './pages/MatchDetail';
import Profile from './pages/Profile';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMatches from './pages/admin/AdminMatches';
import AdminTeams from './pages/admin/AdminTeams';
import AdminGround from './pages/admin/AdminGround';
import AdminUsers from './pages/admin/AdminUsers';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

        <Route path="/dashboard" element={<ProtectedRoute><Layout><UserDashboard /></Layout></ProtectedRoute>} />
        <Route path="/matches" element={<ProtectedRoute><Layout><UserMatches /></Layout></ProtectedRoute>} />
        <Route path="/matches/:id" element={<ProtectedRoute><Layout><MatchDetail /></Layout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />

        <Route path="/admin" element={<ProtectedRoute adminOnly><Layout><AdminDashboard /></Layout></ProtectedRoute>} />
        <Route path="/admin/matches" element={<ProtectedRoute adminOnly><Layout><AdminMatches /></Layout></ProtectedRoute>} />
        <Route path="/admin/teams" element={<ProtectedRoute adminOnly><Layout><AdminTeams /></Layout></ProtectedRoute>} />
        <Route path="/admin/ground" element={<ProtectedRoute adminOnly><Layout><AdminGround /></Layout></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute adminOnly><Layout><AdminUsers /></Layout></ProtectedRoute>} />

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}
