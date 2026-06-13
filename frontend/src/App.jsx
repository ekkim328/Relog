import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import LogDetailPage from './pages/LogDetailPage'
import LogFormPage from './pages/LogFormPage'
import RelationshipDetailPage from './pages/RelationshipDetailPage'
import RelationshipFormPage from './pages/RelationshipFormPage'
import RelationshipsPage from './pages/RelationshipsPage'
import StatsPage from './pages/StatsPage'
import TimelinePage from './pages/TimelinePage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/relationship-dashboard" replace />} />
        <Route path="/relationship-dashboard" element={<DashboardPage />} />
        <Route path="/relationships" element={<RelationshipsPage />} />
        <Route path="/relationships/new" element={<RelationshipFormPage />} />
        <Route path="/relationships/:relationshipId/edit" element={<RelationshipFormPage />} />
        <Route path="/relationships/:relationshipId" element={<RelationshipDetailPage />} />
        <Route path="/relationships/:relationshipId/logs/new" element={<LogFormPage />} />
        <Route path="/relationships/:relationshipId/timeline" element={<TimelinePage />} />
        <Route path="/relationships/:relationshipId/stats" element={<StatsPage />} />
        <Route path="/logs/:logId" element={<LogDetailPage />} />
        <Route path="/logs/:logId/edit" element={<LogFormPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

