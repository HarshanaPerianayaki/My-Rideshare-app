import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import {
    User, Mail, Phone, MapPin,
    GraduationCap, FileText, ChevronLeft, ChevronRight,
    Car, Upload, CheckCircle, AlertCircle, Calendar,
    UserCircle
} from 'lucide-react'
import authService from '../../services/authService'
import toast from 'react-hot-toast'

const schema = yup.object().shape({
    // Step 1
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    phone: yup.string().required('Phone number is required'),
    dateOfBirth: yup.string().required('Date of birth is required'),
    gender: yup.string().required('Gender is required'),

    // Step 2
    streetAddress: yup.string().required('Street address is required'),
    area: yup.string().required('Area is required'),
    city: yup.string().required('City is required'),
    state: yup.string().required('State is required'),
    pinCode: yup.string().matches(/^\d{6}$/, 'Must be 6 digits').required('PIN code is required'),

    // Step 3
    school10Name: yup.string().required('10th school name is required'),
    school10Year: yup.string().required('10th passing year is required'),
    school10Percentage: yup.string().required('10th percentage is required'),
    school12Name: yup.string().required('12th school name is required'),
    school12Year: yup.string().required('12th passing year is required'),
    school12Percentage: yup.string().required('12th percentage is required'),
    collegeName: yup.string().required('College name is required'),
    graduationYear: yup.string().required('Graduation year is required'),
    graduationPercentage: yup.string().required('Graduation percentage is required'),

    // Step 4
    documentType: yup.string().required('Document type is required')
})

