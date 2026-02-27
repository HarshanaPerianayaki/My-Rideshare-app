import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { Shield, Mail, Lock, Eye, EyeOff, ChevronLeft, CheckCircle } from 'lucide-react'
import authService from '../../services/authService'
import toast from 'react-hot-toast'

const AdminLogin = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const { login: authLogin } = useAuth()
    const navigate = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const data = await authService.login({ email, password })
            if (data.user.role === 'ADMIN') {
                authLogin(data)
                toast.success('Admin Login Successful!')
                navigate('/admin/dashboard')
            } else {
                toast.error('Unauthorized access. Admin role required.')
                authService.logout()
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full min-h-screen flex flex-col md:flex-row bg-white relative">
            <Link
                to="/login-select"
                className="absolute top-6 left-6 z-20 inline-flex items-center gap-2 text-white text-sm font-medium opacity-80 hover:opacity-100 transition"
            >
                <ChevronLeft size={16} /> Back
            </Link>
            {/* Left Panel - Branding & Info */}
            <div className="md:w-1/2 bg-professional-blue floating-shapes p-12 md:p-24 flex flex-col justify-center text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-900/20 rounded-full -ml-32 -mb-32 blur-3xl" />

                <div className="relative z-10 space-y-8">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-2xl">
                        <Shield size={48} className="text-white" />
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-5xl font-black leading-tight">Admin Portal</h1>
                        <p className="text-xl text-blue-50/80 max-w-md">
                            Manage your platform with full control. Monitor activity, users, and performance analytics.
                        </p>
                    </div>

                    <div className="space-y-6 pt-8">
                        {[
                            'Full platform control',
                            'User management',
                            'Analytics & reports'
                        ].map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-4 text-lg font-bold">
                                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                                    <CheckCircle size={16} className="text-white" />
                                </div>
                                {feature}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="md:w-1/2 p-8 md:p-24 flex flex-col justify-center relative bg-gradient-to-br from-white via-blue-50/30 to-white">
                <div className="max-w-md w-full mx-auto space-y-12">
                    <div className="space-y-4">
                        <h2 className="text-4xl font-black text-gray-800">Admin Login</h2>
                        <p className="text-gray-500 font-medium">Enter your credentials to continue</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-black text-gray-700 uppercase tracking-wider ml-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-gray-900 font-bold placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                                    placeholder="admin@smartride.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-black text-gray-700 uppercase tracking-wider ml-1">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-gray-900 font-bold placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-500 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-100 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 relative overflow-hidden shimmer-button ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                            ) : 'Login as Admin'}
                        </button>
                    </form>

                    <div className="pt-8 border-t border-gray-100 text-center">
                        <p className="text-gray-500 font-bold">
                            New here? {' '}
                            <Link to="/admin/register" className="text-blue-600 hover:underline">
                                Register as Admin
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminLogin
