import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import {
    Car, Shield, Clock, Leaf, Users, ChevronRight,
    Star, Mail, Phone, MapPin, Instagram, Twitter,
    Facebook, Linkedin, ArrowRight
} from 'lucide-react'

const Home = () => {
    const navigate = useNavigate()
    const scrollToGetStarted = () => {
        const element = document.getElementById('get-started')
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
        }
    }

    return (
        <div className="w-full min-h-screen overflow-x-hidden flex flex-col animate-in fade-in duration-700">
            <Navbar />
            {/* === HERO SECTION === */}
            <section className="relative w-full min-h-screen bg-animated-dark floating-shapes flex items-center justify-center pt-20 overflow-hidden">
                <div
                    className="absolute inset-0 z-0 opacity-30"
                    style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1600')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                />

                <div className="max-w-7xl mx-auto px-6 relative z-20 grid md:grid-cols-2 gap-12 items-center">
                    {/* Left Side Content Only */}
                    <div className="space-y-8 max-w-2xl">
                        <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium">
                            🚗 Trusted by 10,000+ riders
                        </span>
                        <div className="space-y-4">
                            <h1 className="text-6xl md:text-8xl font-extrabold text-white leading-tight">
                                Share the Ride.
                            </h1>
                            <h2 className="text-6xl md:text-8xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#0D9488] to-teal-400">
                                Enjoy the Journey.
                            </h2>
                        </div>
                        <p className="text-xl text-gray-300 leading-relaxed font-medium">
                            Experience the joy of shared journeys. Join a community
                            of travelers reducing carbon footprints while making meaningful
                            connections on the road.
                        </p>
                        <div className="pt-4">
                            <button
                                onClick={() => navigate('/register-select')}
                                className="bg-[#0D9488] hover:bg-[#0F766E] text-white px-10 py-5 rounded-2xl font-bold flex items-center gap-2 transition-all hover:scale-105 shadow-xl shadow-teal-900/40 group active:scale-95 text-lg"
                            >
                                Get Started <ChevronRight className="group-hover:translate-x-1 transition" size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Right Side: Stats Card */}
                    <div className="hidden md:flex justify-end pr-12">
                        <div className="bg-white/10 backdrop-blur-xl p-10 rounded-[40px] border border-white/20 shadow-2xl space-y-10 w-80 animate-bounce-slow transition-all duration-300 hover:scale-105 hover:shadow-xl">
                            <div className="space-y-1 text-center">
                                <h3 className="text-4xl font-black text-white">10K+</h3>
                                <p className="text-teal-300 font-bold uppercase text-xs tracking-widest">Active Riders</p>
                            </div>
                            <div className="space-y-1 text-center">
                                <h3 className="text-4xl font-black text-white">500+</h3>
                                <p className="text-teal-300 font-bold uppercase text-xs tracking-widest">Daily Rides</p>
                            </div>
                            <div className="space-y-1 text-center">
                                <h3 className="text-4xl font-black text-white">4.8★</h3>
                                <p className="text-teal-300 font-bold uppercase text-xs tracking-widest">Average Rating</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* === HOW IT WORKS SECTION === */}
            <section className="w-full bg-gradient-to-b from-white via-slate-50/60 to-white py-24 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <h2 className="text-4xl md:text-5xl font-black text-[#0F172A] mb-4">How It Works</h2>
                    <p className="text-gray-500 mb-20 max-w-xl mx-auto">Discover how easy it is to share rides with SmartRide.</p>

                    <div className="relative grid md:grid-cols-4 gap-12">
                        {/* Connecting Line */}
                        <div className="hidden md:block absolute top-[48px] left-[15%] right-[15%] h-0.5 border-b-2 border-dotted border-purple-200 z-0" />

                        {/* Step 1 */}
                        <div className="relative z-10 space-y-6 flex flex-col items-center group">
                            <div className="w-24 h-24 rounded-full bg-[#7C3AED] text-white flex items-center justify-center text-3xl font-black shadow-xl shadow-purple-200 group-hover:scale-110 transition duration-300">
                                1
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-[#0F172A] mb-2 px-2">Register</h3>
                                <p className="text-gray-500 text-sm leading-relaxed px-4">
                                    Choose your role and submit personal, address, and document details.
                                </p>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="relative z-10 space-y-6 flex flex-col items-center group">
                            <div className="w-24 h-24 rounded-full bg-[#7C3AED] text-white flex items-center justify-center text-3xl font-black shadow-xl shadow-purple-200 group-hover:scale-110 transition duration-300">
                                2
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-[#0F172A] mb-2">Admin Verification</h3>
                                <p className="text-gray-500 text-sm leading-relaxed px-4">
                                    Admin reviews your details and approves or rejects the registration.
                                </p>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="relative z-10 space-y-6 flex flex-col items-center group">
                            <div className="w-24 h-24 rounded-full bg-[#7C3AED] text-white flex items-center justify-center text-3xl font-black shadow-xl shadow-purple-200 group-hover:scale-110 transition duration-300">
                                3
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-[#0F172A] mb-2 px-2">Get Credentials</h3>
                                <p className="text-gray-500 text-sm leading-relaxed px-4">
                                    Approved users receive login credentials via email.
                                </p>
                            </div>
                        </div>

                        {/* Step 4 */}
                        <div className="relative z-10 space-y-6 flex flex-col items-center group">
                            <div className="w-24 h-24 rounded-full bg-[#7C3AED] text-white flex items-center justify-center text-3xl font-black shadow-xl shadow-purple-200 group-hover:scale-110 transition duration-300">
                                4
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-[#0F172A] mb-2">Login & Update</h3>
                                <p className="text-gray-500 text-sm leading-relaxed px-4">
                                    Login using the provided password and update it from your profile.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* === WHY CHOOSE US SECTION === */}
            <section className="w-full bg-gradient-to-b from-[#F8FAFC] via-white/60 to-[#F8FAFC] py-24">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black text-[#0F172A] mb-4">Why Choose SmartRide?</h2>
                        <p className="text-gray-500">We make shared travel easy, safe, and reliable.</p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8">
                        {/* Verified Community */}
                        <div className="bg-white p-8 rounded-3xl transition-all duration-300 hover:shadow-2xl hover:shadow-purple-100 hover:-translate-y-2 group">
                            <div className="w-14 h-14 bg-purple-50 text-[#7C3AED] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#7C3AED] group-hover:text-white transition">
                                <Shield size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-[#0F172A] mb-4">Verified Community</h3>
                            <p className="text-gray-500 leading-relaxed text-sm">
                                Every member is ID-verified. Travel with confidence and safety in our vetted community.
                            </p>
                        </div>

                        {/* Time Saving */}
                        <div className="bg-white p-8 rounded-3xl transition-all duration-300 hover:shadow-2xl hover:shadow-purple-100 hover:-translate-y-2 group">
                            <div className="w-14 h-14 bg-purple-50 text-[#7C3AED] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#7C3AED] group-hover:text-white transition">
                                <Clock size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-[#0F172A] mb-4">Time Saving</h3>
                            <p className="text-gray-500 leading-relaxed text-sm">
                                Use HOV lanes and direct routes. Spend less time in traffic and more with your loved ones.
                            </p>
                        </div>

                        {/* Eco-Friendly */}
                        <div className="bg-white p-8 rounded-3xl transition-all duration-300 hover:shadow-2xl hover:shadow-green-100 hover:-translate-y-2 group">
                            <div className="w-14 h-14 bg-purple-50 text-[#7C3AED] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#7C3AED] group-hover:text-white transition">
                                <Leaf size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-[#0F172A] mb-4">Eco-Friendly</h3>
                            <p className="text-gray-500 leading-relaxed text-sm">
                                Reduce your carbon footprint by sharing rides. Help the planet one journey at a time.
                            </p>
                        </div>

                        {/* Social Connections */}
                        <div className="bg-white p-8 rounded-3xl transition-all duration-300 hover:shadow-2xl hover:shadow-purple-100 hover:-translate-y-2 group">
                            <div className="w-14 h-14 bg-purple-50 text-[#7C3AED] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#7C3AED] group-hover:text-white transition">
                                <Users size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-[#0F172A] mb-4">Social Connections</h3>
                            <p className="text-gray-500 leading-relaxed text-sm">
                                Meet interesting people from your community and build network during your daily commute.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* === POPULAR DESTINATIONS SECTION === */}
            <section className="w-full bg-gradient-to-b from-white via-slate-50/60 to-white py-24 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="mb-12">
                        <h2 className="text-4xl font-black text-[#0F172A] mb-2">Popular Destinations</h2>
                        <p className="text-gray-500">Trending routes from our community this week.</p>
                    </div>

                    <div className="flex gap-6 overflow-x-auto pb-8 no-scrollbar -mx-6 px-6">
                        {[
                            { img: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400', label: 'Downtown', price: '$12' },
                            { img: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400', label: 'International Airport', price: '$25' },
                            { img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', label: 'University Campus', price: '$8' },
                            { img: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400', label: 'Business District', price: '$15' },
                            { img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', label: 'Coastal Highway', price: '$30' }
                        ].map((item, idx) => (
                            <div key={idx} className="flex-shrink-0 w-[220px] h-[280px] rounded-3xl overflow-hidden relative group transition-transform duration-300 hover:scale-105 shadow-lg">
                                <img src={item.img} alt={item.label} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                                <div className="absolute bottom-6 left-6 z-20 space-y-1">
                                    <p className="text-white font-bold text-lg">{item.label}</p>
                                    <p className="text-teal-400 font-bold text-sm">From {item.price}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* === ROLE SELECTION SECTION === */}
            <section id="get-started" className="w-full bg-gradient-to-b from-[#0F172A] via-slate-900/80 to-[#0F172A] py-24 scroll-mt-20">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <div className="mb-16">
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Choose Your Role</h2>
                        <p className="text-gray-400">Select how you want to use SmartRide and join our community.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Admin Role */}
                        <div className="bg-[#1E293B] p-10 rounded-[40px] border-2 border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)] hover:shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:border-orange-500/50 transition-all group">
                            <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center text-orange-500 mx-auto mb-8 group-hover:scale-110 transition">
                                <Shield size={40} />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">Admin Portal</h3>
                            <p className="text-gray-400 mb-8 h-12">
                                Manage platform, users, and monitor all ride-sharing activity.
                            </p>
                            <Link to="/admin/login" className="block w-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-orange-900/40 active:scale-95 transition hover:scale-105 relative overflow-hidden shimmer-button">
                                Admin Login
                            </Link>
                        </div>

                        {/* Driver Role */}
                        <div className="bg-[#1E293B] p-10 rounded-[40px] border-2 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)] hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:border-blue-500/50 transition-all group">
                            <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500 mx-auto mb-8 group-hover:scale-110 transition">
                                <Car size={40} />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">I'm a Driver</h3>
                            <p className="text-gray-400 mb-8 h-12">
                                Post rides, earn money, and share your daily journey.
                            </p>
                            <div className="space-y-4">
                                <Link to="/driver/login" className="block w-full bg-blue-600 text-white font-black py-4 rounded-2xl active:scale-95 transition hover:scale-105">
                                    Driver Login
                                </Link>
                                <Link to="/driver/register" className="block w-full border-2 border-blue-600 text-blue-500 font-black py-4 rounded-2xl active:scale-95 transition hover:bg-blue-600 hover:text-white">
                                    Register as Driver
                                </Link>
                            </div>
                        </div>

                        {/* Passenger Role */}
                        <div className="bg-[#1E293B] p-10 rounded-[40px] border-2 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)] hover:shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:border-green-500/50 transition-all group">
                            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mx-auto mb-8 group-hover:scale-110 transition">
                                <Users size={40} />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">I'm a Passenger</h3>
                            <p className="text-gray-400 mb-8 h-12">
                                Find convenient rides, save money, and professional travel.
                            </p>
                            <div className="space-y-4">
                                <Link to="/passenger/login" className="block w-full bg-[#10B981] text-white font-black py-4 rounded-2xl active:scale-95 transition hover:scale-105">
                                    Passenger Login
                                </Link>
                                <Link to="/passenger/register" className="block w-full border-2 border-[#10B981] text-[#10B981] font-black py-4 rounded-2xl active:scale-95 transition hover:bg-[#10B981] hover:text-white">
                                    Register as Passenger
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* === CONTACT SECTION === */}
            <section className="w-full bg-gradient-to-b from-white via-slate-50/60 to-white flex flex-col md:flex-row">
                <div className="max-w-7xl mx-auto px-6 w-full flex flex-col md:flex-row">
                    {/* Left Column (Dark) */}
                    <div className="md:w-1/2 bg-[#0F172A] p-12 md:p-24 space-y-12">
                        <div className="space-y-6">
                            <h2 className="text-5xl font-black text-white leading-tight">Have Questions?</h2>
                            <p className="text-xl text-gray-400">
                                We're here to help! Send us your queries and our team
                                will get back to you shortly.
                            </p>
                        </div>
                        <div className="space-y-8">
                            <div className="flex items-center gap-6 group">
                                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-[#10B981] transition">
                                    <Mail size={28} />
                                </div>
                                <span className="text-lg font-bold text-white tracking-wide">support@smartride.com</span>
                            </div>
                            <div className="flex items-center gap-6 group">
                                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-[#10B981] transition">
                                    <Phone size={28} />
                                </div>
                                <span className="text-lg font-bold text-white tracking-wide">+1 (555) 123-4567</span>
                            </div>
                            <div className="flex items-center gap-6 group">
                                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-[#10B981] transition">
                                    <MapPin size={28} />
                                </div>
                                <span className="text-lg font-bold text-white tracking-wide">123 Innovation Dr, Tech City</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Form) */}
                    <div className="md:w-1/2 p-12 md:p-24">
                        <form className="max-w-lg mx-auto space-y-8" onSubmit={(e) => e.preventDefault()}>
                            <div className="space-y-6">
                                <input
                                    type="text"
                                    placeholder="Your Name"
                                    className="w-full bg-gray-50 border-2 border-gray-100 p-5 rounded-2xl focus:border-[#0D9488] focus:ring-0 transition-all font-bold text-gray-800"
                                />
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    className="w-full bg-gray-50 border-2 border-gray-100 p-5 rounded-2xl focus:border-[#0D9488] focus:ring-0 transition-all font-bold text-gray-800"
                                />
                                <textarea
                                    rows="5"
                                    placeholder="Message"
                                    className="w-full bg-gray-50 border-2 border-gray-100 p-5 rounded-2xl focus:border-[#0D9488] focus:ring-0 transition-all font-bold text-gray-800 resize-none"
                                />
                            </div>
                            <button className="w-full bg-[#10B981] hover:bg-[#059669] text-white py-5 rounded-[20px] font-black text-xl transition-all shadow-xl shadow-green-100 flex items-center justify-center gap-3 active:scale-95">
                                Send Message <ArrowRight size={24} />
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* === FOOTER === */}
            <footer className="w-full bg-[#0F172A] text-gray-400 pt-24 pb-12 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-16 md:gap-8 mb-20">
                    <div className="space-y-8">
                        <div className="flex items-center gap-2">
                            <div className="bg-[#10B981] p-1.5 rounded-lg">
                                <Car className="text-white" size={24} />
                            </div>
                            <span className="text-2xl font-black italic tracking-tighter text-white">
                                Smart<span className="text-[#10B981]">Ride</span>
                            </span>
                        </div>
                        <p className="text-sm leading-relaxed font-medium">
                            Connecting passengers with reliable drivers for a
                            seamless travel experience. Ride smart, ride safe with
                            the world's most trusted network.
                        </p>
                    </div>

                    <div className="space-y-8">
                        <h4 className="text-white font-bold uppercase tracking-widest text-xs">Quick Links</h4>
                        <ul className="space-y-4 font-bold text-sm">
                            <li><Link to="/" className="hover:text-white transition">Home</Link></li>
                            <li><Link to="/passenger/login" className="hover:text-white transition">Find a Ride</Link></li>
                            <li><Link to="/driver/login" className="hover:text-white transition">Post a Ride</Link></li>
                            <li><Link to="/login-select" className="hover:text-white transition">Login</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-8">
                        <h4 className="text-white font-bold uppercase tracking-widest text-xs">Support</h4>
                        <ul className="space-y-4 font-bold text-sm">
                            <li><Link to="#" className="hover:text-white transition">Help Center</Link></li>
                            <li><Link to="#" className="hover:text-white transition">Safety Guidelines</Link></li>
                            <li><Link to="#" className="hover:text-white transition">Terms of Service</Link></li>
                            <li><Link to="#" className="hover:text-white transition">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-8">
                        <h4 className="text-white font-bold uppercase tracking-widest text-xs">Contact Us</h4>
                        <div className="space-y-4 font-bold text-sm">
                            <p className="text-white">support@smartride.com</p>
                            <p className="text-white">+1 (234) 567 890</p>
                            <div className="flex gap-4 pt-4">
                                <Link to="#" className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-white/10 transition text-white">
                                    <Twitter size={18} />
                                </Link>
                                <Link to="#" className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-white/10 transition text-white">
                                    <Facebook size={18} />
                                </Link>
                                <Link to="#" className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-white/10 transition text-white">
                                    <Linkedin size={18} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 pt-12 border-t border-white/5 text-center">
                    <p className="text-sm font-black opacity-60 tracking-wide uppercase">© 2026 SmartRide. All rights reserved.</p>
                </div>
            </footer>
        </div>
    )
}

export default Home

