import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminRoute } from './components/AdminRoute'
import { Layout } from './components/Layout'

// Import Pages
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import DashboardPage from './pages/DashboardPage'
import GalleryPage from './pages/GalleryPage'
import UploadPage from './pages/UploadPage'
import ImageDetailPage from './pages/ImageDetailPage'
import ProfilePage from './pages/ProfilePage'
import ContactPage from './pages/ContactPage'
import MyMessagesPage from './pages/MyMessagesPage'
import AdminUsersPage from './pages/AdminUsersPage'
import AdminMessagesPage from './pages/AdminMessagesPage'
import NotFoundPage from './pages/NotFoundPage'
import UnauthorizedPage from './pages/UnauthorizedPage'

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="gallery" element={<GalleryPage />} />
            <Route path="upload" element={<UploadPage />} />
            <Route path="image/:id" element={<ImageDetailPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="my-messages" element={<MyMessagesPage />} />

            {/* Admin Routes */}
            <Route
              path="admin/users"
              element={
                <AdminRoute>
                  <AdminUsersPage />
                </AdminRoute>
              }
            />
            <Route
              path="admin/messages"
              element={
                <AdminRoute>
                  <AdminMessagesPage />
                </AdminRoute>
              }
            />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App