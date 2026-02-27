import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading, user } = useAuth()
    const location = useLocation()

    if (loading) {
        return <div className="flex justify-center items-center h-screen text-xl">Loading...</div>
    }

    if (!isAuthenticated) {
        return <Navigate to="/login-select" state={{ from: location }} replace />
    }

    if (user?.role !== 'ADMIN' && user?.needsPasswordChange && location.pathname !== '/change-password') {
        return <Navigate to="/change-password" replace />
    }

    return children
}

export default ProtectedRoute
