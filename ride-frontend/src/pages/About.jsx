import { Link } from 'react-router-dom'
import {
    Car,
    MapPin,
    Star,
    Shield,
    Users,
    Zap,
    CheckCircle2,
    ArrowRight,
    TrendingUp,
    Leaf
} from 'lucide-react'

const About = () => {
    return (
        <div className="min-h-screen bg-gray-50">

            {/* ── HERO ─────────────────────────────────────────── */}
            <section
                className="relative overflow-hidden"
                style={{
                    background: 'linear-gradient(135deg, #1D4ED8 0%, #1E40AF 50%, #312E81 100%)',
                    minHeight: '480px'
                }}
            >
                {/* decorative blobs */}
                <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
                    style={{ background: 'radial-gradient(circle, #60A5FA, transparent)', transform: 'translate(30%, -30%)' }} />
                <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10"
                    style={{ background: 'radial-gradient(circle, #818CF8, transparent)', transform: 'translate(-30%, 30%)' }} />

                <div className="relative max-w-5xl mx-auto px-6 py-28 text-center text-white">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-5 py-2 mb-8 text-sm font-semibold text-blue-100 border border-white/20">
                        <Car size={16} /> City-to-City Ride Sharing
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black mb-5 leading-tight">
                        About{' '}
                        <span className="bg-clip-text text-transparent"
                            style={{ backgroundImage: 'linear-gradient(90deg, #93C5FD, #C7D2FE)' }}>
                            SmartRide
                        </span>
                    </h1>
                    <p className="text-xl md:text-2xl text-blue-100 font-medium max-w-2xl mx-auto">
                        Smart way to share your journey
                    </p>
                </div>
            </section>

            {/* ── ABOUT DESCRIPTION ─────────────────────────────── */}
            <section className="max-w-5xl mx-auto px-6 py-20">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-black text-gray-800 mb-5">What is SmartRide?</h2>
                        <p className="text-gray-600 text-lg leading-relaxed mb-4">
                            SmartRide is a modern <strong>city-to-city ride-sharing platform</strong> that connects
                            passengers with verified drivers travelling on the same route. Instead of booking an
                            entire cab, you book only the seats you need.
                        </p>
                        <p className="text-gray-600 text-lg leading-relaxed">
                            Our platform uses a transparent <strong>distance-based pricing</strong> model with a
                            built-in <strong>driver rating system</strong>, ensuring every journey is safe,
                            affordable, and comfortable.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { icon: MapPin, color: 'blue', label: 'City-to-City Routes' },
                            { icon: Users, color: 'indigo', label: 'Seat-Based Booking' },
                            { icon: Zap, color: 'violet', label: 'Distance Pricing' },
                            { icon: Star, color: 'amber', label: 'Driver Ratings' },
                        ].map(({ icon: Icon, color, label }) => (
                            <div key={label}
                                className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow`}>
                                <div className={`w-12 h-12 bg-${color}-50 rounded-xl flex items-center justify-center mx-auto mb-3`}>
                                    <Icon size={22} className={`text-${color}-600`} />
                                </div>
                                <p className="text-gray-700 font-semibold text-sm">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── MISSION ───────────────────────────────────────── */}
            <section className="bg-white py-20">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl font-black text-gray-800 mb-3">Our Mission</h2>
                        <p className="text-gray-500 text-lg">Driving change — one shared ride at a time</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: TrendingUp,
                                color: 'blue',
                                title: 'Affordable Travel',
                                desc: 'Share fuel costs with co-passengers and slash your commute expenses by up to 60% compared to private cabs.',
                            },
                            {
                                icon: Users,
                                color: 'indigo',
                                title: 'Reduce Traffic',
                                desc: 'Fewer vehicles on roads means less congestion. SmartRide helps cities breathe by encouraging shared mobility.',
                            },
                            {
                                icon: Leaf,
                                color: 'emerald',
                                title: 'Sustainable Transport',
                                desc: 'Every shared ride reduces carbon emissions. Together we build a greener and more sustainable tomorrow.',
                            },
                        ].map(({ icon: Icon, color, title, desc }) => (
                            <div key={title} className="text-center p-6 rounded-3xl bg-gray-50 border border-gray-100 hover:border-blue-100 hover:shadow-md transition-all">
                                <div className={`w-16 h-16 bg-${color}-100 rounded-2xl flex items-center justify-center mx-auto mb-5`}>
                                    <Icon size={28} className={`text-${color}-600`} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
                                <p className="text-gray-500 leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FEATURES ──────────────────────────────────────── */}
            <section className="max-w-5xl mx-auto px-6 py-20">
                <div className="text-center mb-14">
                    <h2 className="text-3xl font-black text-gray-800 mb-3">Platform Features</h2>
                    <p className="text-gray-500 text-lg">Everything you need for a seamless shared journey</p>
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                    {[
                        { title: 'Post a Ride', desc: 'Drivers publish upcoming trips with route, date, time, and available seats.' },
                        { title: 'Search Rides', desc: 'Passengers search by origin, destination, and date to find matching trips instantly.' },
                        { title: 'Real-Time Fare Calculation', desc: 'Pricing is computed transparently based on distance and number of seats booked.' },
                        { title: 'Seat Availability Tracking', desc: 'Live seat counts update as bookings are made, preventing overbooking.' },
                        { title: 'Driver Approval System', desc: 'All drivers are verified and rated, ensuring only trusted individuals carry passengers.' },
                        { title: 'Booking Status Updates', desc: 'Track your booking in real-time — from Pending to Approved — via your dashboard.' },
                    ].map(({ title, desc }) => (
                        <div key={title} className="flex gap-4 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all">
                            <CheckCircle2 className="text-blue-500 flex-shrink-0 mt-0.5" size={22} />
                            <div>
                                <h4 className="font-bold text-gray-800 mb-1">{title}</h4>
                                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── TRUST ─────────────────────────────────────────── */}
            <section
                className="py-20 text-white text-center"
                style={{ background: 'linear-gradient(135deg, #1D4ED8, #312E81)' }}
            >
                <div className="max-w-3xl mx-auto px-6">
                    <Shield size={52} className="mx-auto mb-6 text-blue-200" />
                    <h2 className="text-3xl md:text-4xl font-black mb-5">Trusted by Riders Across India</h2>
                    <p className="text-blue-100 text-lg leading-relaxed mb-8">
                        SmartRide places safety and transparency at the heart of every journey. Every driver
                        is verified, every booking is tracked, and every dispute is resolved fairly.
                        Ride with confidence — always.
                    </p>
                    <div className="flex flex-wrap justify-center gap-8 mb-10">
                        {[
                            { value: '10,000+', label: 'Rides Completed' },
                            { value: '500+', label: 'Verified Drivers' },
                            { value: '4.8 ★', label: 'Average Rating' },
                        ].map(({ value, label }) => (
                            <div key={label}>
                                <p className="text-4xl font-black">{value}</p>
                                <p className="text-blue-200 text-sm mt-1 font-medium">{label}</p>
                            </div>
                        ))}
                    </div>
                    <Link
                        to="/register-select"
                        className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-8 py-3.5 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                    >
                        Get Started <ArrowRight size={18} />
                    </Link>
                </div>
            </section>

        </div>
    )
}

export default About
