import { Link, useNavigate } from 'react-router-dom'
import { Car } from 'lucide-react'

const Navbar = () => {
    const navigate = useNavigate()

    return (
        <nav
            className="sticky top-0 z-50 w-full"
            style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255,255,255,0.3)',
                boxShadow: '0 4px 30px rgba(0,0,0,0.08)',
                padding: 0
            }}
        >
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2">
                    <Car size={28} className="text-blue-600" />
                    <span className="text-2xl font-bold italic leading-none">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Smart</span>
                        <span className="text-indigo-600">Ride</span>
                    </span>
                </Link>

                <div className="flex items-center gap-8">
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="text-gray-600 hover:text-gray-900 font-medium text-base bg-transparent border-none p-0"
                    >
                        Home
                    </button>
                    <Link
                        to="/about"
                        className="text-gray-600 hover:text-gray-900 font-medium text-base"
                    >
                        About Us
                    </Link>
                    <button
                        type="button"
                        onClick={() => navigate('/login-select')}
                        className="text-gray-600 hover:text-gray-900 font-medium text-base bg-transparent border-none p-0"
                    >
                        Login
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/register-select')}
                        className="text-white font-bold px-6 py-2.5 rounded-full transition-all duration-200 hover:opacity-90 hover:scale-105 shadow-lg border-none"
                        style={{ background: 'linear-gradient(135deg, #1D4ED8, #1E40AF)' }}
                    >
                        Sign Up
                    </button>
                </div>
            </div>
        </nav>
    )
}

export default Navbar