const DriverRegister = () => {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [documentFile, setDocumentFile] = useState(null)
    const [documentFileName, setDocumentFileName] = useState('')
    const navigate = useNavigate()

    const { register, handleSubmit, trigger, watch, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
        mode: 'onChange'
    })

    const nextStep = async () => {
        let fieldsToValidate = []
        if (step === 1) fieldsToValidate = ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'gender']
        else if (step === 2) fieldsToValidate = ['streetAddress', 'area', 'city', 'state', 'pinCode']
        else if (step === 3) fieldsToValidate = ['school10Name', 'school10Year', 'school10Percentage', 'school12Name', 'school12Year', 'school12Percentage', 'collegeName', 'graduationYear', 'graduationPercentage']

        const isValid = await trigger(fieldsToValidate)
        if (isValid) setStep(step + 1)
    }

    const prevStep = () => setStep(step - 1)

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setDocumentFile(file)
            setDocumentFileName(file.name)
        }
    }

    const onSubmit = async (data) => {
        if (!documentFile) {
            toast.error('Please upload an identity document')
            return
        }

        setLoading(true)
        try {
            const formData = new FormData()
            // Append all fields to FormData
            Object.keys(data).forEach(key => {
                formData.append(key, data[key])
            })
            formData.append('documentFile', documentFile)
            formData.append('role', 'DRIVER')

            await authService.registerDriver(formData)
            toast.success('Registration submitted! Admin will review your application.')
            navigate('/driver/login')
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed')
        } finally {
            setLoading(false)
        }
    }

    const steps = [
        { id: 1, title: 'Personal', icon: UserCircle },
        { id: 2, title: 'Address', icon: MapPin },
        { id: 3, title: 'Education', icon: GraduationCap },
        { id: 4, title: 'Documents', icon: FileText }
    ]

    return (
        <div className="w-full min-h-screen bg-professional-blue floating-shapes py-12 px-6 relative overflow-hidden">
            <Link
                to="/register-select"
                className="absolute top-6 left-6 z-20 inline-flex items-center gap-2 text-white text-sm font-medium opacity-80 hover:opacity-100 transition"
            >
                <ChevronLeft size={16} /> Back
            </Link>
            <div className="max-w-3xl mx-auto">
                <div className="bg-white/95 backdrop-blur-sm rounded-[2.5rem] shadow-xl overflow-hidden border-l-[6px] border-blue-600 relative">
                    {/* Header */}
                    <div className="p-8 md:p-12 pb-0">
                        <div className="text-center space-y-4 mb-10">
                            <h1 className="text-4xl font-black text-blue-600">Create Your Account</h1>
                            <p className="text-gray-500 font-medium">Join us today and start your journey</p>
                        </div>

                        {/* Role Toggle */}
                        <div className="flex justify-center mb-12">
                            <div className="bg-gray-100 p-1.5 rounded-full flex gap-2 border border-gray-200">
                                <Link to="/passenger/register" className="px-8 py-2.5 rounded-full font-black text-gray-500 hover:text-gray-700 transition">
                                    🚗 Passenger
                                </Link>
                                <div className="px-8 py-2.5 rounded-full font-black bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg">
                                    🚕 Driver
                                </div>
                            </div>
                        </div>

                        {/* Progress Steps */}
                        <div className="relative flex justify-between items-center mb-16 px-4">
                            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-100 -translate-y-1/2 z-0 mx-10" />
                            <div
                                className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-700 -translate-y-1/2 z-0 transition-all duration-500 mx-10"
                                style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                            />

                            {steps.map((s) => (
                                <div key={s.id} className="relative z-10 flex flex-col items-center group">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border-4 border-white shadow-md ${step > s.id ? 'bg-blue-500 text-white' :
                                        step === s.id ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white scale-110' :
                                            'bg-white text-gray-300'
                                        }`}>
                                        {step > s.id ? <CheckCircle size={24} /> : <s.icon size={22} />}
                                    </div>
                                    <div className="absolute -bottom-8 whitespace-nowrap">
                                        <p className={`text-xs font-black uppercase tracking-widest ${step === s.id ? 'text-gray-800' : 'text-gray-400'}`}>
                                            {s.title}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Step Form Container */}
                    <div className="p-8 md:p-12 pt-4">
                        <form onSubmit={handleSubmit(onSubmit)}>
                            {/* STEP 1: Personal */}
                            {step === 1 && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
                                        <span className="text-3xl">👤</span> Personal Information
                                    </h2>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-700 uppercase tracking-wider ml-1">First Name</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <User className="text-gray-400 group-focus-within:text-blue-500" size={20} />
                                                </div>
                                                <input {...register('firstName')} className="block w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold focus:border-blue-500 focus:bg-white transition-all outline-none" placeholder="John" />
                                            </div>
                                            {errors.firstName && <p className="text-red-500 text-xs font-bold flex items-center gap-1 ml-1"><AlertCircle size={12} /> {errors.firstName.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-700 uppercase tracking-wider ml-1">Last Name</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <User className="text-gray-400 group-focus-within:text-blue-500" size={20} />
                                                </div>
                                                <input {...register('lastName')} className="block w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold focus:border-blue-500 focus:bg-white transition-all outline-none" placeholder="Doe" />
                                            </div>
                                            {errors.lastName && <p className="text-red-500 text-xs font-bold flex items-center gap-1 ml-1"><AlertCircle size={12} /> {errors.lastName.message}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-700 uppercase tracking-wider ml-1">Email Address</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Mail className="text-gray-400 group-focus-within:text-blue-500" size={20} />
                                            </div>
                                            <input {...register('email')} className="block w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold focus:border-blue-500 focus:bg-white transition-all outline-none" placeholder="john.doe@example.com" />
                                        </div>
                                        {errors.email && <p className="text-red-500 text-xs font-bold flex items-center gap-1 ml-1"><AlertCircle size={12} /> {errors.email.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-700 uppercase tracking-wider ml-1">Contact Number</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Phone className="text-gray-400 group-focus-within:text-blue-500" size={20} />
                                            </div>
                                            <input {...register('phone')} className="block w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold focus:border-blue-500 focus:bg-white transition-all outline-none" placeholder="+91 1234567890" />
                                        </div>
                                        {errors.phone && <p className="text-red-500 text-xs font-bold flex items-center gap-1 ml-1"><AlertCircle size={12} /> {errors.phone.message}</p>}
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-700 uppercase tracking-wider ml-1">Date of Birth</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <Calendar className="text-gray-400 group-focus-within:text-blue-500" size={20} />
                                                </div>
                                                <input type="date" {...register('dateOfBirth')} className="block w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold focus:border-blue-500 focus:bg-white transition-all outline-none" />
                                            </div>
                                            {errors.dateOfBirth && <p className="text-red-500 text-xs font-bold flex items-center gap-1 ml-1"><AlertCircle size={12} /> {errors.dateOfBirth.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-700 uppercase tracking-wider ml-1">Gender</label>
                                            <select {...register('gender')} className="block w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold focus:border-blue-500 focus:bg-white transition-all outline-none">
                                                <option value="">Select Gender</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                            {errors.gender && <p className="text-red-500 text-xs font-bold flex items-center gap-1 ml-1"><AlertCircle size={12} /> {errors.gender.message}</p>}
                                        </div>
                                    </div>


                                </div>
                            )}

                            {/* STEP 2: Address */}
                            {step === 2 && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
                                        <span className="text-3xl">📍</span> Address Details
                                    </h2>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-700 uppercase tracking-wider ml-1">Street Address</label>
                                        <input {...register('streetAddress')} className="block w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold focus:border-blue-500 focus:bg-white transition-all outline-none" placeholder="House no., Building name" />
                                        {errors.streetAddress && <p className="text-red-500 text-xs font-bold flex items-center gap-1 ml-1"><AlertCircle size={12} /> {errors.streetAddress.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-700 uppercase tracking-wider ml-1">Area/Locality</label>
                                        <input {...register('area')} className="block w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold focus:border-blue-500 focus:bg-white transition-all outline-none" placeholder="Area, Locality" />
                                        {errors.area && <p className="text-red-500 text-xs font-bold flex items-center gap-1 ml-1"><AlertCircle size={12} /> {errors.area.message}</p>}
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-700 uppercase tracking-wider ml-1">City</label>
                                            <input {...register('city')} className="block w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold focus:border-blue-500 focus:bg-white transition-all outline-none" placeholder="City" />
                                            {errors.city && <p className="text-red-500 text-xs font-bold flex items-center gap-1 ml-1"><AlertCircle size={12} /> {errors.city.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-700 uppercase tracking-wider ml-1">State</label>
                                            <input {...register('state')} className="block w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold focus:border-blue-500 focus:bg-white transition-all outline-none" placeholder="State" />
                                            {errors.state && <p className="text-red-500 text-xs font-bold flex items-center gap-1 ml-1"><AlertCircle size={12} /> {errors.state.message}</p>}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-700 uppercase tracking-wider ml-1">Pin Code</label>
                                        <input {...register('pinCode')} className="block w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold focus:border-blue-500 focus:bg-white transition-all outline-none" placeholder="6-digit PIN code" />
                                        {errors.pinCode && <p className="text-red-500 text-xs font-bold flex items-center gap-1 ml-1"><AlertCircle size={12} /> {errors.pinCode.message}</p>}
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: Education */}
                            {step === 3 && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
                                        <span className="text-3xl">🎓</span> Educational Qualifications
                                    </h2>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-700 uppercase tracking-wider ml-1">10th School Name</label>
                                            <input {...register('school10Name')} className="block w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold focus:border-blue-500 focus:bg-white transition-all outline-none" placeholder="School Name" />
                                            {errors.school10Name && <p className="text-red-500 text-xs font-bold flex items-center gap-1 ml-1"><AlertCircle size={12} /> {errors.school10Name.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-700 uppercase tracking-wider ml-1">10th Passing Year</label>
                                            <input {...register('school10Year')} className="block w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold focus:border-blue-500 focus:bg-white transition-all outline-none" placeholder="YYYY" />
                                            {errors.school10Year && <p className="text-red-500 text-xs font-bold flex items-center gap-1 ml-1"><AlertCircle size={12} /> {errors.school10Year.message}</p>}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-700 uppercase tracking-wider ml-1">10th Percentage</label>
                                        <input {...register('school10Percentage')} className="block w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold focus:border-blue-500 focus:bg-white transition-all outline-none" placeholder="85.5" />
                                        {errors.school10Percentage && <p className="text-red-500 text-xs font-bold flex items-center gap-1 ml-1"><AlertCircle size={12} /> {errors.school10Percentage.message}</p>}
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6 pt-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-700 uppercase tracking-wider ml-1">12th School Name</label>
                                            <input {...register('school12Name')} className="block w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold focus:border-blue-500 focus:bg-white transition-all outline-none" placeholder="School Name" />
                                            {errors.school12Name && <p className="text-red-500 text-xs font-bold flex items-center gap-1 ml-1"><AlertCircle size={12} /> {errors.school12Name.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-700 uppercase tracking-wider ml-1">12th Passing Year</label>
                                            <input {...register('school12Year')} className="block w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold focus:border-blue-500 focus:bg-white transition-all outline-none" placeholder="YYYY" />
                                            {errors.school12Year && <p className="text-red-500 text-xs font-bold flex items-center gap-1 ml-1"><AlertCircle size={12} /> {errors.school12Year.message}</p>}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-700 uppercase tracking-wider ml-1">12th Percentage</label>
                                        <input {...register('school12Percentage')} className="block w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold focus:border-blue-500 focus:bg-white transition-all outline-none" placeholder="88.5" />
                                        {errors.school12Percentage && <p className="text-red-500 text-xs font-bold flex items-center gap-1 ml-1"><AlertCircle size={12} /> {errors.school12Percentage.message}</p>}
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6 pt-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-700 uppercase tracking-wider ml-1">College Name</label>
                                            <input {...register('collegeName')} className="block w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold focus:border-blue-500 focus:bg-white transition-all outline-none" placeholder="College Name" />
                                            {errors.collegeName && <p className="text-red-500 text-xs font-bold flex items-center gap-1 ml-1"><AlertCircle size={12} /> {errors.collegeName.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-700 uppercase tracking-wider ml-1">Graduation Year</label>
                                            <input {...register('graduationYear')} className="block w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold focus:border-blue-500 focus:bg-white transition-all outline-none" placeholder="YYYY" />
                                            {errors.graduationYear && <p className="text-red-500 text-xs font-bold flex items-center gap-1 ml-1"><AlertCircle size={12} /> {errors.graduationYear.message}</p>}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-700 uppercase tracking-wider ml-1">Graduation Percentage/CGPA</label>
                                        <input {...register('graduationPercentage')} className="block w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold focus:border-blue-500 focus:bg-white transition-all outline-none" placeholder="8.5 or 85%" />
                                        {errors.graduationPercentage && <p className="text-red-500 text-xs font-bold flex items-center gap-1 ml-1"><AlertCircle size={12} /> {errors.graduationPercentage.message}</p>}
                                    </div>
                                </div>
                            )}

                            {/* STEP 4: Documents & Vehicle */}
                            {step === 4 && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
                                        <span className="text-3xl">📄</span> Identity Verification
                                    </h2>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-700 uppercase tracking-wider ml-1">Document Type</label>
                                        <select {...register('documentType')} className="block w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold focus:border-blue-500 focus:bg-white transition-all outline-none">
                                            <option value="">Select Document Type</option>
                                            <option value="Aadhaar Card">Aadhaar Card</option>
                                            <option value="PAN Card">PAN Card</option>
                                            <option value="Passport">Passport</option>
                                            <option value="Driving License">Driving License</option>
                                            <option value="Voter ID">Voter ID</option>
                                        </select>
                                        {errors.documentType && <p className="text-red-500 text-xs font-bold flex items-center gap-1 ml-1"><AlertCircle size={12} /> {errors.documentType.message}</p>}
                                    </div>

                                    {/* File Upload Area */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-700 uppercase tracking-wider ml-1">Upload Document</label>
                                        <div
                                            onClick={() => document.getElementById('document-upload').click()}
                                            className={`border-4 border-dashed rounded-[2rem] p-10 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${documentFile ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'}`}
                                        >
                                            <input
                                                id="document-upload"
                                                type="file"
                                                hidden
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={handleFileChange}
                                            />
                                            {documentFile ? (
                                                <>
                                                    <div className="w-16 h-16 bg-blue-500 text-white rounded-2xl flex items-center justify-center shadow-lg">
                                                        <CheckCircle size={32} />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="font-black text-gray-800">{documentFileName}</p>
                                                        <p className="text-sm text-blue-600 font-bold">File selected successfully!</p>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-2xl flex items-center justify-center">
                                                        <Upload size={32} />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="font-black text-gray-800">Click to upload or drag & drop</p>
                                                        <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">PDF, JPG, PNG up to 10MB</p>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>


                                </div>
                            )}

                            {/* Footer Buttons */}
                            <div className="mt-12 flex gap-4">
                                {step > 1 && (
                                    <button
                                        type="button"
                                        onClick={prevStep}
                                        className="flex-1 px-8 py-5 border-2 border-gray-100 text-gray-500 font-black rounded-2xl hover:bg-gray-50 transition active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <ChevronLeft size={20} /> Back
                                    </button>
                                )}

                                {step < 4 ? (
                                    <button
                                        type="button"
                                        onClick={nextStep}
                                        className="flex-[2] bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-100 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all relative overflow-hidden shimmer-button"
                                    >
                                        Next <ChevronRight size={20} />
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`flex-[2] bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-100 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all relative overflow-hidden shimmer-button ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        {loading ? (
                                            <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <>Register as Driver <CheckCircle size={22} /></>
                                        )}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className="p-8 text-center border-t border-gray-50">
                        <p className="text-gray-500 font-bold">
                            Already have an account? {' '}
                            <Link to="/driver/login" className="text-blue-600 hover:underline">
                                Login here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DriverRegister
