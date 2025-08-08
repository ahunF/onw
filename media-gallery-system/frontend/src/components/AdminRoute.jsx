import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export const AdminRoute = ({ children }) => {
  const { user, isAdmin } = useAuth()

  if (!user || !isAdmin()) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}