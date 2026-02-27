import { useEffect, useState, useRef } from 'react'
import {
    LayoutDashboard, Car, Plus, List, TrendingUp, Star, Bell, Shield, User, LogOut,
    IndianRupee, Calendar, MoreVertical, ImagePlus, CheckCircle, X, Camera, Gauge, CreditCard, Users, Building, ShieldCheck, MapPin, Loader2, AlertCircle, Loader, FileText, Clock, Search
} from 'lucide-react'
import authService from '../../services/authService'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import axios from 'axios'
import { MapContainer, TileLayer, Polyline } from 'react-leaflet'
import DynamicRouteMap from '../../components/DynamicRouteMap'
import ChartCard from '../../components/common/ChartCard'
import ConfirmModal from '../../components/ConfirmModal'

const BASE_URL = 'http://localhost:8080'

const DriverDashboard = () => {
    const { logout } = useAuth()
    const navigate = useNavigate()
    const [activeView, setActiveView] = useState('dashboard')
    const [profile, setProfile] = useState(null)
    const [stats, setStats] = useState({ totalRides: 0, totalEarnings: 0, upcomingRides: 0, avgRating: null })
    const [vehicles, setVehicles] = useState([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isViewModalOpen, setIsViewModalOpen] = useState(false)
    const [selectedVehicle, setSelectedVehicle] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [chartData, setChartData] = useState({
        earnings: null,
        tripStats: null,
        weeklyTrips: null,
        rating: null
    })
    const [chartsLoading, setChartsLoading] = useState(false)
    const [showConfirmModalDriver, setShowConfirmModalDriver] = useState(false)
    const [activeBookingIdDriver, setActiveBookingIdDriver] = useState(null)
    // Use a ref as a fallback storage for the active booking id to avoid runtime bundle mismatches
    const activeBookingIdDriverRef = useRef(null)

    // Debug: verify setter is available at runtime (helps catch stale bundles)
    console.log('DriverDashboard: setActiveBookingIdDriver type=', typeof setActiveBookingIdDriver, 'activeBookingIdDriver=', activeBookingIdDriver)

    const fetchInitialData = async () => {
        setLoading(true)
        try {
            const [profileRes, statsRes, vehiclesRes] = await Promise.all([
                authService.getDriverProfile(),
                authService.getDriverStats(),
                authService.getDriverVehicles()
            ])

            setProfile(profileRes?.data || null)
            setStats({
                totalRides: statsRes?.data?.totalRides || 0,
                totalEarnings: statsRes?.data?.totalEarnings || 0,
                upcomingRides: statsRes?.data?.upcomingRides || 0,
                avgRating: statsRes?.data?.avgRating ?? null
            })
            setVehicles(Array.isArray(vehiclesRes?.data) ? vehiclesRes.data : [])

            // Fetch chart data
            fetchChartsData()
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to load dashboard data')
        } finally {
            setLoading(false)
        }
    }

    const fetchChartsData = async () => {
        setChartsLoading(true)
        try {
            const [earnings, tripStats, weekly, rating] = await Promise.all([
                authService.getDriverEarningsSummary(),
                authService.getDriverTripStats(),
                authService.getDriverWeeklyTrips(),
                authService.getDriverRatingStats()
            ])
            setChartData({
                earnings: earnings.data,
                tripStats: tripStats.data,
                weeklyTrips: weekly.data,
                rating: rating.data
            })
        } catch (error) {
            console.error('Failed to fetch chart data:', error)
        } finally {
            setChartsLoading(false)
        }
    }

    useEffect(() => {
        fetchInitialData()
    }, [])

    const addVehicle = async (formData) => {
        setIsSubmitting(true)
        try {
            await authService.addVehicle(formData)
            toast.success('Vehicle added successfully')
            setIsModalOpen(false)
            await fetchInitialData()
            setActiveView('vehicles')
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to add vehicle';
            toast.error(errorMessage);
            throw error;
        } finally {
            setIsSubmitting(false)
        }
    }

    const editVehicle = async (vehicleId, formData) => {
        setIsSubmitting(true)
        try {
            await authService.updateVehicle(vehicleId, formData)
            toast.success('Vehicle updated successfully')
            setIsEditModalOpen(false)
            setSelectedVehicle(null)
            await fetchInitialData()
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update vehicle';
            toast.error(errorMessage);
            throw error;
        } finally {
            setIsSubmitting(false)
        }
    }

    const deleteVehicle = async (vehicleId) => {
        if (!window.confirm('Are you sure you want to delete this vehicle? This action cannot be undone.')) return;

        try {
            await authService.deleteVehicle(vehicleId)
            setVehicles(prev => prev.filter(v => v.id !== vehicleId))
            toast.success('Vehicle deleted successfully')
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to delete vehicle')
        }
    }

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'vehicles', label: 'My Vehicles', icon: Car },
        { id: 'post-ride', label: 'Post Ride', icon: Plus },
        { id: 'my-rides', label: 'My Rides', icon: List }
    ]

    const renderActiveView = () => {
        if (activeView === 'vehicles') {
            return <MyVehicles
                vehicles={vehicles}
                setIsModalOpen={setIsModalOpen}
                setSelectedVehicle={setSelectedVehicle}
                setIsEditModalOpen={setIsEditModalOpen}
                setIsViewModalOpen={setIsViewModalOpen}
                onDelete={deleteVehicle}
            />
        }
        if (activeView === 'post-ride') {
            return <PostRide vehicles={vehicles} setActiveView={setActiveView} profile={profile} />
        }
        if (activeView === 'my-rides') {
            return <MyRides />
        }
        return <DashboardHome
            profile={profile}
            stats={stats}
            setActiveView={setActiveView}
            chartData={chartData}
            chartsLoading={chartsLoading}
        />
    }

    if (loading) {
        return (
            <div className='min-h-screen bg-professional-blue flex items-center justify-center'>
                <div className='flex items-center gap-3 text-white font-bold'>
                    <Loader2 className='animate-spin' />
                    Loading dashboard...
                </div>
            </div>
        )
    }

    return (
        <div className='min-h-screen bg-professional-blue text-slate-800 flex'>
            <div className='flex flex-1'>
                <aside
                    className={`${isSidebarOpen ? 'w-72' : 'w-20'} transition-all duration-300 flex flex-col bg-white shadow-2xl border-r border-gray-100 relative`}
                >
                    <div className='h-20 px-6 flex items-center justify-between border-b border-gray-100'>
                        <h1 className={`font-black text-xl text-gray-800 ${isSidebarOpen ? 'block' : 'hidden'}`}>Ride Platform</h1>
                        <button
                            onClick={() => setIsSidebarOpen(prev => !prev)}
                            className='text-gray-400 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50'
                        >
                            <MoreVertical size={20} />
                        </button>
                    </div>

                    <nav className='p-4 space-y-2 flex-1'>
                        {navItems.map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setActiveView(id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeView === id
                                    ? 'bg-blue-50 text-blue-700 shadow-md'
                                    : 'text-blue-600 hover:bg-blue-50 hover:text-blue-800'
                                    }`}
                            >
                                <Icon size={20} />
                                <span className={isSidebarOpen ? 'block' : 'hidden'}>{label}</span>
                            </button>
                        ))}
                    </nav>

                    <div className='p-4 border-t border-gray-100'>
                        <button
                            onClick={handleLogout}
                            className='w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all'
                        >
                            <LogOut size={20} />
                            <span className={isSidebarOpen ? 'block' : 'hidden'}>Logout</span>
                        </button>
                    </div>
                </aside>

                <main className='flex-1 min-w-0 relative overflow-y-auto p-6 bg-transparent'>
                    <div className="absolute inset-0 pointer-events-none opacity-5">
                        <div className="absolute top-10 left-10 w-64 h-64 bg-blue-500 rounded-full blur-3xl animate-pulse" />
                        <div
                            className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500 rounded-full blur-3xl animate-pulse"
                            style={{ animationDelay: '1s' }}
                        />
                    </div>
                    <header className='h-20 px-8 bg-white border-b border-slate-100 flex items-center justify-between'>
                        <div>
                            <p className='text-sm text-slate-500'>Welcome back</p>
                            <h2 className='text-xl font-black text-slate-800'>{profile?.firstName || 'Driver'}</h2>
                        </div>
                        <button className='p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100'>
                            <Bell size={20} />
                        </button>
                    </header>

                    <div className='p-8'>{renderActiveView()}</div>
                </main>
            </div>

            <AddVehicleModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={addVehicle}
                isSubmitting={isSubmitting}
            />

            <AddVehicleModal
                isOpen={isEditModalOpen}
                onClose={() => { setIsEditModalOpen(false); setSelectedVehicle(null); }}
                onSubmit={(formData) => editVehicle(selectedVehicle.id, formData)}
                isSubmitting={isSubmitting}
                vehicle={selectedVehicle}
                isEdit={true}
            />

            <ViewVehicleModal
                isOpen={isViewModalOpen}
                onClose={() => { setIsViewModalOpen(false); setSelectedVehicle(null); }}
                vehicle={selectedVehicle}
            />
        </div>
    )
}
const SectionTitle = ({ icon: Icon, title }) => (
    <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-sm">
            {Icon && <Icon size={20} />}
        </div>
        <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">{title}</h3>
    </div>
)

const FormInput = ({ label, icon: Icon, error, ...props }) => (
    <div className="space-y-2">
        {label && <label className="text-sm font-black text-slate-600 ml-1">{label}</label>}
        <div className="relative">
            {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 opacity-60" size={20} />}
            <input
                {...props}
                className={`w-full ${Icon ? 'pl-12' : 'px-5'} py-4 bg-slate-50 border-2 rounded-2xl outline-none transition-all duration-200 font-bold text-slate-700 ${error ? 'border-red-400 focus:border-red-500' : 'border-slate-100 focus:border-blue-500 focus:bg-white shadow-sm'}`}
            />
        </div>
        {error && <p className="text-red-500 text-[10px] font-black flex items-center gap-1 ml-2 mt-1 font-mono uppercase tracking-widest">Error: {error}</p>}
    </div>
)

const DashboardHome = ({ profile, stats, setActiveView, chartData, chartsLoading }) => {
    const getTimeGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    }

    return (
        <div className="animate-in fade-in duration-500">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">{getTimeGreeting()}, {profile?.firstName}!</h1>
                <p className="text-slate-500">Ready to hit the road today?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard icon={Car} iconColor="blue" value={stats.totalRides} label="Total Rides Posted" sub="All time" border="blue" />
                <StatCard icon={IndianRupee} iconColor="indigo" value={`₹${stats.totalEarnings}`} label="Total Earnings" sub="Lifetime" border="indigo" />
                <StatCard icon={Calendar} iconColor="blue" value={stats.upcomingRides} label="Upcoming Rides" sub="Scheduled" border="blue" />
                <StatCard icon={Star} iconColor="sky" value={stats.avgRating || 'N/A'} label="Avg Rating" sub="From passengers" border="sky" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <QuickActionButton icon={Car} label="Add Vehicle" gradient="from-blue-600 to-indigo-600" onClick={() => setActiveView('vehicles')} />
                <QuickActionButton icon={Plus} label="Post a Ride" gradient="from-blue-500 to-indigo-700" onClick={() => setActiveView('post-ride')} />
                <QuickActionButton icon={List} label="My Rides" gradient="from-blue-700 to-indigo-900" onClick={() => setActiveView('my-rides')} />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {chartData.earnings && chartData.earnings.labels && chartData.earnings.labels.length > 0 && (
                    <ChartCard
                        title="Earnings Overview (Daily)"
                        type="area"
                        data={chartData.earnings}
                        loading={chartsLoading}
                        colors={['#3b82f6']}
                    />
                )}
                {chartData.weeklyTrips && chartData.weeklyTrips.labels && chartData.weeklyTrips.labels.length > 0 && (
                    <ChartCard
                        title="Weekly Trip Volume"
                        type="bar"
                        data={chartData.weeklyTrips}
                        loading={chartsLoading}
                        colors={['#8b5cf6']}
                        currency={false}
                    />
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {chartData.tripStats && chartData.tripStats.labels && chartData.tripStats.labels.length > 0 && (
                    <ChartCard
                        title="Ride Status Distribution"
                        type="pie"
                        data={chartData.tripStats}
                        loading={chartsLoading}
                        colors={['#3b82f6', '#10b981', '#f59e0b', '#ef4444']}
                        currency={false}
                    />
                )}
                {chartData.rating && chartData.rating.labels && chartData.rating.labels.length > 0 && (
                    <ChartCard
                        title="Rating Analysis (Weekly)"
                        type="line"
                        data={chartData.rating}
                        loading={chartsLoading}
                        colors={['#f59e0b']}
                        currency={false}
                    />
                )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-8">
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <TrendingUp className="text-blue-600" /> Recent Activity
                </h2>
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <Car size={64} className="mb-4 text-blue-100" />
                    <p className="text-lg mb-6">No activity yet. Add a vehicle to get started!</p>
                    <button
                        onClick={() => setActiveView('vehicles')}
                        className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:scale-105 transition-transform relative overflow-hidden shimmer-button"
                    >
                        Add Your First Vehicle
                    </button>
                </div>
            </div>
        </div>
    )
}

const StatCard = ({ icon: Icon, iconColor, value, label, sub, border }) => (
    <div className={`bg-white rounded-2xl shadow-sm p-6 border-l-4 border-${border}-500 transition-all duration-300 hover:scale-105 hover:shadow-xl`}>
        <div className={`w-12 h-12 rounded-full mb-4 flex items-center justify-center bg-${iconColor}-50 text-${iconColor}-600`}>
            <Icon size={24} />
        </div>
        <p className="text-4xl font-bold text-slate-800 mb-1">{value}</p>
        <p className="text-slate-700 font-bold mb-1">{label}</p>
        <p className="text-slate-400 text-sm">{sub}</p>
    </div>
)

const QuickActionButton = ({ icon: Icon, label, gradient, onClick }) => (
    <button
        onClick={onClick}
        className={`bg-gradient-to-r ${gradient} text-white p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center gap-4 transition-all hover:scale-105 active:scale-95 group relative overflow-hidden shimmer-button`}
    >
        <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center group-hover:rotate-12 transition-transform">
            <Icon size={32} />
        </div>
        <span className="text-xl font-bold tracking-wide">{label}</span>
    </button>
)

const MyVehicles = ({ vehicles, setIsModalOpen, setSelectedVehicle, setIsEditModalOpen, setIsViewModalOpen, onDelete }) => {
    return (
        <div className="animate-in slide-in-from-bottom-5 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">My Vehicles</h1>
                    <p className="text-slate-500">Manage your registered vehicles</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:scale-105 transition-all relative overflow-hidden shimmer-button"
                >
                    <Plus size={20} /> Add New Vehicle
                </button>
            </div>

            {vehicles.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-blue-200 shadow-sm flex flex-col items-center">
                    <div className="w-24 h-24 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6">
                        <Car size={64} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">No vehicles added yet</h2>
                    <p className="text-slate-500 mb-8 max-w-sm">Add your first vehicle to start posting rides and earning money with SmartRide.</p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 px-10 rounded-2xl shadow-xl hover:scale-105 transition-all relative overflow-hidden shimmer-button"
                    >
                        <Plus size={24} className="inline mr-2" /> Add Your First Vehicle
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {vehicles.map((v) => (
                        <VehicleCard
                            key={v.id}
                            vehicle={v}
                            onEdit={() => { setSelectedVehicle(v); setIsEditModalOpen(true); }}
                            onViewDetails={() => { setSelectedVehicle(v); setIsViewModalOpen(true); }}
                            onDelete={() => onDelete(v.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

const VehicleCard = ({ vehicle, onEdit, onViewDetails, onDelete }) => {
    const [isDocsOpen, setIsDocsOpen] = useState(false)
    const images = vehicle.carImagePaths ? vehicle.carImagePaths.split(',') : []

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-white overflow-hidden hover:shadow-xl transition-all duration-300">
            {/* Header */}
            <div className="p-6 border-b border-blue-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                        <Car size={32} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-extrabold text-slate-800 mb-1">{vehicle.company} {vehicle.model}</h3>
                        <p className="text-blue-600 font-bold tracking-widest">{vehicle.carNumber}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 ${vehicle.isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                        <div className={`w-2 h-2 rounded-full ${vehicle.isActive ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]' : 'bg-slate-400'}`}></div>
                        {vehicle.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <button className="text-slate-400 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50">
                        <MoreVertical size={24} />
                    </button>
                </div>
            </div>

            {/* Images */}
            <div className="p-6 bg-slate-50/50">
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {images.length > 0 ? images.map((img, idx) => (
                        <div key={idx} className="flex-shrink-0 w-32 h-24 rounded-2xl overflow-hidden shadow-sm border-2 border-white">
                            <img src={`${BASE_URL}/${img}`} alt="Vehicle Car" className="w-full h-full object-cover" />
                        </div>
                    )) : (
                        <div className="w-full h-24 border-2 border-dashed border-blue-200 rounded-2xl flex flex-col items-center justify-center text-blue-300 bg-white">
                            <ImagePlus size={32} className="mb-2" />
                            <span className="text-xs font-bold font-mono">NO IMAGES UPLOADED</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Grid Stats */}
            <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-4">
                <DetailItem label="Company" value={vehicle.company} />
                <DetailItem label="Model" value={vehicle.model} />
                <DetailItem label="Year" value={vehicle.yearOfModel} />
                <DetailItem label="Color" value={vehicle.color} />
                <DetailItem label="Car Number" value={vehicle.carNumber} />
                <DetailItem label="RC Number" value={vehicle.licenseNumber || 'N/A'} />
                <DetailItem label="KMs Driven" value={vehicle.kmsDriven ? `${vehicle.kmsDriven} KMs` : '0 KMs'} />
                <DetailItem label="Seats" value={`${vehicle.capacity} Passengers`} />
            </div>

            {/* Badges */}
            <div className="px-8 pb-8 flex flex-wrap gap-3">
                <span className={`px-4 py-2 rounded-xl text-xs font-black tracking-widest uppercase ${vehicle.hasAC ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                    AC {vehicle.hasAC ? 'Yes' : 'No'}
                </span>
                <span className={`px-4 py-2 rounded-xl text-xs font-black tracking-widest uppercase ${vehicle.hasAudio ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                    Audio {vehicle.hasAudio ? 'Yes' : 'No'}
                </span>
            </div>

            {/* Documents Collapsible */}
            <div className="mx-8 mb-8 border-2 border-blue-50 rounded-3xl overflow-hidden">
                <button
                    onClick={() => setIsDocsOpen(!isDocsOpen)}
                    className="w-full text-left p-5 flex items-center justify-between bg-blue-50/50 hover:bg-blue-50 transition-colors"
                >
                    <span className="font-extrabold text-slate-800 flex items-center gap-3">
                        <Building size={20} className="text-blue-600" /> Vehicle Documents
                    </span>
                    <TrendingUp size={20} className={`text-blue-400 transition-transform ${isDocsOpen ? 'rotate-180' : ''}`} />
                </button>
                {isDocsOpen && (
                    <div className="p-6 bg-white space-y-4 animate-in slide-in-from-top-2">
                        <DocumentRow label="RC Document" status={vehicle.rcDocumentPath ? 'Uploaded' : 'Missing'} path={vehicle.rcDocumentPath ? `${BASE_URL}/${vehicle.rcDocumentPath}` : null} />
                        <DocumentRow label="Insurance Document" status={vehicle.insuranceDocumentPath ? 'Uploaded' : 'Missing'} path={vehicle.insuranceDocumentPath ? `${BASE_URL}/${vehicle.insuranceDocumentPath}` : null} />
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="p-8 bg-slate-50 flex flex-col md:flex-row gap-4 border-t border-slate-100">
                <button onClick={onEdit} className="flex-1 py-3 px-6 rounded-2xl border-2 border-blue-600 text-blue-600 font-black tracking-wide hover:bg-blue-50 transition-all">EDIT VEHICLE</button>
                <button onClick={onViewDetails} className="flex-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-700 text-white font-black tracking-wide shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all relative overflow-hidden shimmer-button">VIEW FULL DETAILS</button>
                <button onClick={onDelete} className="py-3 px-6 rounded-2xl border-2 border-red-500 text-red-500 font-bold hover:bg-red-50 transition-all">Delete</button>
            </div>
        </div>
    )
}

const DetailItem = ({ label, value }) => (
    <div className="flex flex-col">
        <span className="text-[10px] text-slate-400 font-black tracking-widest uppercase mb-1">{label}</span>
        <span className="text-lg font-extrabold text-slate-800 truncate">{value}</span>
    </div>
)

const DocumentRow = ({ label, status, path }) => (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border-2 border-white shadow-sm">
        <div className="flex items-center gap-3">
            <CheckCircle size={20} className={status === 'Uploaded' ? 'text-green-500' : 'text-slate-300'} />
            <div>
                <p className="font-bold text-slate-700">{label}</p>
                <p className="text-xs text-slate-400">{status}</p>
            </div>
        </div>
        {path && <a href={path} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold text-sm border-b-2 border-blue-100 hover:border-blue-600 pb-0.5">View File</a>}
    </div>
)

const AddVehicleModal = ({ isOpen, onClose, onSubmit, isSubmitting: parentIsSubmitting, vehicle = null, isEdit = false }) => {
    // STATE VARIABLES
    const [company, setCompany] = useState('')
    const [model, setModel] = useState('')
    const [yearOfModel, setYearOfModel] = useState('')
    const [carNumber, setCarNumber] = useState('')
    const [colour, setColour] = useState('')
    const [kmsDriven, setKmsDriven] = useState('')
    const [capacity, setCapacity] = useState('')
    const [licenseNumber, setLicenseNumber] = useState('')
    const [hasAC, setHasAC] = useState(null)
    const [hasAudio, setHasAudio] = useState(null)
    const [rcDocument, setRcDocument] = useState(null)
    const [rcFileName, setRcFileName] = useState('')
    const [insuranceDocument, setInsuranceDocument] = useState(null)
    const [insuranceFileName, setInsuranceFileName] = useState('')
    const [insuranceExpiry, setInsuranceExpiry] = useState('')
    const [carImages, setCarImages] = useState([])
    const [errors, setErrors] = useState({})
    const [localIsSubmitting, setLocalIsSubmitting] = useState(false)

    // REFS
    const rcInputRef = useRef(null)
    const insuranceInputRef = useRef(null)
    const imageInputRef = useRef(null)

    const isSubmitting = parentIsSubmitting || localIsSubmitting

    useEffect(() => {
        if (isEdit && vehicle) {
            setCompany(vehicle.company || '')
            setModel(vehicle.model || '')
            setYearOfModel(vehicle.yearOfModel || '')
            setCarNumber(vehicle.carNumber || '')
            setColour(vehicle.colour || vehicle.color || '')
            setKmsDriven(vehicle.kmsDriven || '')
            setCapacity(vehicle.capacity || '')
            setLicenseNumber(vehicle.licenseNumber || '')
            setHasAC(vehicle.hasAC)
            setHasAudio(vehicle.hasAudio)
            if (vehicle.insuranceExpiry) {
                setInsuranceExpiry(vehicle.insuranceExpiry)
            }
        } else if (!isOpen) {
            resetForm()
        }
    }, [isEdit, vehicle, isOpen])

    const resetForm = () => {
        setCompany(''); setModel(''); setYearOfModel('')
        setCarNumber(''); setColour(''); setKmsDriven('')
        setCapacity(''); setLicenseNumber('')
        setHasAC(null); setHasAudio(null)
        setRcDocument(null); setRcFileName('')
        setInsuranceDocument(null); setInsuranceFileName('')
        setInsuranceExpiry('')
        carImages.forEach(img => URL.revokeObjectURL(img.preview))
        setCarImages([])
        setErrors({})
    }

    const validate = () => {
        const errs = {}
        errs.company = !company.trim() ? "Car company is required" : ""
        errs.model = !model.trim() ? "Car model is required" : ""
        errs.yearOfModel = !yearOfModel ? "Year is required" :
            (yearOfModel < 2000 || yearOfModel > 2025) ? "Enter valid year (2000-2025)" : ""
        errs.carNumber = !carNumber.trim() ? "Car number is required" : ""
        errs.colour = !colour.trim() ? "Color is required" : ""
        errs.kmsDriven = !kmsDriven ? "KMs driven is required" : ""
        errs.capacity = !capacity ? "Capacity is required" : ""
        errs.licenseNumber = !licenseNumber.trim() ? "License number is required" : ""
        errs.hasAC = hasAC === null ? "Please select AC option" : ""
        errs.hasAudio = hasAudio === null ? "Please select audio option" : ""

        if (!isEdit) {
            errs.rcDocument = !rcDocument ? "RC document is required" : ""
            errs.insuranceDocument = !insuranceDocument ? "Insurance document is required" : ""
            errs.insuranceExpiry = !insuranceExpiry ? "Insurance expiry date is required" : ""
            errs.carImages = carImages.length === 0 ? "Please upload at least 1 photo" : ""
        }

        setErrors(errs)
        return !Object.values(errs).some(e => e !== "")
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validate()) return

        setLocalIsSubmitting(true)
        const formData = new FormData()
        formData.append('company', company)
        formData.append('model', model)
        formData.append('yearOfModel', yearOfModel)
        formData.append('carNumber', carNumber.toUpperCase())
        formData.append('colour', colour)
        formData.append('kmsDriven', kmsDriven)
        formData.append('capacity', capacity)
        formData.append('seats', capacity)
        formData.append('licenseNumber', licenseNumber)
        formData.append('hasAC', hasAC)
        formData.append('hasAudio', hasAudio)
        formData.append('rcDocument', rcDocument)
        formData.append('insuranceDocument', insuranceDocument)
        formData.append('insuranceExpiry', insuranceExpiry)
        carImages.forEach(img => {
            formData.append('carImages', img.file)
        })

        try {
            await onSubmit(formData)
            onClose()
            resetForm()
        } catch (err) {
            // Error managed by parent
        } finally {
            setLocalIsSubmitting(false)
        }
    }

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files)
        const remaining = 5 - carImages.length
        const toAdd = files.slice(0, remaining)
        if (toAdd.length < files.length) toast.warning("Maximum 5 images allowed")
        const newImages = toAdd.map(f => ({
            file: f,
            preview: URL.createObjectURL(f)
        }))
        setCarImages(prev => [...prev, ...newImages])
        e.target.value = ''
    }

    const removeImage = (index) => {
        setCarImages(prev => {
            const newImages = [...prev]
            URL.revokeObjectURL(newImages[index].preview)
            newImages.splice(index, 1)
            return newImages
        })
    }

    if (!isOpen) return null

    const colorChips = [
        { bg: '#FFFFFF', label: 'White' },
        { bg: '#1a1a1a', label: 'Black' },
        { bg: '#C0C0C0', label: 'Silver' },
        { bg: '#DC2626', label: 'Red' },
        { bg: '#2563EB', label: 'Blue' },
        { bg: '#16A34A', label: 'Green' },
        { bg: '#EA580C', label: 'Orange' },
        { bg: '#92400E', label: 'Brown' }
    ]

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="bg-white rounded-[24px] w-full max-w-[800px] max-h-[90vh] overflow-y-auto shadow-[0_25px_60px_rgba(0,0,0,0.3)] relative animate-in zoom-in-95 duration-300">

                {/* MODAL HEADER */}
                <div className="bg-gradient-to-br from-[#1E3C72] to-[#2A5298] rounded-[24px_24px_0_0] p-[28px_32px] flex justify-between items-center sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-2 rounded-xl">
                            <Car className="text-white" size={28} />
                        </div>
                        <div>
                            <h2 className="text-white font-bold text-[24px]">Add New Vehicle</h2>
                            <p className="text-white/75 text-[14px]">Fill in your vehicle details carefully</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { onClose(); resetForm(); }}
                        className="w-[36px] h-[36px] rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-all"
                    >
                        <X className="text-white" size={20} />
                    </button>
                </div>

                <div className="p-[32px]">
                    {/* SECTION 1: Basic Vehicle Information */}
                    <div className="border-l-[4px] border-[#1D4ED8] bg-[#EFF6FF] rounded-[0_12px_12px_0] p-[12px_16px] mb-[20px]">
                        <h3 className="text-[#1E40AF] font-[700] text-[17px]">Basic Vehicle Information</h3>
                    </div>

                    <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-[24px] mb-[24px] shadow-[0_1px_4px_rgba(0,0,0,0.06)] space-y-6">
                        {/* FIELD 1 - Car Company */}
                        <div>
                            <label className="text-gray-700 font-semibold mb-1 block">Car Company *</label>
                            <div className="relative">
                                <Car className="text-blue-500 absolute left-3 top-3.5" size={18} />
                                <input
                                    className="w-full pl-[40px] pr-[12px] py-[12px] border-2 border-[#E5E7EB] rounded-[12px] text-[15px] outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] transition-all"
                                    placeholder="e.g. Maruti Suzuki, Hyundai, Tata Motors"
                                    value={company}
                                    onChange={(e) => setCompany(e.target.value)}
                                />
                            </div>
                            {errors.company && <div className="text-[#EF4444] text-[12px] mt-[4px] flex items-center gap-[4px]"><AlertCircle size={12} /> {errors.company}</div>}
                        </div>

                        {/* FIELD 2 - Model & Year */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-gray-700 font-semibold mb-1 block">Car Model *</label>
                                <input
                                    className="w-full px-[12px] py-[12px] border-2 border-[#E5E7EB] rounded-[12px] text-[15px] outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] transition-all"
                                    placeholder="e.g. Swift, i20, Nexon, City"
                                    value={model}
                                    onChange={(e) => setModel(e.target.value)}
                                />
                                {errors.model && <div className="text-[#EF4444] text-[12px] mt-[4px] flex items-center gap-[4px]"><AlertCircle size={12} /> {errors.model}</div>}
                            </div>
                            <div>
                                <label className="text-gray-700 font-semibold mb-1 block">Year of Model *</label>
                                <input
                                    type="number" min="2000" max="2025"
                                    className="w-full px-[12px] py-[12px] border-2 border-[#E5E7EB] rounded-[12px] text-[15px] outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] transition-all"
                                    placeholder="e.g. 2022"
                                    value={yearOfModel}
                                    onChange={(e) => setYearOfModel(e.target.value)}
                                />
                                {errors.yearOfModel && <div className="text-[#EF4444] text-[12px] mt-[4px] flex items-center gap-[4px]"><AlertCircle size={12} /> {errors.yearOfModel}</div>}
                            </div>
                        </div>

                        {/* FIELD 3 - Number & Color */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-gray-700 font-semibold mb-1 block">Car Number *</label>
                                <input
                                    className="w-full px-[12px] py-[12px] border-2 border-[#E5E7EB] rounded-[12px] text-[15px] outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] transition-all"
                                    placeholder="MH 01 AB 1234"
                                    value={carNumber}
                                    onChange={(e) => setCarNumber(e.target.value.toUpperCase())}
                                />
                                {errors.carNumber && <div className="text-[#EF4444] text-[12px] mt-[4px] flex items-center gap-[4px]"><AlertCircle size={12} /> {errors.carNumber}</div>}
                            </div>
                            <div>
                                <label className="text-gray-700 font-semibold mb-1 block">Colour *</label>
                                <input
                                    className="w-full px-[12px] py-[12px] border-2 border-[#E5E7EB] rounded-[12px] text-[15px] outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] transition-all"
                                    placeholder="e.g. Pearl White, Midnight Black"
                                    value={colour}
                                    onChange={(e) => setColour(e.target.value)}
                                />
                                <div className="flex gap-2 mt-2 flex-wrap">
                                    {colorChips.map(chip => (
                                        <div
                                            key={chip.label}
                                            onClick={() => setColour(chip.label)}
                                            style={{ background: chip.bg }}
                                            className={`w-6 h-6 rounded-full cursor-pointer border-2 transition-all ${colour.toLowerCase() === chip.label.toLowerCase() ? 'border-blue-500 scale-110' : 'border-transparent hover:scale-110'}`}
                                            title={chip.label}
                                        />
                                    ))}
                                </div>
                                {errors.colour && <div className="text-[#EF4444] text-[12px] mt-[4px] flex items-center gap-[4px]"><AlertCircle size={12} /> {errors.colour}</div>}
                            </div>
                        </div>

                        {/* FIELD 4 - KMs Driven */}
                        <div>
                            <label className="text-gray-700 font-semibold mb-1 block">KMs Driven *</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    className="w-full px-[12px] pr-[60px] py-[12px] border-2 border-[#E5E7EB] rounded-[12px] text-[15px] outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] transition-all"
                                    placeholder="e.g. 25000"
                                    value={kmsDriven}
                                    onChange={(e) => setKmsDriven(e.target.value)}
                                />
                                <span className="absolute right-0 top-0 bottom-0 bg-[#1D4ED8] text-white px-[10px] py-[6px] rounded-[0_8px_8px_0] text-[13px] font-[600] flex items-center">KMs</span>
                            </div>
                            {errors.kmsDriven && <div className="text-[#EF4444] text-[12px] mt-[4px] flex items-center gap-[4px]"><AlertCircle size={12} /> {errors.kmsDriven}</div>}
                        </div>

                        {/* FIELD 5 - Capacity & License */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-gray-700 font-semibold mb-1 block">Vehicle Capacity *</label>
                                <div className="relative">
                                    <Users className="text-gray-400 absolute left-3 top-3.5" size={18} />
                                    <input
                                        type="number" min="1" max="8"
                                        className="w-full pl-[40px] pr-[12px] py-[12px] border-2 border-[#E5E7EB] rounded-[12px] text-[15px] outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] transition-all"
                                        placeholder="e.g. 4"
                                        value={capacity}
                                        onChange={(e) => setCapacity(e.target.value)}
                                    />
                                </div>
                                {errors.capacity && <div className="text-[#EF4444] text-[12px] mt-[4px] flex items-center gap-[4px]"><AlertCircle size={12} /> {errors.capacity}</div>}
                            </div>
                            <div>
                                <label className="text-gray-700 font-semibold mb-1 block">License Number *</label>
                                <div className="relative">
                                    <CreditCard className="text-gray-400 absolute left-3 top-3.5" size={18} />
                                    <input
                                        className="w-full pl-[40px] pr-[12px] py-[12px] border-2 border-[#E5E7EB] rounded-[12px] text-[15px] outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] transition-all"
                                        placeholder="DL-XXXXXXXXXXXX"
                                        value={licenseNumber}
                                        onChange={(e) => setLicenseNumber(e.target.value)}
                                    />
                                </div>
                                {errors.licenseNumber && <div className="text-[#EF4444] text-[12px] mt-[4px] flex items-center gap-[4px]"><AlertCircle size={12} /> {errors.licenseNumber}</div>}
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: Vehicle Features */}
                    <div className="border-l-[4px] border-blue-600 bg-blue-50 rounded-[0_12px_12px_0] p-[12px_16px] mb-[20px]">
                        <h3 className="text-blue-800 font-[700] text-[17px]">Vehicle Features & Amenities</h3>
                    </div>

                    <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-[24px] mb-[24px] shadow-[0_1px_4px_rgba(0,0,0,0.06)] space-y-8">
                        {/* AC */}
                        <div>
                            <label className="text-gray-700 font-semibold mb-3 block">Air Conditioning *</label>
                            <div className="grid grid-cols-2 gap-4">
                                <div
                                    id="ac-yes"
                                    onClick={() => setHasAC(true)}
                                    className={`relative cursor-pointer rounded-[16px] p-[20px] border-2 transition-all duration-200 flex flex-col items-center text-center ${hasAC === true ? 'border-[#3B82F6] bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] shadow-[0_4px_12px_rgba(59,130,246,0.2)] scale-[1.02]' : 'border-[#E5E7EB] bg-white hover:border-[#93C5FD] hover:bg-[#F0F9FF]'}`}
                                >
                                    <span className="text-[36px] mb-[8px]">YES</span>
                                    <p className={`text-[13px] ${hasAC === true ? 'text-[#3B82F6]' : 'text-[#9CA3AF]'}`}>AC Available</p>
                                    {hasAC === true && (
                                        <div className="absolute top-[8px] right-[8px] bg-[#10B981] text-white rounded-full p-[2px] shadow-sm">
                                            <CheckCircle size={16} />
                                        </div>
                                    )}
                                </div>
                                <div
                                    id="ac-no"
                                    onClick={() => setHasAC(false)}
                                    className={`relative cursor-pointer rounded-[16px] p-[20px] border-2 transition-all duration-200 flex flex-col items-center text-center ${hasAC === false ? 'border-[#6B7280] bg-gradient-to-br from-[#F9FAFB] to-[#F3F4F6] shadow-[0_4px_12px_rgba(107,114,128,0.15)] scale-[1.02]' : 'border-[#E5E7EB] bg-white hover:border-[#93C5FD] hover:bg-[#F0F9FF]'}`}
                                >
                                    <span className="text-[36px] mb-[8px]">NO</span>
                                    <p className="text-[13px] text-[#9CA3AF]">No AC</p>
                                    {hasAC === false && (
                                        <div className="absolute top-[8px] right-[8px] bg-[#6B7280] text-white rounded-full p-[2px] shadow-sm">
                                            <CheckCircle size={16} />
                                        </div>
                                    )}
                                </div>
                            </div>
                            {errors.hasAC && <div className="text-[#EF4444] text-[12px] mt-[4px] flex items-center gap-[4px]"><AlertCircle size={12} /> {errors.hasAC}</div>}
                        </div>

                        {/* AUDIO */}
                        <div>
                            <label className="text-gray-700 font-semibold mb-3 block">Audio System *</label>
                            <div className="grid grid-cols-2 gap-4">
                                <div
                                    id="audio-yes"
                                    onClick={() => setHasAudio(true)}
                                    className={`relative cursor-pointer rounded-[16px] p-[20px] border-2 transition-all duration-200 flex flex-col items-center text-center ${hasAudio === true ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-[0_4px_12px_rgba(59,130,246,0.2)] scale-[1.02]' : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'}`}
                                >
                                    <span className="text-[36px] mb-[8px]">YES</span>
                                    <p className={`font-[800] text-[18px] ${hasAudio === true ? 'text-blue-800' : 'text-gray-500'}`}>YES</p>
                                    <p className={`text-[13px] ${hasAudio === true ? 'text-blue-600' : 'text-gray-400'}`}>Audio System</p>
                                    {hasAudio === true && (
                                        <div className="absolute top-[8px] right-[8px] bg-blue-600 text-white rounded-full p-[2px] shadow-sm">
                                            <CheckCircle size={16} />
                                        </div>
                                    )}
                                </div>
                                <div
                                    id="audio-no"
                                    onClick={() => setHasAudio(false)}
                                    className={`relative cursor-pointer rounded-[16px] p-[20px] border-2 transition-all duration-200 flex flex-col items-center text-center ${hasAudio === false ? 'border-gray-500 bg-gradient-to-br from-gray-50 to-gray-200 shadow-[0_4px_12px_rgba(107,114,128,0.15)] scale-[1.02]' : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'}`}
                                >
                                    <span className="text-[36px] mb-[8px]">NO</span>
                                    <p className="text-[13px] text-gray-400">No Audio System</p>
                                    {hasAudio === false && (
                                        <div className="absolute top-[8px] right-[8px] bg-gray-600 text-white rounded-full p-[2px] shadow-sm">
                                            <CheckCircle size={16} />
                                        </div>
                                    )}
                                </div>
                            </div>
                            {errors.hasAudio && <div className="text-[#EF4444] text-[12px] mt-[4px] flex items-center gap-[4px]"><AlertCircle size={12} /> {errors.hasAudio}</div>}
                        </div>
                    </div>

                    {/* SECTION 3: Vehicle Documents */}
                    <div className="border-l-[4px] border-[#10B981] bg-[#ECFDF5] rounded-[0_12px_12px_0] p-[12px_16px] mb-[20px]">
                        <h3 className="text-[#065F46] font-[700] text-[17px]">Vehicle Documents</h3>
                    </div>

                    <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-[24px] mb-[24px] shadow-[0_1px_4px_rgba(0,0,0,0.06)] grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* RC UPLOAD */}
                        <div>
                            <label className="text-gray-700 font-semibold mb-2 block">RC Book (Registration Certificate) *</label>
                            <div
                                onClick={() => rcInputRef.current.click()}
                                className={`border-2 border-dashed rounded-[16px] p-[28px_20px] text-center cursor-pointer transition-all duration-200 flex flex-col items-center ${rcDocument ? 'border-blue-300 bg-blue-50' : 'border-blue-200 bg-blue-50/50 hover:border-blue-400 hover:bg-blue-100'}`}
                            >
                                {rcDocument ? (
                                    <>
                                        <CheckCircle className="text-blue-600 mb-3" size={44} />
                                        <p className="text-blue-800 font-semibold text-[14px] max-w-[160px] overflow-hidden text-ellipsis whitespace-nowrap">{rcFileName}</p>
                                        <p className="text-blue-600 text-[13px]">Successfully uploaded</p>
                                        <p className="text-[#6B7280] text-[11px] mt-1">Click to change file</p>
                                    </>
                                ) : (
                                    <>
                                        <FileText className="text-[#3B82F6] mb-3" size={44} />
                                        <p className="text-[#1D4ED8] font-semibold text-[16px]">Upload RC Document</p>
                                        <p className="text-[#6B7280] text-[13px] mt-1">Click to browse files</p>
                                        <p className="text-[#9CA3AF] text-[12px] mt-1">PDF, JPG, PNG â€¢ Max 10MB</p>
                                    </>
                                )}
                                <input
                                    ref={rcInputRef}
                                    type="file" accept=".pdf,.jpg,.jpeg,.png"
                                    style={{ display: 'none' }}
                                    onChange={(e) => {
                                        const file = e.target.files[0]
                                        if (file) {
                                            setRcDocument(file)
                                            setRcFileName(file.name)
                                        }
                                    }}
                                />
                            </div>
                            {errors.rcDocument && <div className="text-[#EF4444] text-[12px] mt-[4px] flex items-center gap-[4px]"><AlertCircle size={12} /> {errors.rcDocument}</div>}
                        </div>

                        {/* INSURANCE UPLOAD */}
                        <div>
                            <label className="text-gray-700 font-semibold mb-2 block">Insurance Certificate *</label>
                            <div
                                onClick={() => insuranceInputRef.current.click()}
                                className={`border-2 border-dashed rounded-[16px] p-[28px_20px] text-center cursor-pointer transition-all duration-200 flex flex-col items-center ${insuranceDocument ? 'border-blue-300 bg-blue-50' : 'border-blue-200 bg-blue-50/50 hover:border-blue-400 hover:bg-blue-100'}`}
                            >
                                {insuranceDocument ? (
                                    <>
                                        <CheckCircle className="text-blue-600 mb-3" size={44} />
                                        <p className="text-blue-800 font-semibold text-[14px] max-w-[160px] overflow-hidden text-ellipsis whitespace-nowrap">{insuranceFileName}</p>
                                        <p className="text-blue-600 text-[13px]">Successfully uploaded</p>
                                        <p className="text-[#6B7280] text-[11px] mt-1">Click to change file</p>
                                    </>
                                ) : (
                                    <>
                                        <Shield className="text-[#3B82F6] mb-3" size={44} />
                                        <p className="text-[#1D4ED8] font-semibold text-[16px]">Upload Insurance Certificate</p>
                                        <p className="text-[#6B7280] text-[13px] mt-1">Click to browse files</p>
                                        <p className="text-[#9CA3AF] text-[12px] mt-1">PDF, JPG, PNG â€¢ Max 10MB</p>
                                    </>
                                )}
                                <input
                                    ref={insuranceInputRef}
                                    type="file" accept=".pdf,.jpg,.jpeg,.png"
                                    style={{ display: 'none' }}
                                    onChange={(e) => {
                                        const file = e.target.files[0]
                                        if (file) {
                                            setInsuranceDocument(file)
                                            setInsuranceFileName(file.name)
                                        }
                                    }}
                                />
                            </div>
                            {errors.insuranceDocument && <div className="text-[#EF4444] text-[12px] mt-[4px] flex items-center gap-[4px]"><AlertCircle size={12} /> {errors.insuranceDocument}</div>}
                        </div>

                        {/* INSURANCE EXPIRY */}
                        <div className="md:col-span-2">
                            <label className="text-gray-700 font-semibold mb-2 block">Insurance Expiry Date *</label>
                            <div className="relative">
                                <Calendar className="text-blue-500 absolute left-3 top-3.5" size={18} />
                                <input
                                    type="date"
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full pl-[40px] pr-[12px] py-[12px] border-2 border-[#E5E7EB] rounded-[12px] text-[15px] outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] transition-all"
                                    value={insuranceExpiry}
                                    onChange={(e) => setInsuranceExpiry(e.target.value)}
                                />
                            </div>
                            {errors.insuranceExpiry && <div className="text-[#EF4444] text-[12px] mt-[4px] flex items-center gap-[4px]"><AlertCircle size={12} /> {errors.insuranceExpiry}</div>}
                        </div>
                    </div>

                    {/* SECTION 4: Car Images */}
                    <div className="border-l-[4px] border-blue-600 bg-blue-50 rounded-[0_12px_12px_0] p-[12px_16px] mb-[20px]">
                        <h3 className="text-blue-800 font-[700] text-[17px]">Vehicle Photos</h3>
                    </div>

                    <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-[24px] mb-[24px] shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <p className="text-gray-800 font-semibold text-[16px]">Upload your car photos</p>
                                <p className="text-gray-500 text-[13px]">Upload 4-5 clear photos of your vehicle</p>
                            </div>
                            <div className={`${carImages.length >= 4 ? 'bg-blue-600' : 'bg-blue-500'} text-white rounded-full px-[14px] py-[4px] text-[13px] font-[600]`}>
                                {carImages.length} / 5 photos
                            </div>
                        </div>

                        <div className="flex gap-[12px] flex-wrap">
                            {[0, 1, 2, 3, 4].map(index => {
                                if (carImages[index]) {
                                    return (
                                        <div key={index} className="w-[130px] h-[105px] rounded-[14px] overflow-hidden relative group shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
                                            <img src={carImages[index].preview} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="bg-red-500/90 text-white rounded-[8px] px-2.5 py-1 text-[12px] font-bold hover:bg-red-600 transition-colors"
                                                >
                                                    âœ• Remove
                                                </button>
                                            </div>
                                        </div>
                                    )
                                }
                                return (
                                    <div
                                        key={index}
                                        onClick={() => imageInputRef.current.click()}
                                        className="w-[130px] h-[105px] rounded-[14px] cursor-pointer border-2 border-dashed border-[#D1D5DB] bg-[#F9FAFB] flex flex-col items-center justify-center transition-all hover:border-[#3B82F6] hover:bg-[#EFF6FF] group"
                                    >
                                        <Camera className="text-[#9CA3AF] group-hover:text-[#3B82F6] group-hover:scale-110 transition-all" size={32} />
                                        <span className="text-[#9CA3AF] text-[12px] mt-1 font-medium">Photo {index + 1}</span>
                                        <span className="text-[#9CA3AF] text-[18px] font-light leading-none">+</span>
                                    </div>
                                )
                            })}
                            <input
                                ref={imageInputRef}
                                type="file" accept="image/*" multiple
                                style={{ display: 'none' }}
                                onChange={handleImageChange}
                            />
                        </div>

                        {errors.carImages && <div className="text-[#EF4444] text-[12px] mt-[12px] flex items-center gap-[4px] font-bold"><AlertCircle size={12} /> {errors.carImages}</div>}

                        <div className="flex gap-6 mt-4">
                            {["Front view", "Rear view", "Interior", "Side view", "Dashboard"].map(tip => (
                                <div key={tip} className="flex items-center gap-1">
                                    <Camera className="text-gray-400" size={14} />
                                    <span className="text-gray-400 text-[12px]">{tip}</span>
                                </div>
                            ))}
                            {showConfirmModalDriver && (
                                <ConfirmModal
                                    title="Are you sure?"
                                    body="Are you sure you want to reject this ride request?"
                                    confirmLabel="Yes, Reject"
                                    cancelLabel="No"
                                    danger={true}
                                    onConfirm={handleRejectBookingConfirm}
                                    onCancel={() => { setShowConfirmModalDriver(false); setActiveBookingIdDriver(null) }}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* MODAL FOOTER */}
                <div className="sticky bottom-0 border-t border-[#F3F4F6] p-[20px_32px] bg-white rounded-[0_0_24px_24px] flex justify-between items-center z-20">
                    <span className="text-[#9CA3AF] text-[13px] italic font-medium">* All fields marked with * are required</span>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => { onClose(); if (!isEdit) resetForm(); }}
                            className="px-[28px] py-[12px] border-2 border-[#E5E7EB] rounded-[12px] text-[#6B7280] font-semibold bg-white hover:bg-[#F9FAFB] hover:border-[#D1D5DB] transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className={`px-[32px] py-[12px] rounded-[12px] font-bold text-[15px] text-white flex items-center gap-2 transition-all shadow-lg ${isSubmitting ? 'bg-blue-400 cursor-not-allowed opacity-70' : 'bg-gradient-to-br from-[#1D4ED8] to-[#7C3AED] hover:opacity-90 hover:scale-[1.02] hover:shadow-[0_8px_20px_rgba(29,78,216,0.35)]'}`}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader className="animate-spin" size={16} />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <Car size={16} />
                                    <span>{isEdit ? 'Update Vehicle' : 'Save Vehicle'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

const ViewVehicleModal = ({ isOpen, onClose, vehicle }) => {
    if (!isOpen || !vehicle) return null;

    const images = vehicle.carImagePaths ? vehicle.carImagePaths.split(',') : [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
                            <Car size={32} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-800">{vehicle.company} {vehicle.model}</h3>
                            <p className="text-blue-600 font-bold tracking-widest uppercase text-sm">Full Specifications</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400 hover:text-red-500">
                        <X size={28} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    {/* Image Gallery */}
                    <section>
                        <h4 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                            <ImagePlus size={20} className="text-blue-500" /> Vehicle Gallery
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {images.length > 0 ? images.map((img, idx) => (
                                <div key={idx} className="aspect-video rounded-2xl overflow-hidden border-2 border-white shadow-md">
                                    <img src={`${BASE_URL}/${img}`} className="w-full h-full object-cover" />
                                </div>
                            )) : (
                                <div className="col-span-full py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-center text-slate-400 font-bold">
                                    No images uploaded for this vehicle
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Detailed Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <DetailItem label="Company" value={vehicle.company} />
                        <DetailItem label="Model" value={vehicle.model} />
                        <DetailItem label="Year" value={vehicle.yearOfModel} />
                        <DetailItem label="Color" value={vehicle.colour || vehicle.color} />
                        <DetailItem label="Car Number" value={vehicle.carNumber} />
                        <DetailItem label="License Number" value={vehicle.licenseNumber} />
                        <DetailItem label="KMs Driven" value={`${vehicle.kmsDriven || 0} KMs`} />
                        <DetailItem label="Capacity" value={`${vehicle.capacity} Passengers`} />
                        <DetailItem label="AC" value={vehicle.hasAC ? "Available" : "Not Available"} />
                        <DetailItem label="Audio" value={vehicle.hasAudio ? "Available" : "Not Available"} />
                        <DetailItem label="Insurance Expiry" value={vehicle.insuranceExpiry || 'N/A'} />
                        <DetailItem label="Status" value={vehicle.isActive ? "Active" : "Inactive"} />
                    </div>

                    {/* Documents */}
                    <section>
                        <h4 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                            <ShieldCheck size={20} className="text-blue-500" /> Legal Documents
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DocumentRow label="Registration Certificate (RC)" status={vehicle.rcDocumentPath ? 'Uploaded' : 'Missing'} path={vehicle.rcDocumentPath ? `${BASE_URL}/${vehicle.rcDocumentPath}` : null} />
                            <DocumentRow label="Insurance Policy" status={vehicle.insuranceDocumentPath ? 'Uploaded' : 'Missing'} path={vehicle.insuranceDocumentPath ? `${BASE_URL}/${vehicle.insuranceDocumentPath}` : null} />
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-slate-100 bg-slate-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-10 py-3 bg-white border-2 border-slate-200 text-slate-600 font-black rounded-2xl hover:bg-slate-100 transition-all uppercase tracking-widest text-sm"
                    >
                        Close Details
                    </button>
                </div>
            </div>
        </div>
    )
}

const PostRide = ({ vehicles, setActiveView, profile }) => {
    const ORS_API_KEY = import.meta.env.VITE_ORS_API_KEY

    const [step, setStep] = useState(1)
    const [fromCity, setFromCity] = useState('')
    const [toCity, setToCity] = useState('')
    const [pickupLocations, setPickupLocations] = useState(['', '', '', ''])
    const [dropLocations, setDropLocations] = useState(['', '', '', ''])
    const [distance, setDistance] = useState(0)
    const [routeCoords, setRouteCoords] = useState([])
    const [isRouteLoading, setIsRouteLoading] = useState(false)
    const [ridePosted, setRidePosted] = useState(false)
    const [postedRideData, setPostedRideData] = useState(null)

    const INDIA_CITIES = {
        Chennai: ['T Nagar', 'Chrompet', 'Tambaram', 'Adyar', 'Anna Nagar', 'Velachery', 'Porur', 'Ambattur', 'Perambur', 'Mylapore', 'Guindy', 'Kodambakkam', 'Nungambakkam', 'Egmore', 'Royapettah', 'Thiruvanmiyur', 'Sholinganallur', 'OMR', 'ECR', 'Vadapalani'],
        Mumbai: ['Andheri', 'Bandra', 'Dadar', 'Kurla', 'Thane', 'Borivali', 'Malad', 'Goregaon', 'Powai', 'Vikhroli', 'Mulund', 'Ghatkopar', 'Chembur', 'Colaba', 'Worli', 'Lower Parel', 'Juhu', 'Vile Parle', 'Santacruz', 'Kandivali'],
        Delhi: ['Connaught Place', 'Karol Bagh', 'Lajpat Nagar', 'Dwarka', 'Rohini', 'Pitampura', 'Saket', 'Vasant Kunj', 'Greater Kailash', 'Nehru Place', 'Janakpuri', 'Rajouri Garden', 'Preet Vihar', 'Mayur Vihar', 'Shahdara', 'Vikaspuri', 'Uttam Nagar', 'Paschim Vihar', 'Moti Nagar', 'Hauz Khas'],
        Bangalore: ['Koramangala', 'Indiranagar', 'Whitefield', 'Electronic City', 'HSR Layout', 'BTM Layout', 'Jayanagar', 'Malleshwaram', 'Rajajinagar', 'Yelahanka', 'Marathahalli', 'Bellandur', 'Sarjapur', 'Bannerghatta', 'JP Nagar', 'Vijayanagar', 'Hebbal', 'Yeshwanthpur', 'Basavanagudi', 'Padmanabhanagar'],
        Hyderabad: ['Banjara Hills', 'Jubilee Hills', 'Madhapur', 'Gachibowli', 'Hitec City', 'Kondapur', 'Kukatpally', 'Miyapur', 'Secunderabad', 'Begumpet', 'Ameerpet', 'SR Nagar', 'LB Nagar', 'Dilsukhnagar', 'Mehdipatnam', 'Tolichowki', 'Manikonda', 'Nanakramguda', 'Uppal', 'Hayathnagar'],
        Pune: ['Koregaon Park', 'Kalyani Nagar', 'Viman Nagar', 'Hadapsar', 'Hinjewadi', 'Wakad', 'Baner', 'Aundh', 'Kothrud', 'Shivajinagar', 'Camp', 'Deccan', 'Swargate', 'Katraj', 'Kondhwa', 'Magarpatta', 'Kharadi', 'Wagholi', 'Undri', 'Pisoli'],
        Kolkata: ['Park Street', 'Salt Lake', 'New Town', 'Howrah', 'Dum Dum', 'Behala', 'Jadavpur', 'Tollygunge', 'Gariahat', 'Ballygunge', 'Alipore', 'Ultadanga', 'Shyambazar', 'Belgharia', 'Baranagar', 'Sodepur', 'Khardah', 'Panihati', 'Kamarhati', 'Titagarh'],
        Ahmedabad: ['Navrangpura', 'Satellite', 'Prahlad Nagar', 'Bodakdev', 'Vastrapur', 'Maninagar', 'Naroda', 'Gota', 'Bopal', 'South Bopal', 'Chandkheda', 'Motera', 'Thaltej', 'Shela', 'Vejalpur', 'Nikol', 'Vastral', 'Naranpura', 'Ellis Bridge', 'Paldi'],
        Jaipur: ['Malviya Nagar', 'Vaishali Nagar', 'Mansarovar', 'C Scheme', 'Bapu Nagar', 'Tonk Road', 'Sitapura', 'Sanganer', 'Jagatpura', 'Durgapura', 'Raja Park', 'Adarsh Nagar', 'Shastri Nagar', 'Civil Lines', 'MI Road', 'Gopalpura', 'Pratap Nagar', 'Murlipura', 'Vidhyadhar Nagar', 'Nirman Nagar'],
        Surat: ['Adajan', 'Vesu', 'Pal', 'Ghod Dod Road', 'Athwalines', 'Katargam', 'Udhna', 'Piplod', 'Althan', 'Dumas', 'Citylight', 'Varachha', 'Limbayat', 'Pandesara', 'Sachin', 'Kamrej', 'Kim', 'Bardoli', 'Olpad', 'Vyara'],
        Lucknow: ['Gomti Nagar', 'Hazratganj', 'Aliganj', 'Indira Nagar', 'Mahanagar', 'Rajajipuram', 'Chinhat', 'Alambagh', 'Aminabad', 'Charbagh', 'Vikas Nagar', 'Jankipuram', 'Faizabad Road', 'Kanpur Road', 'Sitapur Road', 'Hardoi Road', 'Raebareli Road', 'Shaheed Path', 'Sushant Golf City', 'Vrindavan Yojna'],
        Nagpur: ['Dharampeth', 'Sitabuldi', 'Sadar', 'Ramdaspeth', 'Civil Lines', 'Wardha Road', 'Amravati Road', 'Hingna Road', 'Kamptee Road', 'Katol Road', 'Mankapur', 'Nandanvan', 'Pratap Nagar', 'Shankar Nagar', 'Trimurti Nagar', 'Laxmi Nagar', 'Pardi', 'Itwari', 'Mahal', 'Gandhibagh'],
        Kochi: ['Ernakulam', 'Fort Kochi', 'Mattancherry', 'Kakkanad', 'Edapally', 'Kalamassery', 'Aluva', 'Perumbavoor', 'Angamaly', 'Muvattupuzha', 'Tripunithura', 'Maradu', 'Vyttila', 'Palarivattom', 'Vytilla', 'Thevara', 'Panampilly Nagar', 'Ravipuram', 'Gandhinagar', 'Marine Drive'],
        Coimbatore: ['RS Puram', 'Gandhipuram', 'Peelamedu', 'Saibaba Colony', 'Singanallur', 'Hopes College', 'Kavundampalayam', 'Vadavalli', 'Kovaipudur', 'Podanur', 'Ondipudur', 'Sowripalayam', 'Ramanathapuram', 'Thudiyalur', 'Madukkarai', 'Sulur', 'Perur', 'Palladam', 'Tirupur', 'Mettupalayam'],
        Indore: ['Vijay Nagar', 'Palasia', 'Scheme 54', 'MG Road', 'Rajwada', 'Sapna Sangeeta', 'LIG Colony', 'HIG Colony', 'Bhawarkua', 'Khajrana', 'Lasudia', 'Bangali Square', 'Annapurna', 'Tejaji Nagar', 'Nipania', 'Rau', 'Sanwer', 'Mhow', 'Pithampur', 'Dewas'],
        Bhopal: ['MP Nagar', 'Arera Colony', 'Kolar Road', 'Habibganj', 'New Market', 'TT Nagar', 'Shivaji Nagar', 'Danish Kunj', 'Shahpura', 'Hoshangabad Road', 'Raisen Road', 'Katara Hills', 'Misrod', 'Mandideep', 'Berasia Road', 'Chhola Road', 'Piplani', 'Bairagarh', 'Karond', 'Bhadbhada'],
        Visakhapatnam: ['Dwaraka Nagar', 'MVP Colony', 'Seethammadhara', 'Jagadamba', 'Gajuwaka', 'Pendurthi', 'Bheemunipatnam', 'Rushikonda', 'Madhurawada', 'PM Palem', 'Kommadi', 'Gopalapatnam', 'Marripalem', 'Tatichetlapalem', 'Kurmannapalem', 'Akkayyapalem', 'One Town', 'NAD Junction', 'Steel Plant', 'Bhimili']
    }
    const ALL_CITIES = Object.keys(INDIA_CITIES)

    if (vehicles.length === 0) {
        return (
            <div className="bg-blue-50 border-4 border-blue-100 rounded-[32px] p-12 text-center animate-in zoom-in-95">
                <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6"><ShieldCheck size={48} /></div>
                <h2 className="text-3xl font-black text-blue-800 mb-4">No Vehicle Added</h2>
                <p className="text-blue-700 text-lg mb-8 max-w-md mx-auto">You need to register at least one vehicle before you can start posting rides for passengers.</p>
                <button onClick={() => setActiveView('vehicles')} className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black py-4 px-12 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all shimmer-button relative overflow-hidden">Add Vehicle Now</button>
            </div>
        )
    }
    if (!profile?.isVerified) {
        return (
            <div className="bg-slate-100 border-4 border-slate-300 rounded-[32px] p-12 text-center">
                <div className="w-20 h-20 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center mx-auto mb-6"><Clock size={48} /></div>
                <h2 className="text-3xl font-black text-slate-800 mb-4">Verification Pending</h2>
                <p className="text-slate-500 text-lg mb-8 max-w-md mx-auto">Your account is currently under review. Once verified, you can start posting rides!</p>
                <div className="inline-block px-10 py-4 bg-slate-200 rounded-2xl text-slate-600 font-bold uppercase tracking-widest text-sm">Waiting for Admin...</div>
            </div>
        )
    }

    const resetWizard = () => {
        setStep(1)
        setFromCity('')
        setToCity('')
        setPickupLocations(['', '', '', ''])
        setDropLocations(['', '', '', ''])
        setDistance(0)
        setFare(0)
        setRouteCoords([])
    }



    const fetchCityCoordinates = async (cityName) => {
        const response = await axios.get('https://api.openrouteservice.org/geocode/search', {
            params: {
                api_key: ORS_API_KEY,
                text: `${cityName}, India`,
                size: 1
            }
        })

        const coordinates = response?.data?.features?.[0]?.geometry?.coordinates
        if (!coordinates || coordinates.length < 2) {
            throw new Error(`Could not find coordinates for ${cityName}`)
        }

        return coordinates
    }

    const fetchRoute = async (fromCoordinates, toCoordinates) => {
        const response = await axios.post(
            'https://api.openrouteservice.org/v2/directions/driving-car/geojson',
            {
                coordinates: [fromCoordinates, toCoordinates]
            },
            {
                headers: {
                    Authorization: ORS_API_KEY,
                    'Content-Type': 'application/json'
                }
            }
        )

        const feature = response?.data?.features?.[0]
        const distanceMeters = feature?.properties?.summary?.distance
        const rawRoute = feature?.geometry?.coordinates || []

        if (!distanceMeters || rawRoute.length === 0) {
            throw new Error('Unable to fetch route distance')
        }

        const routeLatLng = rawRoute.map(([lng, lat]) => [lat, lng])
        return { distanceKm: distanceMeters / 1000, routeLatLng }
    }

    const handleFetchRouteAndNext = async () => {
        if (!fromCity || !toCity) return toast.error('Please select both cities')
        if (fromCity === toCity) return toast.error('From and To cities cannot be same')
        if (!ORS_API_KEY) return toast.error('OpenRouteService API key is missing in .env')

        setIsRouteLoading(true)
        try {
            const [fromCoordinates, toCoordinates] = await Promise.all([
                fetchCityCoordinates(fromCity),
                fetchCityCoordinates(toCity)
            ])

            const { distanceKm, routeLatLng } = await fetchRoute(fromCoordinates, toCoordinates)
            setDistance(Number(distanceKm.toFixed(2)))
            setRouteCoords(routeLatLng)
            setStep(2)
        } catch (error) {
            toast.error(error?.response?.data?.error?.message || error?.message || 'Failed to fetch route')
        } finally {
            setIsRouteLoading(false)
        }
    }

    const SelectCities = ({ fromCity, setFromCity, toCity, setToCity, onNext, distance, fare, routeCoords, isRouteLoading }) => {
        const [fromSearch, setFromSearch] = useState(fromCity || '')
        const [toSearch, setToSearch] = useState(toCity || '')
        const [showFromDropdown, setShowFromDropdown] = useState(false)
        const [showToDropdown, setShowToDropdown] = useState(false)
        const fromRef = useRef(null)
        const toRef = useRef(null)
        useEffect(() => {
            const handleClickOutside = (e) => {
                if (fromRef.current && !fromRef.current.contains(e.target)) setShowFromDropdown(false)
                if (toRef.current && !toRef.current.contains(e.target)) setShowToDropdown(false)
            }
            document.addEventListener('mousedown', handleClickOutside)
            return () => document.removeEventListener('mousedown', handleClickOutside)
        }, [])
        const filteredFrom = ALL_CITIES.filter(city => city.toLowerCase().includes(fromSearch.toLowerCase()))
        const filteredTo = ALL_CITIES.filter(city => city.toLowerCase().includes(toSearch.toLowerCase()))
        const mapCenter = routeCoords.length > 0 ? routeCoords[Math.floor(routeCoords.length / 2)] : [20.5937, 78.9629]
        const handleNext = async () => {
            await onNext()
        }
        return (
            <div className="bg-white rounded-2xl shadow-sm p-8">
                <p className="text-gray-500 text-sm mb-6">Step 1: Select Your Route</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-gray-700 font-semibold mb-2 block">From City *</label>
                        <div ref={fromRef} className="relative" onMouseDown={(e) => e.stopPropagation()}>
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input value={fromSearch} onChange={(e) => { setFromSearch(e.target.value); setFromCity(''); setShowFromDropdown(true) }} onFocus={() => setShowFromDropdown(true)} placeholder="Type a city (e.g., Chennai)" className="border-2 border-gray-200 rounded-xl p-3 pl-10 w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none w-full text-gray-700" />
                            {showFromDropdown && fromSearch.length > 0 && (
                                <div className="absolute top-full left-0 right-0 z-50 bg-white rounded-xl shadow-xl border border-gray-200 max-h-64 overflow-y-auto mt-1">
                                    {filteredFrom.length > 0 ? filteredFrom.map(city => (
                                        <button key={city} type="button" onClick={() => { setFromCity(city); setFromSearch(city); setShowFromDropdown(false) }} className="w-full text-left px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center gap-2">
                                            <MapPin className="text-blue-600" size={14} />
                                            <span>{city}</span>
                                        </button>
                                    )) : <p className="text-gray-400 text-center py-4">No cities found</p>}
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <label className="text-gray-700 font-semibold mb-2 block">To City *</label>
                        <div ref={toRef} className="relative" onMouseDown={(e) => e.stopPropagation()}>
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input value={toSearch} onChange={(e) => { setToSearch(e.target.value); setToCity(''); setShowToDropdown(true) }} onFocus={() => setShowToDropdown(true)} placeholder="Type a city (e.g., Bengaluru)" className="border-2 border-gray-200 rounded-xl p-3 pl-10 w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none w-full text-gray-700" />
                            {showToDropdown && toSearch.length > 0 && (
                                <div className="absolute top-full left-0 right-0 z-50 bg-white rounded-xl shadow-xl border border-gray-200 max-h-64 overflow-y-auto mt-1">
                                    {filteredTo.length > 0 ? filteredTo.map(city => (
                                        <button key={city} type="button" onClick={() => { setToCity(city); setToSearch(city); setShowToDropdown(false) }} className="w-full text-left px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center gap-2">
                                            <MapPin className="text-blue-600" size={14} />
                                            <span>{city}</span>
                                        </button>
                                    )) : <p className="text-gray-400 text-center py-4">No cities found</p>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {distance > 0 && (
                    <div className="mt-4 bg-blue-50 rounded-xl p-3">
                        <p className="text-blue-700 text-sm font-semibold">
                            Distance: {distance} KM
                        </p>
                    </div>
                )}
                {routeCoords.length > 0 && (
                    <div className="mt-6">
                        <MapContainer center={mapCenter} zoom={6} style={{ height: '280px', width: '100%', borderRadius: '12px' }}>
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; OpenStreetMap contributors'
                            />
                            {routeCoords.length > 0 && <Polyline positions={routeCoords} color="blue" />}
                        </MapContainer>
                    </div>
                )}
                <div className="flex justify-end mt-8">
                    <button type="button" onClick={handleNext} disabled={isRouteLoading} className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold px-8 py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 relative overflow-hidden shimmer-button disabled:opacity-70 disabled:hover:scale-100">{isRouteLoading ? 'Fetching Route...' : 'Next →'}</button>
                </div>
            </div>
        )
    }

    const SelectLocations = ({
        fromCity, toCity,
        pickupLocations, setPickupLocations,
        dropLocations, setDropLocations,
        onNext, onBack
    }) => {
        const [pickupSearches, setPickupSearches] = useState(['', '', '', ''])
        const [dropSearches, setDropSearches] = useState(['', '', '', ''])
        const [activePickupDropdown, setActivePickupDropdown] = useState(null)
        const [activeDropDropdown, setActiveDropDropdown] = useState(null)

        const fromAreas = INDIA_CITIES[fromCity] || []
        const toAreas = INDIA_CITIES[toCity] || []

        const getFilteredFromAreas = (searchText) => {
            if (!searchText.trim()) return fromAreas
            return fromAreas.filter(area => area.toLowerCase().includes(searchText.toLowerCase()))
        }

        const getFilteredToAreas = (searchText) => {
            if (!searchText.trim()) return toAreas
            return toAreas.filter(area => area.toLowerCase().includes(searchText.toLowerCase()))
        }

        const handlePickupSearchChange = (index, value) => {
            const updated = [...pickupSearches]
            updated[index] = value
            setPickupSearches(updated)
            setActivePickupDropdown(index)
            setActiveDropDropdown(null)
        }

        const handleDropSearchChange = (index, value) => {
            const updated = [...dropSearches]
            updated[index] = value
            setDropSearches(updated)
            setActiveDropDropdown(index)
            setActivePickupDropdown(null)
        }

        const selectPickupLocation = (index, area) => {
            const updatedLocations = [...pickupLocations]
            updatedLocations[index] = area
            setPickupLocations(updatedLocations)

            const updatedSearches = [...pickupSearches]
            updatedSearches[index] = area
            setPickupSearches(updatedSearches)
            setActivePickupDropdown(null)
        }

        const selectDropLocation = (index, area) => {
            const updatedLocations = [...dropLocations]
            updatedLocations[index] = area
            setDropLocations(updatedLocations)

            const updatedSearches = [...dropSearches]
            updatedSearches[index] = area
            setDropSearches(updatedSearches)
            setActiveDropDropdown(null)
        }

        const handleValidateAndNext = () => {
            const filledPickups = pickupLocations.filter(p => p && p.trim() !== '')
            const filledDrops = dropLocations.filter(d => d && d.trim() !== '')

            if (filledPickups.length === 0) {
                toast.error('Please select at least 1 pickup location')
                return
            }
            if (filledDrops.length === 0) {
                toast.error('Please select at least 1 drop location')
                return
            }
            onNext()
        }

        const getMapUrl = (city) => {
            const cityCoords = {
                Chennai: [13.0827, 80.2707],
                Mumbai: [19.0760, 72.8777],
                Delhi: [28.6139, 77.2090],
                Bangalore: [12.9716, 77.5946],
                Hyderabad: [17.3850, 78.4867],
                Pune: [18.5204, 73.8567],
                Kolkata: [22.5726, 88.3639],
                Ahmedabad: [23.0225, 72.5714],
                Jaipur: [26.9124, 75.7873],
                Surat: [21.1702, 72.8311],
                Lucknow: [26.8467, 80.9462],
                Nagpur: [21.1458, 79.0882],
                Kochi: [9.9312, 76.2673],
                Coimbatore: [11.0168, 76.9558],
                Indore: [22.7196, 75.8577],
                Bhopal: [23.2599, 77.4126],
                Visakhapatnam: [17.6868, 83.2185]
            }
            const [lat, lon] = cityCoords[city] || [20.5937, 78.9629]
            return `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.15},${lat - 0.15},${lon + 0.15},${lat + 0.15}&layer=mapnik&marker=${lat},${lon}`
        }

        return (
            <div>
                <div className="bg-blue-50 rounded-xl p-4 mb-6">
                    <p className="text-blue-600 font-semibold text-sm mb-2">Review Your Route</p>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-gray-500 text-xs">From City</p>
                            <p className="font-bold text-gray-800 text-lg">{fromCity}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs">To City</p>
                            <p className="font-bold text-gray-800 text-lg">{toCity}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-6 flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">ⓘ</span>
                    <p className="text-blue-700 text-sm">Note: Your saved vehicle details (photos, type, model, etc.) will be automatically used for this ride</p>
                </div>

                <p className="font-semibold text-gray-800 mb-1">Select 4 Pickup Locations in {fromCity} *</p>
                <p className="text-gray-500 text-sm mb-6">Choose 4 areas in {fromCity} where passengers can be picked up</p>

                <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                        <p className="font-semibold text-gray-800 mb-4">Select 4 Pickup Locations in {fromCity} *</p>
                        {[0, 1, 2, 3].map(index => (
                            <div key={index} className="mb-4">
                                <p className="text-gray-700 font-medium text-sm mb-1">Pickup Location {index + 1}</p>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={pickupSearches[index]}
                                        onChange={(e) => handlePickupSearchChange(index, e.target.value)}
                                        onFocus={() => {
                                            setActivePickupDropdown(index)
                                            setActiveDropDropdown(null)
                                        }}
                                        placeholder={`Search a place in ${fromCity}`}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-gray-700 text-sm"
                                    />
                                    {activePickupDropdown === index && (
                                        <div className="absolute top-full left-0 right-0 z-50 bg-white rounded-xl shadow-xl border border-gray-200 max-h-52 overflow-y-auto mt-1">
                                            {getFilteredFromAreas(pickupSearches[index]).length > 0 ? (
                                                getFilteredFromAreas(pickupSearches[index]).map(area => (
                                                    <div
                                                        key={area}
                                                        onMouseDown={(e) => {
                                                            e.preventDefault()
                                                            selectPickupLocation(index, area)
                                                        }}
                                                        className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer text-sm text-gray-700 flex items-center gap-2 border-b border-gray-50 last:border-0"
                                                    >
                                                        <span className="text-blue-400">📍</span>
                                                        {area}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="px-4 py-4 text-center text-gray-400 text-sm">No areas found</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div>
                        <p className="font-semibold text-gray-800 mb-4">Select 4 Drop Locations in {toCity} *</p>
                        {[0, 1, 2, 3].map(index => (
                            <div key={index} className="mb-4">
                                <p className="text-gray-700 font-medium text-sm mb-1">Drop Location {index + 1}</p>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={dropSearches[index]}
                                        onChange={(e) => handleDropSearchChange(index, e.target.value)}
                                        onFocus={() => {
                                            setActiveDropDropdown(index)
                                            setActivePickupDropdown(null)
                                        }}
                                        placeholder={`Search a place in ${toCity}`}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-gray-700 text-sm"
                                    />
                                    {activeDropDropdown === index && (
                                        <div className="absolute top-full left-0 right-0 z-50 bg-white rounded-xl shadow-xl border border-gray-200 max-h-52 overflow-y-auto mt-1">
                                            {getFilteredToAreas(dropSearches[index]).length > 0 ? (
                                                getFilteredToAreas(dropSearches[index]).map(area => (
                                                    <div
                                                        key={area}
                                                        onMouseDown={(e) => {
                                                            e.preventDefault()
                                                            selectDropLocation(index, area)
                                                        }}
                                                        className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer text-sm text-gray-700 flex items-center gap-2 border-b border-gray-50 last:border-0"
                                                    >
                                                        <span className="text-indigo-400">📍</span>
                                                        {area}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="px-4 py-4 text-center text-gray-400 text-sm">No areas found</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <p className="font-semibold text-gray-700 mb-2 flex items-center gap-2">📍 {fromCity}</p>
                        <iframe
                            src={getMapUrl(fromCity)}
                            width="100%"
                            height="280"
                            style={{ border: 'none', borderRadius: '12px' }}
                            title="From City Map"
                        />
                    </div>
                    <div>
                        <p className="font-semibold text-gray-700 mb-2 flex items-center gap-2">📍 {toCity}</p>
                        <iframe
                            src={getMapUrl(toCity)}
                            width="100%"
                            height="280"
                            style={{ border: 'none', borderRadius: '12px' }}
                            title="To City Map"
                        />
                    </div>
                </div>

                <div className="bg-blue-50 rounded-xl p-3 mb-6 flex items-center gap-2">
                    <span className="text-blue-500">ℹ️</span>
                    <p className="text-blue-700 text-sm">Maps show approximate city locations for route planning.</p>
                </div>

                <div className="flex justify-between mt-4">
                    <button
                        onClick={onBack}
                        className="px-6 py-3 border-2 border-gray-200 rounded-xl text-gray-600 font-semibold hover:bg-gray-50 transition-all"
                    >
                        ← Back
                    </button>
                    <button
                        onClick={handleValidateAndNext}
                        className="px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:shadow-lg hover:scale-105 transition-all relative overflow-hidden shimmer-button"
                    >
                        Next →
                    </button>
                </div>
            </div>
        )
    }

    const RideDetails = ({ fromCity, toCity, pickupLocations, dropLocations, vehicles, onBack, onSubmit, onCancel, distance }) => {
        const [date, setDate] = useState('')
        const [time, setTime] = useState('')
        const [seats, setSeats] = useState(2)
        const [basePrice, setBasePrice] = useState('')
        const [farePerSeat, setFarePerSeat] = useState('')
        const [perKmRate, setPerKmRate] = useState('')
        const [priceErrors, setPriceErrors] = useState({})
        const [isPosting, setIsPosting] = useState(false)

        const validatePrices = () => {
            const errors = {}
            if (!basePrice || Number(basePrice) < 1) errors.basePrice = 'Base Price must be at least ₹1'
            if (!farePerSeat || Number(farePerSeat) < 1) errors.farePerSeat = 'Fare Per Seat must be at least ₹1'
            if (!perKmRate || Number(perKmRate) < 1) errors.perKmRate = 'Per KM Fare must be at least ₹1'
            return errors
        }

        const handlePost = async () => {
            if (!date || !time || !seats) return toast.error('Please fill date, time and seats')
            const errors = validatePrices()
            if (Object.keys(errors).length > 0) {
                setPriceErrors(errors)
                toast.error('Please fill all price fields correctly')
                return
            }
            setPriceErrors({})
            setIsPosting(true)
            const rideData = {
                fromCity,
                toCity,
                pickupLocations: pickupLocations.filter(Boolean),
                dropLocations: dropLocations.filter(Boolean),
                travelDate: date,
                departureTime: time,
                totalSeats: Number(seats),
                basePrice: Number(basePrice),
                farePerSeat: Number(farePerSeat),
                pricePerKm: Number(perKmRate),
                vehicleId: vehicles[0]?.id
            }
            try {
                await authService.postRide(rideData)
                toast.success('🎉 Ride posted successfully!')

                const locationPairs = pickupLocations
                    .filter(Boolean)
                    .map((pickup, index) => {
                        const drop = dropLocations[index]
                        if (drop) return { pickupLabel: pickup, dropLabel: drop }
                        return null
                    })
                    .filter(Boolean)

                setPostedRideData({ locationPairs })
                setRidePosted(true)
                setDate(''); setTime(''); setSeats(2)
                setBasePrice(''); setFarePerSeat(''); setPerKmRate('')
            } catch (error) {
                toast.error(error?.response?.data?.message || 'Failed to post ride')
            } finally {
                setIsPosting(false)
            }
        }

        return (
            <div className="bg-white rounded-2xl shadow-sm p-8">
                <p className="text-gray-500 text-sm mb-4">Step 3: Ride Details</p>
                <div className="bg-blue-50 rounded-xl p-4 mb-6">
                    <p className="text-blue-700 font-semibold text-sm mb-2">Review Your Route</p>
                    <p className="font-bold text-lg text-gray-800">{fromCity} → {toCity}</p>
                    <p className="text-gray-600 text-sm mt-2">📍 Pickups: {pickupLocations.filter(Boolean).join(' • ')}</p>
                    <p className="text-gray-600 text-sm">📍 Drops: {dropLocations.filter(Boolean).join(' • ')}</p>
                    {distance > 0 && <p className="text-gray-600 text-sm mt-1">🛣️ Distance: {distance} KM</p>}
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-6">
                    <p className="text-blue-700 text-sm">
                        ✓ Note: Your saved vehicle details (photos, type, model, etc.) will be automatically used for this ride
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div><label className="text-gray-700 font-semibold mb-1 block">Date *</label><input type="date" min={new Date().toISOString().split('T')[0]} value={date} onChange={(e) => setDate(e.target.value)} className="border-2 border-gray-200 rounded-xl p-3 w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-gray-700" /></div>
                    <div><label className="text-gray-700 font-semibold mb-1 block">Time *</label><input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="border-2 border-gray-200 rounded-xl p-3 w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-gray-700" /></div>
                    <div><label className="text-gray-700 font-semibold mb-1 block">Available Seats *</label><input type="number" min={1} max={8} value={seats} onChange={(e) => setSeats(e.target.value)} className="border-2 border-gray-200 rounded-xl p-3 w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-gray-700" /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                        <label className="text-gray-700 font-semibold mb-1 block">Base Price (₹) *</label>
                        <input
                            type="number"
                            min={1}
                            value={basePrice}
                            onChange={(e) => { setBasePrice(e.target.value); setPriceErrors(prev => ({ ...prev, basePrice: '' })) }}
                            placeholder="e.g. 100"
                            className={`border-2 rounded-xl p-3 w-full outline-none text-gray-700 focus:ring-2 focus:ring-blue-100 transition-colors ${priceErrors.basePrice ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-blue-500'}`}
                        />
                        {priceErrors.basePrice && <p className="text-red-500 text-xs mt-1">{priceErrors.basePrice}</p>}
                    </div>
                    <div>
                        <label className="text-gray-700 font-semibold mb-1 block">Fare Per Seat (₹) *</label>
                        <input
                            type="number"
                            min={1}
                            value={farePerSeat}
                            onChange={(e) => { setFarePerSeat(e.target.value); setPriceErrors(prev => ({ ...prev, farePerSeat: '' })) }}
                            placeholder="e.g. 250"
                            className={`border-2 rounded-xl p-3 w-full outline-none text-gray-700 focus:ring-2 focus:ring-blue-100 transition-colors ${priceErrors.farePerSeat ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-blue-500'}`}
                        />
                        {priceErrors.farePerSeat && <p className="text-red-500 text-xs mt-1">{priceErrors.farePerSeat}</p>}
                    </div>
                    <div>
                        <label className="text-gray-700 font-semibold mb-1 block">Per KM Fare (₹) *</label>
                        <input
                            type="number"
                            min={1}
                            value={perKmRate}
                            onChange={(e) => { setPerKmRate(e.target.value); setPriceErrors(prev => ({ ...prev, perKmRate: '' })) }}
                            placeholder="e.g. 12"
                            className={`border-2 rounded-xl p-3 w-full outline-none text-gray-700 focus:ring-2 focus:ring-blue-100 transition-colors ${priceErrors.perKmRate ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-blue-500'}`}
                        />
                        {priceErrors.perKmRate && <p className="text-red-500 text-xs mt-1">{priceErrors.perKmRate}</p>}
                    </div>
                </div>
                <div className="flex justify-between mt-8">
                    <button type="button" onClick={onBack} className="border-2 border-gray-200 text-gray-600 font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 transition-all">← Back</button>
                    <div className="flex gap-3">
                        <button type="button" onClick={onCancel} className="text-gray-600 font-semibold px-6 py-3 rounded-xl hover:bg-gray-100 transition-all">Cancel</button>
                        <button type="button" onClick={handlePost} disabled={isPosting} className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold px-8 py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-70 disabled:hover:scale-100 relative overflow-hidden shimmer-button">{isPosting ? <span className="flex items-center gap-2"><Loader className="animate-spin" size={16} />Posting...</span> : 'Post Ride'}</button>
                    </div>
                </div>
            </div>
        )
    }

    const steps = [{ num: 1, label: 'Route' }, { num: 2, label: 'Locations' }, { num: 3, label: 'Details' }]

    return (
        <div className="bg-white rounded-2xl shadow-sm min-h-[600px]">
            <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"><Plus size={18} /></div>
                <h1 className="font-bold text-xl text-gray-800">Post a New Ride</h1>
            </div>
            <div className="px-6 pt-6">
                <div className="flex items-center justify-center gap-0 mb-8">
                    {steps.map((s, idx) => (
                        <div key={s.num} className="flex items-center">
                            <div className="flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${step > s.num ? 'bg-blue-600 text-white' : step === s.num ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>{step > s.num ? '✓' : s.num}</div>
                                <span className="text-xs mt-1 text-gray-500">{s.label}</span>
                            </div>
                            {idx < steps.length - 1 && <div className={`w-24 h-0.5 mb-4 ${step > s.num ? 'bg-blue-600' : 'bg-gray-200'}`} />}
                        </div>
                    ))}
                </div>
            </div>
            <div className="px-6 pb-6">
                {step === 1 && <SelectCities fromCity={fromCity} setFromCity={setFromCity} toCity={toCity} setToCity={setToCity} onNext={handleFetchRouteAndNext} distance={distance} routeCoords={routeCoords} isRouteLoading={isRouteLoading} />}
                {step === 2 && <SelectLocations fromCity={fromCity} toCity={toCity} pickupLocations={pickupLocations} setPickupLocations={setPickupLocations} dropLocations={dropLocations} setDropLocations={setDropLocations} onBack={() => setStep(1)} onNext={() => setStep(3)} />}
                {step === 3 && !ridePosted && <RideDetails fromCity={fromCity} toCity={toCity} pickupLocations={pickupLocations} dropLocations={dropLocations} vehicles={vehicles} onBack={() => setStep(2)} onCancel={resetWizard} onSubmit={() => { resetWizard(); setActiveView('my-rides') }} distance={distance} />}
                {ridePosted && postedRideData && (
                    <div>
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                                    <CheckCircle className="text-white" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-blue-800">Ride Posted Successfully!</h2>
                                    <p className="text-blue-600">Your ride has been posted and is now visible to passengers</p>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg p-4">
                                <p className="font-semibold text-gray-800 mb-2">🚗 {fromCity} → {toCity}</p>
                                <p className="text-sm text-gray-600">Posted on: {new Date().toLocaleDateString()}</p>
                            </div>
                        </div>

                        {/* Dynamic Route Map */}
                        {postedRideData.locationPairs?.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">📍 Your Route Map</h3>
                                <DynamicRouteMap locationPairs={postedRideData.locationPairs} />
                            </div>
                        )}

                        <div className="flex justify-between mt-8">
                            <button
                                onClick={() => {
                                    setRidePosted(false);
                                    setPostedRideData(null);
                                    resetWizard();
                                }}
                                className="border-2 border-gray-200 text-gray-600 font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 transition-all"
                            >
                                Post Another Ride
                            </button>
                            <button
                                onClick={() => {
                                    setRidePosted(false);
                                    setPostedRideData(null);
                                    resetWizard();
                                    setActiveView('my-rides');
                                }}
                                className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold px-8 py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200"
                            >
                                View My Rides
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

const MyRides = () => {
    const [activeTab, setActiveTab] = useState('my-rides')
    const [rides, setRides] = useState([])
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(false)
    const [reschedulingRide, setReschedulingRide] = useState(null)
    const [showConfirmModalDriver, setShowConfirmModalDriver] = useState(false)
    const [activeBookingIdDriver, setActiveBookingIdDriver] = useState(null)
    const activeBookingIdDriverRef = useRef(null)

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            fetchRides()
            if (activeTab === 'my-bookings' || activeTab === 'accept-decline') {
                fetchBookings()
            }
        }
    }, [activeTab])

    const fetchRides = async () => {
        // Check token before making API call
        const token = localStorage.getItem('token')
        if (!token) {
            console.warn('No authentication token found. Skipping rides fetch.')
            setRides([])
            return
        }

        try {
            const res = await authService.getDriverRides()
            const activeRides = (res.data || []).filter(ride => ride.status !== 'CANCELLED')
            setRides(activeRides)
        } catch (err) {
            // Handle different error statuses gracefully
            if (err.response?.status === 500) {
                console.warn('Server error (500): Failed to fetch rides. Driver may not be authenticated or no rides available.')
            } else if (err.response?.status === 401) {
                console.warn('Unauthorized (401): Token invalid or expired. Please login again.')
                setRides([])
            } else if (err.response?.status === 403) {
                console.warn('Forbidden (403): User is not authorized as a driver.')
                setRides([])
            } else {
                console.warn('Failed to fetch rides:', err?.message || 'Unknown error')
            }
            
            // Always set rides to empty array on failure to prevent crashes
            setRides([])
        }
    }

    const fetchBookings = async () => {
        setLoading(true)
        try {
            const res = await authService.getDriverBookings()
            setBookings(res.data || [])
        } catch (err) {
            console.error(err)
            setBookings([])
        } finally {
            setLoading(false)
        }
    }

    const handleCancelRide = async (rideId) => {
        if (!window.confirm('Are you sure you want to cancel this ride?')) return
        try {
            await authService.cancelRide(rideId)
            toast.success('Ride cancelled successfully')
            setRides(rides.filter(r => r.id !== rideId))
        } catch (err) {
            toast.error('Failed to cancel ride')
        }
    }

    const handleRescheduleRide = (ride) => {
        setReschedulingRide(ride)
    }

    const handleConfirmReschedule = async () => {
        if (!reschedulingRide) return

        try {
            // Update ride with new date/time
            await authService.updateRide(reschedulingRide.id, {
                travelDate: reschedulingRide.travelDate,
                departureTime: reschedulingRide.departureTime
            })
            toast.success('Ride rescheduled successfully')
            setReschedulingRide(null)
            fetchRides()
        } catch (err) {
            toast.error('Failed to reschedule ride')
        }
    }

    const handleApproveBooking = async (bookingId) => {
        try {
            const res = await authService.approveBooking(bookingId)
            toast.success('Booking approved')
            fetchBookings()
        } catch (err) {
            // try to show server message if available
            const msg = err?.response?.data || err?.messsage || 'Failed to approve booking';
            toast.error(msg)
            console.error('approveBooking error', err)
        }
    }

    const handleRejectBooking = (bookingId) => {
        // store id in ref and state (state may be undefined in older bundles)
        try {
            if (typeof setActiveBookingIdDriver === 'function') setActiveBookingIdDriver(bookingId)
        } catch (e) {
            // ignore
        }
        activeBookingIdDriverRef.current = bookingId
        setShowConfirmModalDriver(true)
    }

    const handleRejectBookingConfirm = async () => {
        const bookingId = activeBookingIdDriverRef.current || activeBookingIdDriver
        if (!bookingId) return
        try {
            await authService.rejectBooking(bookingId)
            toast.success('Booking rejected')
            fetchBookings()
        } catch (err) {
            toast.error('Failed to reject booking')
        } finally {
            setShowConfirmModalDriver(false)
            try { if (typeof setActiveBookingIdDriver === 'function') setActiveBookingIdDriver(null) } catch(e){}
            activeBookingIdDriverRef.current = null
        }
    }

    const tabs = [
        { id: 'my-rides', label: 'My Rides', icon: Car },
        { id: 'my-bookings', label: 'My Bookings', icon: Users },
        { id: 'accept-decline', label: 'Accept/Decline', icon: CheckCircle },
        { id: 'history', label: 'History', icon: Clock }
    ]

    return (
        <div>
            {/* Tab Buttons */}
            <div className="flex gap-2 mb-6">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === tab.id
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                            : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
                            }`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* My Rides Tab Content */}
            {activeTab === 'my-rides' && (
                !rides || rides.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl">
                        <Car size={64} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-bold text-gray-800 mb-2">No Rides Posted</h3>
                        <p className="text-gray-500">Post your first ride today!</p>
                    </div>
                ) : (
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">My Rides ({rides.length})</h2>
                        {rides && rides.length > 0 && rides.map((ride, idx) => (
                            <div key={ride.id || idx} className="bg-white border rounded-2xl p-5 mb-4 border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                    <div>
                                        <p className="font-bold text-gray-800">{ride.fromCity} → {ride.toCity}</p>
                                        <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600">{ride.status || 'SCHEDULED'}</span>
                                    </div>
                                    <p className="text-blue-600 font-bold">Base Fare: ₹{ride.baseFare || 0}</p>
                                </div>
                                <div className="flex flex-wrap gap-6 text-sm text-gray-500 mt-2">
                                    <span>📅 {ride.travelDate || '-'}</span>
                                    <span>🕐 {ride.departureTime || '-'}</span>
                                    <span>👥 {ride.availableSeats || 0}/{ride.totalSeats || 0} seats</span>
                                </div>

                                {/* Action buttons */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleRescheduleRide(ride)}
                                        className="px-3 py-1.5 rounded-lg border border-blue-300 text-blue-600 text-sm font-semibold"
                                    >
                                        Reschedule
                                    </button>
                                    <button
                                        onClick={() => handleCancelRide(ride.id)}
                                        className="px-3 py-1.5 rounded-lg border border-red-300 text-red-600 text-sm font-semibold"
                                    >
                                        Cancel
                                    </button>
                                </div>

                                {/* Dynamic Route Map for this ride */}
                                {ride.pickupLocations && ride.dropLocations && (
                                    <div className="mt-4">
                                        <h4 className="text-sm font-semibold text-gray-700 mb-2">📍 Route Map</h4>
                                        <DynamicRouteMap
                                            locationPairs={
                                                JSON.parse(ride.pickupLocations || '[]')
                                                    .map((pickup, index) => {
                                                        const dropLocations = JSON.parse(ride.dropLocations || '[]');
                                                        const drop = dropLocations[index];
                                                        if (drop) {
                                                            return {
                                                                pickupLabel: pickup,
                                                                dropLabel: drop
                                                            };
                                                        }
                                                        return null;
                                                    })
                                                    .filter(Boolean)
                                            }
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )
            )}

            {/* Reschedule Modal */}
            {reschedulingRide && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Reschedule Ride</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Travel Date</label>
                                <input
                                    type="date"
                                    value={reschedulingRide.travelDate}
                                    onChange={e => setReschedulingRide({ ...reschedulingRide, travelDate: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Departure Time</label>
                                <input
                                    type="time"
                                    value={reschedulingRide.departureTime}
                                    onChange={e => setReschedulingRide({ ...reschedulingRide, departureTime: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setReschedulingRide(null)}
                                className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-600 font-bold rounded-xl"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmReschedule}
                                className="flex-1 px-4 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700"
                            >
                                Confirm Reschedule
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* My Bookings Tab */}
            {activeTab === 'my-bookings' && (
                <div className="text-center py-20 bg-white rounded-2xl">
                    <Users size={64} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">My Bookings</h3>
                    <p className="text-gray-500">View all your ride bookings</p>
                </div>
            )}

            {/* Accept/Decline Tab */}
            {activeTab === 'accept-decline' && (
                <div className="bg-white rounded-2xl p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Booking Requests ({bookings.length})</h2>
                    {loading ? (
                        <div className="text-center py-10">
                            <Loader className="animate-spin mx-auto" size={32} />
                            <p className="text-gray-500 mt-2">Loading bookings...</p>
                        </div>
                    ) : bookings.length === 0 ? (
                        <div className="text-center py-10">
                            <CheckCircle size={64} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500">No pending booking requests</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {bookings.map(booking => (
                                <div key={booking.id} className="border rounded-xl p-4 border-l-4 border-l-blue-500">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <p className="font-semibold text-gray-800">
                                                {booking.pickupLocation} → {booking.dropLocation}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {booking.seatsBooked} seat(s) • ₹{booking.totalFare}
                                            </p>
                                        </div>
                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600">
                                            {booking.status}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleApproveBooking(booking.id)}
                                            className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
                                        >
                                            ✓ Approve
                                        </button>
                                        <button
                                            onClick={() => handleRejectBooking(booking.id)}
                                            className="px-4 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600"
                                        >
                                            ✕ Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
                <div className="text-center py-20 bg-white rounded-2xl">
                    <Clock size={64} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Trip History</h3>
                    <p className="text-gray-500">View your completed rides</p>
                </div>
            )}

            {/* Confirm Modal for Reject Booking */}
            {showConfirmModalDriver && (
                <ConfirmModal
                    title="Are you sure?"
                    body="Are you sure you want to reject this ride request?"
                    confirmLabel="Yes, Reject"
                    cancelLabel="No"
                    danger={true}
                    onConfirm={handleRejectBookingConfirm}
                    onCancel={() => { setShowConfirmModalDriver(false); setActiveBookingIdDriver(null) }}
                />
            )}
        </div>
    )
}

export default DriverDashboard

