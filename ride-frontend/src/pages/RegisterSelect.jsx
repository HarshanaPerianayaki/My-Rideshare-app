import { useNavigate } from 'react-router-dom'
import { Shield, Car, User, ArrowLeft, ArrowRight } from 'lucide-react'

const RegisterSelect = () => {
    const navigate = useNavigate()

    const roles = [
        {
            id: 'admin',
            title: "Register as Admin",
            desc: "Platform administrator",
            icon: Shield,
            path: "/admin/register",
            selectedGradient: "from-blue-800 to-indigo-900",
            iconColor: "text-blue-800"
        },
        {
            id: 'driver',
            title: "Register as Driver",
            desc: "Start earning by sharing rides",
            icon: Car,
            path: "/driver/register",
            selectedGradient: "from-blue-600 to-indigo-700",
            iconColor: "text-blue-600"
        },
        {
            id: 'passenger',
            title: "Register as Passenger",
            desc: "Start your journey with us",
            icon: User,
            path: "/passenger/register",
            selectedGradient: "from-indigo-500 to-blue-600",
            iconColor: "text-indigo-600"
        }
    ]

    return (
        <div className="relative w-full min-h-screen bg-professional-blue floating-shapes flex flex-col items-center justify-center px-6 py-16 overflow-hidden">
            <button
                type="button"
                onClick={() => navigate('/')}
                className="absolute top-6 left-6 text-white/60 hover:text-white flex items-center gap-2 text-sm bg-transparent border-none p-0"
            >
                <ArrowLeft size={16} /> Back to Home
            </button>
            <div className="bg-white/95 backdrop-blur-sm w-full max-w-md rounded-2xl shadow-2xl p-8 animate-in fade-in zoom-in duration-500">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Account</h1>
                    <p className="text-gray-500">Join us today and start your journey</p>
                </div>

                <div className="space-y-4">
                    {roles.map((role) => (
                        <div
                            key={role.id}
                            onClick={() => navigate(role.path)}
                            className="glass-effect group relative flex items-center p-4 bg-white border border-gray-100 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] overflow-hidden"
                        >
                            {/* Hover Gradient Overlay */}
                            <div className={`absolute inset-0 bg-gradient-to-r ${role.selectedGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                            <div className="relative z-10 flex items-center w-full">
                                <div className={`w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center mr-4 group-hover:bg-white/20 transition-colors`}>
                                    <role.icon className={`${role.iconColor} group-hover:text-white transition-colors`} size={24} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-900 group-hover:text-white transition-colors">{role.title}</h3>
                                    <p className="text-sm text-gray-500 group-hover:text-white/80 transition-colors">{role.desc}</p>
                                </div>
                                <ArrowRight className="text-gray-300 group-hover:text-white transition-colors" size={20} />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-10 text-center">
                    <p className="text-gray-500">
                        Already have an account?{" "}
                        <span
                            onClick={() => navigate('/login-select')}
                            className="text-blue-600 font-bold cursor-pointer hover:underline transition"
                        >
                            Login
                        </span>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default RegisterSelect
