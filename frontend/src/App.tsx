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
import DataManagement from './pages/DataManagement/DataManagement';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import PasswordResetSuccess from './pages/Auth/PasswordResetSuccess';
import Goal1 from './pages/SDGTargets/Goal1';
import Goal2 from './pages/SDGTargets/Goal2';
import Goal3 from './pages/SDGTargets/Goal3';
import Goal4 from './pages/SDGTargets/Goal4';
import Goal5 from './pages/SDGTargets/Goal5';
import Goal6 from './pages/SDGTargets/Goal6';
import Goal7 from './pages/SDGTargets/Goal7';
import Goal8 from './pages/SDGTargets/Goal8';
import Goal9 from './pages/SDGTargets/Goal9';
import Goal10 from './pages/SDGTargets/Goal10';
import Goal11 from './pages/SDGTargets/Goal11';
import Goal12 from './pages/SDGTargets/Goal12';
import Goal13 from './pages/SDGTargets/Goal13';
import Goal14 from './pages/SDGTargets/Goal14';
import Goal15 from './pages/SDGTargets/Goal15';
import Goal16 from './pages/SDGTargets/Goal16';
import Goal17 from './pages/SDGTargets/Goal17';


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
            <Route path="/data-management" element={<DataManagement />} />
            
            <Route path="/search" element={<Layout><SearchResultPage /></Layout>} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/password-reset-success" element={<PasswordResetSuccess />} />
            
            {/* SDG Targets */}
            <Route path="/sdg-targets/goal-1" element={<Layout><Goal1 /></Layout>} />
            <Route path="/sdg-targets/goal-2" element={<Layout><Goal2 /></Layout>} />
            <Route path="/sdg-targets/goal-3" element={<Layout><Goal3 /></Layout>} />
            <Route path="/sdg-targets/goal-4" element={<Layout><Goal4 /></Layout>} />
            <Route path="/sdg-targets/goal-5" element={<Layout><Goal5 /></Layout>} />
            <Route path="/sdg-targets/goal-6" element={<Layout><Goal6 /></Layout>} />
            <Route path="/sdg-targets/goal-7" element={<Layout><Goal7 /></Layout>} />
            <Route path="/sdg-targets/goal-8" element={<Layout><Goal8 /></Layout>} />
            <Route path="/sdg-targets/goal-9" element={<Layout><Goal9 /></Layout>} />
            <Route path="/sdg-targets/goal-10" element={<Layout><Goal10 /></Layout>} />
            <Route path="/sdg-targets/goal-11" element={<Layout><Goal11 /></Layout>} />
            <Route path="/sdg-targets/goal-12" element={<Layout><Goal12 /></Layout>} />
            <Route path="/sdg-targets/goal-13" element={<Layout><Goal13 /></Layout>} />
            <Route path="/sdg-targets/goal-14" element={<Layout><Goal14 /></Layout>} />
            <Route path="/sdg-targets/goal-15" element={<Layout><Goal15 /></Layout>} />
            <Route path="/sdg-targets/goal-16" element={<Layout><Goal16 /></Layout>} />
            <Route path="/sdg-targets/goal-17" element={<Layout><Goal17 /></Layout>} />
            
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

