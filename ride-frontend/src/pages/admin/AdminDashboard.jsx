import { useState, useEffect } from 'react'
import {
    LayoutDashboard, Users, Car, Settings, LogOut,
    User, CreditCard, Calendar, Search, Filter,
    CheckCircle, XCircle, Ban, ChevronRight, Bell,
    Mail, Phone, Shield, Clock, AlertCircle, TrendingUp
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import authService from '../../services/authService'
import toast from 'react-hot-toast'
import ChartCard from '../../components/common/ChartCard'

const AdminDashboard = () => {
    const [activeView, setActiveView] = useState('dashboard')
    const [stats, setStats] = useState({ totalUsers: 0, totalDrivers: 0, totalPassengers: 0 })
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [roleFilter, setRoleFilter] = useState('ALL')
    const [statusFilter, setStatusFilter] = useState('ALL')
    const [chartData, setChartData] = useState({
        revenue: null,
        userGrowth: null,
        activeTrips: null,
        completionRate: null,
        topDrivers: null,
        tripsByCity: null
    })
    const [chartsLoading, setChartsLoading] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        setLoading(true)
        try {
            const [statsData, usersData] = await Promise.all([
                authService.getAdminDashboard(),
                authService.getAllUsers()
            ])
            setStats(statsData)
            setUsers(usersData)

            fetchChartsData()
        } catch (error) {
            toast.error('Failed to fetch dashboard data')
        } finally {
            setLoading(false)
        }
    }

    const fetchChartsData = async () => {
        setChartsLoading(true)
        try {
            const [revenue, growth, active, completion, topDrivers, cityStats] = await Promise.all([
                authService.getAdminRevenueMonthly(),
                authService.getAdminUserGrowth(),
                authService.getAdminActiveTrips(),
                authService.getAdminCompletionRate(),
                authService.getAdminTopDrivers(),
                authService.getAdminTripsByCity()
            ])
            setChartData({
                revenue: revenue.data,
                userGrowth: growth.data,
                activeTrips: active.data,
                completionRate: completion.data,
                topDrivers: topDrivers.data,
                tripsByCity: cityStats.data
            })
        } catch (error) {
            console.error('Failed to fetch admin charts:', error)
        } finally {
            setChartsLoading(false)
        }
    }

    const handleVerifyUser = async (id) => {
        try {
            await authService.verifyUser(id)
            toast.success('User approved!')
            setUsers(prev => prev.map(u => u.id === id ? { ...u, isVerified: true } : u))
        } catch (error) {
            toast.error('Verification failed')
        }
    }

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to disapprove this user?')) return
        try {
            await authService.deleteUser(id)
            toast.success('User disapproved')
            setUsers(prev => prev.map(u => u.id === id ? { ...u, isVerified: false } : u))
        } catch (error) {
            toast.error('Disapprove failed')
        }
    }

    const handleLogout = () => {
        authService.logout()
        navigate('/')
    }

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesRole = roleFilter === 'ALL' || user.role === roleFilter
        const matchesStatus = statusFilter === 'ALL' ||
            (statusFilter === 'ACTIVE' && user.isVerified) ||
            (statusFilter === 'PENDING' && !user.isVerified)
        return matchesSearch && matchesRole && matchesStatus
    })

    // Views
    const renderDashboard = () => (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col items-center text-center gap-3">
                <div>
                    <h2 className="text-[clamp(32px,5vw,52px)] font-extrabold text-gray-800">Admin Dashboard</h2>
                    <p className="text-gray-500 font-medium">Platform overview and performance metrics</p>
                </div>
                <div className="bg-white/90 px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
                    <Clock size={16} className="text-gray-400" />
                    <span className="text-sm font-bold text-gray-600">
                        {new Date().toLocaleDateString('en-IN', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </span>
                </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
                {[
                    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'blue', border: 'border-blue-500' },
                    { label: 'Total Drivers', value: stats.totalDrivers, icon: Car, color: 'indigo', border: 'border-indigo-500' },
                    { label: 'Total Passengers', value: stats.totalPassengers, icon: User, color: 'sky', border: 'border-sky-500' },
                    { label: 'Rides Today', value: '156', icon: Calendar, color: 'blue', border: 'border-blue-400' }
                ].map((stat, idx) => (
                    <div
                        key={idx}
                        className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 ${stat.border} border-t-4 transition-all duration-300 hover:scale-105 hover:shadow-xl w-full text-center flex flex-col items-center`}
                    >
                        <div className={`w-14 h-14 bg-${stat.color}-500/10 rounded-2xl flex items-center justify-center mb-4`}>
                            <stat.icon size={28} className={`text-${stat.color}-500`} />
                        </div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                        <h3 className="text-5xl font-extrabold text-gray-800 leading-none mt-2">{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Charts Section 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
                <ChartCard
                    title="Platform Revenue (Monthly)"
                    type="area"
                    data={chartData.revenue}
                    loading={chartsLoading}
                    colors={['#10b981']}
                />
                <ChartCard
                    title="User Growth (Daily)"
                    type="bar"
                    data={chartData.userGrowth}
                    loading={chartsLoading}
                    colors={['#3b82f6']}
                    currency={false}
                />
            </div>

            {/* Charts Section 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
                <ChartCard
                    title="Completion Rate (%)"
                    type="line"
                    data={chartData.completionRate}
                    loading={chartsLoading}
                    colors={['#f59e0b']}
                    currency={false}
                    percentage={true}
                />
                <ChartCard
                    title="Active Trips (Volume)"
                    type="area"
                    data={chartData.activeTrips}
                    loading={chartsLoading}
                    colors={['#8b5cf6']}
                    currency={false}
                />
            </div>

            {/* Charts Section 3 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full mb-8">
                <ChartCard
                    title="Trip Distribution by City"
                    type="pie"
                    data={chartData.tripsByCity}
                    loading={chartsLoading}
                    colors={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']}
                    currency={false}
                />
                <ChartCard
                    title="Top Performing Drivers"
                    type="bar"
                    data={chartData.topDrivers}
                    loading={chartsLoading}
                    colors={['#ec4899']}
                    currency={false}
                />
            </div>

            {/* Recent Registrations Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden w-full">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-800">Recent Registrations</h3>
                    <div className="flex gap-4">
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 text-sm font-bold text-gray-600 focus:outline-none focus:border-blue-500"
                        >
                            <option value="ALL">All Roles</option>
                            <option value="DRIVER">Drivers</option>
                            <option value="PASSENGER">Passengers</option>
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 text-sm font-bold text-gray-600 focus:outline-none focus:border-blue-500"
                        >
                            <option value="ALL">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="PENDING">Pending</option>
                        </select>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#FAFAFA] text-gray-400 text-xs font-black uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredUsers.slice(0, 5).map(user => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-gray-500 text-sm">#{user.id}</td>
                                    <td className="px-6 py-4 font-bold text-gray-800">{user.firstName} {user.lastName}</td>
                                    <td className="px-6 py-4 text-gray-500 text-sm font-medium">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${user.role === 'DRIVER' ? 'bg-blue-100 text-blue-700' :
                                            user.role === 'PASSENGER' ? 'bg-indigo-100 text-indigo-700' :
                                                'bg-blue-50 text-blue-600'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${user.isVerified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                                }`}
                                        >
                                            <span className={`w-2 h-2 rounded-full ${user.isVerified ? 'bg-green-600' : 'bg-amber-600'}`} />
                                            {user.isVerified ? 'APPROVED' : 'PENDING'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-sm font-medium">{user.phone || 'N/A'}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            {!user.isVerified && (
                                                <button
                                                    onClick={() => handleVerifyUser(user.id)}
                                                    className="p-2 bg-green-500/10 text-green-600 rounded-lg hover:bg-green-500 hover:text-white transition-all shadow-sm shadow-green-100"
                                                    title="Verify User"
                                                >
                                                    <CheckCircle size={16} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="p-2 bg-red-500/10 text-red-600 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-sm shadow-red-100"
                                                title="Deactivate/Remove User"
                                            >
                                                {user.isVerified ? <Ban size={16} /> : <XCircle size={16} />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div >
    )

    const renderProfile = () => {
        const adminUser = authService.getCurrentUser()
        return (
            <div className="space-y-8 animate-in slide-in-from-right duration-500">
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-3xl font-black text-gray-800">Admin Profile</h2>
                        <p className="text-gray-500 font-medium">Manage your personal information and preferences</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                            <button className="absolute top-4 right-4 p-2 text-blue-600 border border-blue-100 rounded-xl hover:bg-blue-50 transition-colors">
                                <Settings size={18} />
                            </button>
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center text-white text-4xl font-black mx-auto mb-6 shadow-xl shadow-blue-200">
                                {adminUser?.firstName?.charAt(0)}
                            </div>
                            <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tight">{adminUser?.firstName} {adminUser?.lastName}</h3>
                            <p className="text-gray-400 font-bold text-sm mb-6">{adminUser?.email}</p>

                            <div className="flex flex-wrap justify-center gap-2 mb-8">
                                <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-wider">Super Admin</span>
                                <span className="px-3 py-1 bg-sky-100 text-sky-600 rounded-full text-[10px] font-black uppercase tracking-wider">Verified</span>
                                <span className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-wider">2FA Enabled</span>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Basic Information</h4>
                            <div className="space-y-4">
                                {[
                                    { label: 'Full Name', value: `${adminUser?.firstName} ${adminUser?.lastName}`, icon: User },
                                    { label: 'Email Address', value: adminUser?.email, icon: Mail },
                                    { label: 'Phone Number', value: adminUser?.phone || '+91 98765 43210', icon: Phone },
                                    { label: 'Role Level', value: 'System Administrator', icon: Shield },
                                    { label: 'Created On', value: 'January 12, 2024', icon: Calendar }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                                            <item.icon size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{item.label}</p>
                                            <p className="text-sm font-bold text-gray-800">{item.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-gray-800 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-blue-500/20 transition-all duration-700"></div>
                            <h4 className="text-xl font-bold mb-8 flex items-center gap-2">
                                <Shield className="text-blue-400" /> Security & Authentication
                            </h4>

                            <div className="space-y-8">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="font-bold">Two-Factor Authentication</p>
                                        <p className="text-sm text-gray-400">Secures your account using a secondary code</p>
                                    </div>
                                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-black tracking-widest uppercase">Enabled</span>
                                </div>
                                <div className="flex items-center justify-between border-t border-gray-700 pt-6">
                                    <div className="space-y-1">
                                        <p className="font-bold">Last Password Change</p>
                                        <p className="text-sm text-gray-400">Changed on March 24, 2024</p>
                                    </div>
                                    <button className="text-purple-400 font-bold text-sm hover:underline">Change Now</button>
                                </div>
                                <div className="flex items-center justify-between border-t border-gray-700 pt-6">
                                    <div className="space-y-1">
                                        <p className="font-bold">Active Sessions</p>
                                        <p className="text-sm text-gray-400">You are currently logged in on 3 devices</p>
                                    </div>
                                    <button className="text-red-400 font-bold text-sm hover:underline">Log Out Others</button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                                <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Permissions</h4>
                                <div className="space-y-4">
                                    {['Manage Users', 'Manage Rides', 'Finances', 'Reports'].map((perm, idx) => (
                                        <div key={idx} className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-gray-600">{perm}</span>
                                            <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Granted</span>
                                        </div>
                                    ))}
                                    <div className="flex items-center justify-between opacity-40">
                                        <span className="text-sm font-bold text-gray-600">reviews</span>
                                        <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Denied</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                                <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Preferences</h4>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Language</label>
                                        <select className="w-full bg-gray-50 border-none rounded-xl p-3 font-bold text-sm">
                                            <option>English (US)</option>
                                            <option>Hindi (IN)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Timezone</label>
                                        <select className="w-full bg-gray-50 border-none rounded-xl p-3 font-bold text-sm text-gray-600">
                                            <option>UTC +05:30 (IST)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-red-50 p-6 rounded-3xl border border-red-100 flex items-center justify-between">
                            <div>
                                <h4 className="text-red-600 font-black flex items-center gap-2">
                                    <AlertCircle size={18} /> Danger Zone
                                </h4>
                                <p className="text-red-400 text-sm font-medium mt-1">This action cannot be undone. Be careful.</p>
                            </div>
                            <button className="bg-red-600 text-white font-black px-6 py-3 rounded-2xl hover:bg-red-700 transition-colors shadow-lg shadow-red-200">
                                Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const renderManageUsers = () => (
        <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-800">Manage Users</h2>
                    <p className="text-gray-500 font-medium">Full database of registered drivers and passengers</p>
                </div>
                <div className="flex bg-white p-2 rounded-2xl shadow-sm border border-gray-100 gap-2 flex-1 md:max-w-md">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name, email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-transparent border-none focus:ring-0 pl-10 pr-4 py-2 font-bold text-gray-600 placeholder:text-gray-300"
                        />
                    </div>
                    <button className="bg-gray-100 p-2 rounded-xl text-gray-600 hover:bg-gray-200 transition-colors">
                        <Filter size={18} />
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <div className="flex gap-2">
                        {['ALL', 'DRIVER', 'PASSENGER'].map(role => (
                            <button
                                key={role}
                                onClick={() => setRoleFilter(role)}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${roleFilter === role ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-gray-400 hover:bg-gray-100'
                                    }`}
                            >
                                {role}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-4 text-sm font-bold text-gray-400">
                        <span>Showing {filteredUsers.length} Users</span>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                            <tr>
                                <th className="px-8 py-6">User Details</th>
                                <th className="px-8 py-6">Role</th>
                                <th className="px-8 py-6">Status</th>
                                <th className="px-8 py-6">Contact</th>
                                <th className="px-8 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 font-bold group-hover:scale-110 transition-transform">
                                                {user.firstName[0]}
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-800 tracking-tight">{user.firstName} {user.lastName}</p>
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">#{user.id} • User since 2024</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${user.role === 'DRIVER' ? 'bg-blue-100 text-blue-600' :
                                            user.role === 'PASSENGER' ? 'bg-rose-100 text-rose-600' :
                                                'bg-purple-100 text-purple-600'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${user.isVerified ? 'bg-sky-100 text-sky-600' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                            {user.isVerified ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                                            {user.isVerified ? 'APPROVED' : 'PENDING'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-bold text-gray-800">{user.email}</p>
                                        <p className="text-xs text-gray-400 font-bold">{user.phone || 'No phone'}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex gap-2 justify-end">
                                            {!user.isVerified && (
                                                <button
                                                    onClick={() => handleVerifyUser(user.id)}
                                                    className="px-4 py-2 bg-blue-500 text-white rounded-xl text-xs font-black uppercase shadow-lg shadow-blue-100 hover:bg-blue-600 transition-all"
                                                >
                                                    Approve
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-black uppercase hover:bg-red-500 hover:text-white transition-all"
                                            >
                                                Deactivate
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Pagination Placeholder */}
                <div className="p-6 bg-gray-50 flex items-center justify-center gap-4">
                    <button className="p-2 border border-gray-200 rounded-xl text-gray-400 hover:bg-white transition-all disabled:opacity-30" disabled><ChevronRight className="rotate-180" size={20} /></button>
                    <span className="text-xs font-black text-gray-500">Page 1 of 1</span>
                    <button className="p-2 border border-gray-200 rounded-xl text-gray-400 hover:bg-white transition-all disabled:opacity-30" disabled><ChevronRight size={20} /></button>
                </div>
            </div>
        </div>
    )

    const renderSettings = () => (
        <div className="space-y-8 animate-in slide-in-from-left duration-500">
            <div>
                <h2 className="text-3xl font-black text-gray-800">Platform Settings</h2>
                <p className="text-gray-500 font-medium">Configure global platform parameters and notifications</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h4 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-8">General Settings</h4>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-600 uppercase">Platform Name</label>
                            <input type="text" defaultValue="SmartRide" className="w-full bg-gray-50 border-gray-100 rounded-xl p-4 font-bold text-gray-800 focus:outline-none focus:border-blue-500 transition-colors" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-600 uppercase">Support Email</label>
                            <input type="email" defaultValue="support@smartride.com" className="w-full bg-gray-50 border-gray-100 rounded-xl p-4 font-bold text-gray-800 focus:outline-none focus:border-blue-500 transition-colors" />
                        </div>
                        <button className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all">Save Global Settings</button>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h4 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-8">Notification Control</h4>
                    <div className="space-y-8">
                        {[
                            { label: 'Email Notifications', desc: 'Send weekly reports to admins' },
                            { label: 'SMS Notifications', desc: 'Alert admins on priority issues' },
                            { label: 'Push Notifications', desc: 'Browser alerts for new registrations' }
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-gray-800">{item.label}</p>
                                    <p className="text-xs text-gray-400 font-medium">{item.desc}</p>
                                </div>
                                <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer shadow-inner">
                                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )

    const renderPlaceholder = (title, icon) => {
        const Icon = icon
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 bg-white rounded-3xl border border-gray-100 shadow-sm p-12 animate-in zoom-in duration-500">
                <div className="w-32 h-32 bg-purple-50 rounded-full flex items-center justify-center text-purple-200">
                    <Icon size={64} />
                </div>
                <div className="space-y-2 max-w-sm">
                    <h2 className="text-3xl font-black text-gray-800 leading-tight">{title}</h2>
                    <p className="text-gray-400 font-bold leading-relaxed">This feature will be available in the Milestone 2 update of the SmartRide Platform.</p>
                </div>
                <div className="flex gap-4">
                    <button className="bg-gray-800 text-white font-black px-8 py-3 rounded-2xl shadow-lg shadow-gray-200" onClick={() => setActiveView('dashboard')}>Back to Dashboard</button>
                    <button className="text-purple-600 font-black px-6 py-3 rounded-2xl border border-purple-100 hover:bg-purple-50 transition-colors">Notify Me</button>
                </div>
            </div>
        )
    }

    if (loading && activeView === 'dashboard') {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="w-16 h-16 border-8 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex bg-professional-blue antialiased selection:bg-blue-100 selection:text-blue-600">
            {/* Left Sidebar */}
            <aside
                className="w-[260px] text-white flex flex-col fixed h-full z-50 bg-white shadow-2xl border-r border-gray-100"
            >
                <div className="p-8 space-y-2 border-b border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20 rotate-3">
                            <span className="text-2xl font-black italic text-white">S</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tight leading-none uppercase text-gray-800">SmartRide</h1>
                            <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest mt-1">Admin Panel</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto custom-scrollbar">
                    <p className="px-4 text-[10px] font-black text-black/60 uppercase tracking-[0.2em] mb-4">Main Navigation</p>
                    {[
                        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                        { id: 'profile', label: 'Admin Profile', icon: User },
                        { id: 'users', label: 'Manage Users', icon: Users },
                        { id: 'rides', label: 'Manage Rides', icon: Car },
                        { id: 'bookings', label: 'Bookings', icon: Calendar },
                        { id: 'payments', label: 'Payments', icon: CreditCard },
                        { id: 'settings', label: 'Settings', icon: Settings }
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveView(item.id)}
                            className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-bold transition-all duration-300 relative group ${activeView === item.id
                                ? 'bg-blue-50 text-blue-600 shadow-sm text-sm'
                                : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50/50 text-sm'
                                }`}
                        >
                            <item.icon size={20} className={activeView === item.id ? 'text-blue-600' : 'text-inherit'} />
                            <span className="tracking-tight">{item.label}</span>
                            {activeView === item.id && (
                                <div className="absolute left-0 w-1.5 h-6 bg-blue-600 rounded-r-full"></div>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="p-6 mt-auto border-t border-white/10">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-bold text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all duration-300 shadow-sm group"
                    >
                        <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
                        <span>Logout System</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            {/* Main Content */}
            <main className="ml-[260px] flex-1 min-w-0 overflow-y-auto px-9 py-8 bg-transparent flex flex-col overflow-x-hidden">

                <div className="w-full">
                    {/* View Top Header Bar */}
                    <header className="mb-10 flex items-center justify-between">
                        <div className="flex gap-4">
                            <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-400">
                                <Bell size={20} />
                            </div>
                            <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-400">
                                <Mail size={20} />
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-white p-2 pr-6 rounded-2xl shadow-sm border border-gray-100 group cursor-pointer hover:border-blue-200 transition-colors">
                            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-black">
                                A
                            </div>
                            <div className="text-left">
                                <p className="text-xs font-black text-gray-800 tracking-tight leading-none mb-1">
                                    Super Admin
                                </p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">
                                    Developer Account
                                </p>
                            </div>
                        </div>
                    </header>

                    {activeView === 'dashboard' && renderDashboard()}
                    {activeView === 'users' && renderManageUsers()}
                    {activeView === 'profile' && renderProfile()}
                    {activeView === 'settings' && renderSettings()}
                    {activeView === 'rides' && renderPlaceholder('Ride Management', Car)}
                    {activeView === 'bookings' && renderPlaceholder('Booking System', Calendar)}
                    {activeView === 'payments' && renderPlaceholder('Payment Gateway', CreditCard)}
                </div>
            </main>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.05);
                    border-radius: 10px;
                }
            `}</style>
        </div>
    )
}

export default AdminDashboard
