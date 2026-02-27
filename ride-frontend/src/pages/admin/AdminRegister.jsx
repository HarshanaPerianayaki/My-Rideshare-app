import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import {
    Shield, Mail, Lock, Eye, EyeOff, User, Phone,
    Key, ChevronLeft, AlertCircle, CheckCircle
} from 'lucide-react'
import authService from '../../services/authService'
import toast from 'react-hot-toast'

const schema = yup.object().shape({
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    phone: yup.string().required('Phone number is required'),
    password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    confirmPassword: yup.string()
        .oneOf([yup.ref('password'), null], 'Passwords must match')
        .required('Confirm password is required'),
    secretCode: yup.string().required('Admin secret code is required')
})

const AdminRegister = () => {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [showSecret, setShowSecret] = useState(false)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema)
    })

    const onSubmit = async (data) => {
        setLoading(true)
        try {
            await authService.registerAdmin(data)
            toast.success('Admin registered! Check your email.')
            navigate('/admin/login')
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full min-h-screen bg-professional-blue floating-shapes py-12 px-6 flex items-center justify-center relative overflow-hidden">
            <Link
                to="/register-select"
                className="absolute top-6 left-6 z-20 inline-flex items-center gap-2 text-white text-sm font-medium opacity-80 hover:opacity-100 transition"
            >
                <ChevronLeft size={16} /> Back
            </Link>
            <div className="max-w-2xl w-full bg-gradient-to-br from-white via-blue-50/30 to-white rounded-[2.5rem] shadow-2xl overflow-hidden relative p-8 md:p-12">
                <div className="text-center mt-8 mb-10 space-y-4">
                    <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center text-blue-600 mx-auto transform rotate-12">
                        <Shield size={40} className="-rotate-12" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-gray-800">Admin Registration</h1>
                        <p className="text-gray-500 font-medium pt-1">Create your administrator account</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    {/* Name Grid */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-black text-gray-700 uppercase tracking-wider ml-1">First Name</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                                </div>
                                <input
                                    {...register('firstName')}
                                    className={`block w-full pl-12 pr-4 py-4 bg-gray-50 border-2 ${errors.firstName ? 'border-red-300' : 'border-gray-100'} rounded-2xl text-gray-900 font-bold placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all`}
                                    placeholder="John"
                                />
                            </div>
                            {errors.firstName && <p className="text-red-500 text-xs font-bold mt-1 ml-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.firstName.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-black text-gray-700 uppercase tracking-wider ml-1">Last Name</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                                </div>
                                <input
                                    {...register('lastName')}
                                    className={`block w-full pl-12 pr-4 py-4 bg-gray-50 border-2 ${errors.lastName ? 'border-red-300' : 'border-gray-100'} rounded-2xl text-gray-900 font-bold placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all`}
                                    placeholder="Doe"
                                />
                            </div>
                            {errors.lastName && <p className="text-red-500 text-xs font-bold mt-1 ml-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.lastName.message}</p>}
                        </div>
                    </div>

                    {/* Email & Phone */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-black text-gray-700 uppercase tracking-wider ml-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                                </div>
                                <input
                                    {...register('email')}
                                    className={`block w-full pl-12 pr-4 py-4 bg-gray-50 border-2 ${errors.email ? 'border-red-300' : 'border-gray-100'} rounded-2xl text-gray-900 font-bold placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all`}
                                    placeholder="admin@smartride.com"
                                />
                            </div>
                            {errors.email && <p className="text-red-500 text-xs font-bold mt-1 ml-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.email.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-black text-gray-700 uppercase tracking-wider ml-1">Phone Number</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Phone className="text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                                </div>
                                <input
                                    {...register('phone')}
                                    className={`block w-full pl-12 pr-4 py-4 bg-gray-50 border-2 ${errors.phone ? 'border-red-300' : 'border-gray-100'} rounded-2xl text-gray-900 font-bold placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all`}
                                    placeholder="+91 1234567890"
                                />
                            </div>
                            {errors.phone && <p className="text-red-500 text-xs font-bold mt-1 ml-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.phone.message}</p>}
                        </div>
                    </div>

                    {/* Password Grid */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-black text-gray-700 uppercase tracking-wider ml-1">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    {...register('password')}
                                    className={`block w-full pl-12 pr-12 py-4 bg-gray-50 border-2 ${errors.password ? 'border-red-300' : 'border-gray-100'} rounded-2xl text-gray-900 font-bold placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all`}
                                    placeholder="••••••••"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-500 transition-colors">
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-500 text-xs font-bold mt-1 ml-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.password.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-black text-gray-700 uppercase tracking-wider ml-1">Confirm Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                                </div>
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    {...register('confirmPassword')}
                                    className={`block w-full pl-12 pr-12 py-4 bg-gray-50 border-2 ${errors.confirmPassword ? 'border-red-300' : 'border-gray-100'} rounded-2xl text-gray-900 font-bold placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all`}
                                    placeholder="••••••••"
                                />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-500 transition-colors">
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {errors.confirmPassword && <p className="text-red-500 text-xs font-bold mt-1 ml-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.confirmPassword.message}</p>}
                        </div>
                    </div>

                    {/* Secret Code Section */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-black text-gray-700 uppercase tracking-wider ml-1">Admin Secret Code</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Key className="text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                                </div>
                                <input
                                    type={showSecret ? 'text' : 'password'}
                                    {...register('secretCode')}
                                    className={`block w-full pl-12 pr-12 py-4 bg-gray-50 border-2 ${errors.secretCode ? 'border-red-300' : 'border-gray-100'} rounded-2xl text-gray-900 font-bold placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all`}
                                    placeholder="SEC-RT-CODE"
                                />
                                <button type="button" onClick={() => setShowSecret(!showSecret)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-500 transition-colors">
                                    {showSecret ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {errors.secretCode && <p className="text-red-500 text-xs font-bold mt-1 ml-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.secretCode.message}</p>}
                        </div>
                        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-4">
                            <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={20} />
                            <p className="text-sm text-amber-800 font-medium leading-relaxed">
                                <span className="font-black text-amber-900 block mb-0.5">Confidential Access</span>
                                Please contact the system administrator to receive your registration secret code. Do not share this code with anyone.
                            </p>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-100 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 text-lg relative overflow-hidden shimmer-button ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>Register as Admin <CheckCircle size={22} /></>
                        )}
                    </button>
                </form>

                <div className="mt-10 pt-6 border-t border-gray-100 text-center">
                    <p className="text-gray-500 font-bold">
                        Already have an account? {' '}
                        <Link to="/admin/login" className="text-purple-600 hover:underline">
                            Login here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default AdminRegister
