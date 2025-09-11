// frontend/src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import './App.css';
import Home from './pages/Home/Home';
import Actions from './pages/Actions/Actions';
import ActionsDetail from './pages/Actions/ActionsDetail';
import Education from './pages/Education/Education';
import EducationDetail from './pages/Education/EducationDetail';
import Keywords from './pages/Keywords/Keywords';
import KeywordDetail from './pages/Keywords/KeywordDetail';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import UserProfile from './pages/UserProfile/UserProfile';
import TermsNConditions from './pages/Auth/TermNConditions';
import TeamPage from './pages/Team/TeamPage';
import TeamDetails from './pages/Team/TeamDetail';
import  NotificationsPage from './pages/Notifications/NotificationPages';
import { AuthProvider } from './contexts/AuthContext';
import PageTracker from './components/Layout/PageTracker';
import { NotificationProvider } from './hooks/useNotification';
import LikedPage from './pages/Liked/LikedPage';
import TeamForms from './pages/Form/TeamForms';
import SearchResultPage from './pages/Search/SearchResultPage';
import ProtectedRoute from './components/Layout/ProtectedRoute'; 
import AnalyzePage from './pages/Analyze/AnalyzePage'; 
import CollaborativeForm from './pages/Form/components/CollaborativeForm';
import ForceLoginRoute from './components/Navigation/ForceLoginRoute';
import AboutUs from './pages/AboutUs/AboutUs';
import ScrollToTop from './components/ScrollToTop';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import PasswordResetSuccess from './pages/Auth/PasswordResetSuccess';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <PageTracker />
        <NotificationProvider>
          <Routes>
            <Route path="/" element={<Layout><Home /></Layout>} />

            <Route path="/actions" element={<Layout><Actions /></Layout>} />

            <Route path="/actions/:id" element={
              <ForceLoginRoute>
                <ActionsDetail />
              </ForceLoginRoute>
            } />

            <Route path="/education" element={<Layout><Education /></Layout>} />

            <Route path="/education/:id" element={
              <ForceLoginRoute>
                <EducationDetail />
              </ForceLoginRoute>
            } />

            <Route path="/keywords" element={<Layout><Keywords /></Layout>} />

            <Route path="/keywords/:keyword" element={
              <ForceLoginRoute>
                <KeywordDetail />
              </ForceLoginRoute>
            } />

            <Route path="/about-us" element={<Layout><AboutUs /></Layout>} />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/terms" element={<TermsNConditions />} />
            <Route path="/team" element={<Layout><TeamPage /></Layout>} />
            <Route path="/team/:teamId" element={<TeamDetails />} />
            <Route path="/team/:teamId/forms" element={<TeamForms />} />
            <Route path="/team/:teamId/forms/:formId" element={<CollaborativeForm />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/liked" element={<LikedPage />} />
            
            <Route path="/search" element={<Layout><SearchResultPage /></Layout>} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/password-reset-success" element={<PasswordResetSuccess />} />
            
            <Route 
              path="/analyze" 
              element={
                <Layout>
                  <ProtectedRoute>
                    <AnalyzePage />
                  </ProtectedRoute>
                </Layout>
              } 
            />
            
            
          </Routes>
        </NotificationProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;

