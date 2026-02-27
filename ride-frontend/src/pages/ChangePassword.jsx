import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    AlertTriangle,
    CheckCircle,
    Eye,
    EyeOff,
    Lock,
    Shield
} from 'lucide-react'
import toast from 'react-hot-toast'
import authService from '../services/authService'

const SPECIAL_REGEX = /[!@#$%^&*]/

const getStrength = (password) => {
    const checks = [
        password.length >= 8,
        /[A-Z]/.test(password),
        /[0-9]/.test(password),
        SPECIAL_REGEX.test(password)
    ]
    const score = checks.filter(Boolean).length
    if (score <= 1) return { score, label: 'Weak', color: 'bg-red-500' }
    if (score === 2) return { score, label: 'Fair', color: 'bg-orange-500' }
    if (score === 3) return { score, label: 'Good', color: 'bg-yellow-500' }
    return { score, label: 'Strong', color: 'bg-green-500' }
}

const ChangePassword = () => {
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    })
    const [show, setShow] = useState({
        oldPassword: false,
        newPassword: false,
        confirmPassword: false
    })
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const rules = useMemo(() => ({
        minLength: formData.newPassword.length >= 8,
        uppercase: /[A-Z]/.test(formData.newPassword),
        number: /[0-9]/.test(formData.newPassword),
        special: SPECIAL_REGEX.test(formData.newPassword)
    }), [formData.newPassword])

    const strength = useMemo(() => getStrength(formData.newPassword), [formData.newPassword])
    const passwordsMatch = formData.confirmPassword.length > 0 && formData.newPassword === formData.confirmPassword

    const toggleShow = (key) => {
        setShow((prev) => ({ ...prev, [key]: !prev[key] }))
    }

    const handleChange = (event) => {
        const { name, value } = event.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const validateForm = () => {
        if (!formData.oldPassword || !formData.newPassword || !formData.confirmPassword) {
            return 'All fields are required'
        }
        if (!rules.minLength || !rules.uppercase || !rules.number || !rules.special) {
            return 'Password must be at least 8 chars with uppercase, number, and special character'
        }
        if (!passwordsMatch) {
            return 'Confirm password must match new password'
        }
        if (formData.oldPassword === formData.newPassword) {
            return 'New password cannot be same as old password'
        }
        return null
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        const validationError = validateForm()
        if (validationError) {
            toast.error(validationError)
            return
        }

        setLoading(true)
        try {
            await authService.changePassword(formData)
            const role = localStorage.getItem('role')

            toast.success('Password changed! Please login with your new password.')
            localStorage.clear()

            setTimeout(() => {
                if (role === 'DRIVER') {
                    navigate('/driver/login')
                    return
                }
                if (role === 'PASSENGER') {
                    navigate('/passenger/login')
                    return
                }
                navigate('/login-select')
            }, 1500)
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to change password'
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    const ruleItem = (ok, label) => (
        <p className={`text-sm ${ok ? 'text-green-700' : 'text-slate-500'}`}>
            {ok ? '✓' : '✗'} {label}
        </p>
    )

    return (
        <div className="min-h-screen bg-professional-blue flex items-center justify-center p-6">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-10">
                <div className="text-center mb-6">
                    <div className="mx-auto w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center mb-4">
                        <Lock className="text-white" size={24} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Change Your Password</h1>
                    <p className="text-sm text-slate-500 mt-2">
                        For your security, please set a new password before continuing.
                    </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex gap-3">
                    <AlertTriangle className="text-blue-500 mt-0.5" size={18} />
                    <p className="text-sm text-blue-800">
                        You are using a temporary password. Please change it now to secure your account.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Current Temporary Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type={show.oldPassword ? 'text' : 'password'}
                                name="oldPassword"
                                value={formData.oldPassword}
                                onChange={handleChange}
                                placeholder="Enter the password from your email"
                                className="w-full border border-slate-200 rounded-xl py-3 pl-10 pr-11 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                type="button"
                                onClick={() => toggleShow('oldPassword')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                            >
                                {show.oldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">New Password</label>
                        <div className="relative">
                            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type={show.newPassword ? 'text' : 'password'}
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                placeholder="Create a strong password"
                                className="w-full border border-slate-200 rounded-xl py-3 pl-10 pr-11 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                type="button"
                                onClick={() => toggleShow('newPassword')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                            >
                                {show.newPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <div className="mt-3">
                            <div className="grid grid-cols-4 gap-2">
                                {[1, 2, 3, 4].map((value) => (
                                    <div
                                        key={value}
                                        className={`h-2 rounded ${strength.score >= value ? strength.color : 'bg-slate-200'}`}
                                    />
                                ))}
                            </div>
                            <p className="text-sm font-semibold text-slate-700 mt-2">Strength: {strength.label}</p>
                            <div className="mt-2 space-y-1">
                                {ruleItem(rules.minLength, 'At least 8 characters')}
                                {ruleItem(rules.uppercase, 'One uppercase letter')}
                                {ruleItem(rules.number, 'One number')}
                                {ruleItem(rules.special, 'One special character (!@#$%^&*)')}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm New Password</label>
                        <div className="relative">
                            <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type={show.confirmPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Repeat your new password"
                                className="w-full border border-slate-200 rounded-xl py-3 pl-10 pr-11 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                type="button"
                                onClick={() => toggleShow('confirmPassword')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                            >
                                {show.confirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {passwordsMatch && (
                            <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                                <CheckCircle size={16} /> Passwords match
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black text-lg disabled:opacity-60 shadow-lg shadow-blue-100 transition-all hover:scale-[1.02]"
                    >
                        {loading ? (
                            <span className="inline-flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Changing Password...
                            </span>
                        ) : 'Change Password'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default ChangePassword
