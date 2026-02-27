import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Mail, Phone, User, ShieldCheck } from 'lucide-react'

const Dashboard = () => {
    const { user } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (user) {
            if (user.role === 'DRIVER') {
                navigate('/driver/dashboard')
            } else if (user.role === 'PASSENGER') {
                navigate('/passenger/dashboard')
            }
        }
    }, [user, navigate])

    if (!user) return null

    return (
        <div className="min-h-screen bg-professional-blue py-12 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-12">
                    <h1 className="text-4xl font-extrabold text-white mb-2">Welcome, {user.firstName}!</h1>
                    <p className="text-blue-100 font-medium opacity-80">Manage your profile and rides from here.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="bg-white p-8 rounded-3xl shadow-xl border border-white/20 flex flex-col items-center text-center hover:scale-105 transition-all">
                        <div className="bg-blue-50 p-4 rounded-2xl mb-5 shadow-inner">
                            <User className="text-blue-600" size={32} />
                        </div>
                        <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Full Name</h3>
                        <p className="text-xl font-bold text-gray-800">{user.firstName} {user.lastName}</p>
                    </div>

                    <div className="bg-white p-8 rounded-3xl shadow-xl border border-white/20 flex flex-col items-center text-center hover:scale-105 transition-all">
                        <div className="bg-blue-50 p-4 rounded-2xl mb-5 shadow-inner">
                            <Mail className="text-blue-600" size={32} />
                        </div>
                        <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Email Address</h3>
                        <p className="text-xl font-bold text-gray-800 break-all">{user.email}</p>
                    </div>

                    <div className="bg-white p-8 rounded-3xl shadow-xl border border-white/20 flex flex-col items-center text-center hover:scale-105 transition-all">
                        <div className="bg-blue-50 p-4 rounded-2xl mb-5 shadow-inner">
                            <ShieldCheck className="text-blue-600" size={32} />
                        </div>
                        <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Account Role</h3>
                        <p className="text-xl font-bold text-gray-800">{user.role}</p>
                    </div>

                    <div className="bg-white p-8 rounded-3xl shadow-xl border border-white/20 flex flex-col items-center text-center hover:scale-105 transition-all">
                        <div className="bg-blue-50 p-4 rounded-2xl mb-5 shadow-inner">
                            <Phone className="text-blue-600" size={32} />
                        </div>
                        <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Phone Number</h3>
                        <p className="text-xl font-bold text-gray-800">{user.phone || 'N/A'}</p>
                    </div>
                </div>

                <div className="mt-12 bg-white/10 backdrop-blur-md p-10 rounded-3xl border border-white/20 text-white">
                    <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                        <div className="w-2 h-8 bg-blue-400 rounded-full"></div>
                        Account Status
                    </h2>
                    <div className="flex flex-wrap items-center gap-6">
                        <div className={`px-6 py-3 rounded-2xl text-sm font-black tracking-widest uppercase border-2 shadow-lg ${user.isVerified ? 'bg-blue-500/20 text-blue-100 border-blue-400/30' : 'bg-red-500/20 text-red-100 border-red-400/30'}`}>
                            {user.isVerified ? 'Verified Account' : 'Action Required: Verify Email'}
                        </div>
                        <p className="text-blue-100 font-bold flex items-center gap-2 opacity-80">
                            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                            Member since {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard
