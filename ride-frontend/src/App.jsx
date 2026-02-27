import { Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import Home from './pages/Home'
import PassengerLogin from './pages/passenger/PassengerLogin'
import PassengerRegister from './pages/passenger/PassengerRegister'
import DriverLogin from './pages/driver/DriverLogin'
import DriverRegister from './pages/driver/DriverRegister'
import AdminLogin from './pages/admin/AdminLogin'
import AdminRegister from './pages/admin/AdminRegister'
import AdminDashboard from './pages/admin/AdminDashboard'
import LoginSelect from './pages/LoginSelect'
import RegisterSelect from './pages/RegisterSelect'
import ChangePassword from './pages/ChangePassword'
import About from './pages/About'

import DriverDashboard from './pages/driver/DriverDashboard'
import PassengerDashboard from './pages/passenger/PassengerDashboard'

function App() {
    return (
        <div className="w-full min-h-screen">
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/login-select" element={<LoginSelect />} />
                <Route path="/register-select" element={<RegisterSelect />} />

                {/* Passenger Routes */}
                <Route path="/login" element={<PassengerLogin />} />
                <Route path="/register" element={<PassengerRegister />} />
                <Route path="/passenger/login" element={<PassengerLogin />} />
                <Route path="/passenger/register" element={<PassengerRegister />} />

                {/* Passenger Dashboard Route */}
                <Route
                    path="/passenger/dashboard"
                    element={
                        <ProtectedRoute role="PASSENGER">
                            <PassengerDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Driver Routes */}
                <Route path="/driver/login" element={<DriverLogin />} />
                <Route path="/driver/register" element={<DriverRegister />} />
                <Route
                    path="/driver/dashboard"
                    element={
                        <ProtectedRoute role="DRIVER">
                            <DriverDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/register" element={<AdminRegister />} />
                <Route
                    path="/admin/dashboard"
                    element={
                        <ProtectedRoute role="ADMIN">
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route path="/change-password" element={<ChangePassword />} />

                {/* Protecting the dashboard */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </div>
    )
}

export default App
