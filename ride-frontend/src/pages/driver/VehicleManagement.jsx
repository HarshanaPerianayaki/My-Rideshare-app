import { useState, useEffect } from 'react'
import { Car, Plus, Shield, Settings, Clock, Fuel, Users, Wrench, Camera, FileText, CheckCircle, AlertCircle, X, Upload, Eye, EyeOff } from 'lucide-react'
import authService from '../../services/authService'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const VehicleManagement = () => {
    const navigate = useNavigate()
    const [vehicles, setVehicles] = useState([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingVehicle, setEditingVehicle] = useState(null)
    const [formData, setFormData] = useState({
        make: '',
        model: '',
        year: '',
        color: '',
        carNumber: '',
        licenseNumber: '',
        capacity: '',
        hasAC: false,
        hasAudio: false,
        kmsDriven: '',
        rcFile: null,
        insuranceFile: null,
        pollutionFile: null,
        photos: []
    })
    const [activeTab, setActiveTab] = useState('details')

    useEffect(() => {
        fetchVehicles()
    }, [])

    const fetchVehicles = async () => {
        try {
            const res = await authService.getVehicles()
            setVehicles(res.data || [])
        } catch (error) {
            console.error('Failed to fetch vehicles:', error)
            toast.error('Failed to load vehicles')
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (e) => {
        const { name, value, type, files } = e.target
        if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: value }))
        } else if (files) {
            setFormData(prev => ({ ...prev, [name]: files[0] }))
        } else {
            setFormData(prev => ({ ...prev, [name]: value }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const vehicleData = new FormData()
            Object.keys(formData).forEach(key => {
                if (key !== 'rcFile' && key !== 'insuranceFile' && key !== 'pollutionFile' && key !== 'photos') {
                    vehicleData.append(key, formData[key])
                }
            })

            if (editingVehicle) {
                await authService.updateVehicle(editingVehicle.id, vehicleData)
                toast.success('Vehicle updated successfully!')
            } else {
                await authService.addVehicle(vehicleData)
                toast.success('Vehicle added successfully!')
            }

            setIsModalOpen(false)
            setEditingVehicle(null)
            setFormData({
                make: '',
                model: '',
                year: '',
                color: '',
                carNumber: '',
                licenseNumber: '',
                capacity: '',
                hasAC: false,
                hasAudio: false,
                kmsDriven: '',
                rcFile: null,
                insuranceFile: null,
                pollutionFile: null,
                photos: []
            })
            fetchVehicles()
        } catch (error) {
            console.error('Failed to save vehicle:', error)
            toast.error('Failed to save vehicle')
        }
    }

    const handleEdit = (vehicle) => {
        setEditingVehicle(vehicle)
        setFormData({
            make: vehicle.make || '',
            model: vehicle.model || '',
            year: vehicle.year || '',
            color: vehicle.color || '',
            carNumber: vehicle.carNumber || '',
            licenseNumber: vehicle.licenseNumber || '',
            capacity: vehicle.capacity || '',
            hasAC: vehicle.hasAC || false,
            hasAudio: vehicle.hasAudio || false,
            kmsDriven: vehicle.kmsDriven || '',
            rcFile: null,
            insuranceFile: null,
            pollutionFile: null,
            photos: vehicle.photos || []
        })
        setIsModalOpen(true)
    }

    const handleDelete = async (vehicleId) => {
        if (window.confirm('Are you sure you want to delete this vehicle?')) {
            try {
                await authService.deleteVehicle(vehicleId)
                toast.success('Vehicle deleted successfully!')
                fetchVehicles()
            } catch (error) {
                console.error('Failed to delete vehicle:', error)
                toast.error('Failed to delete vehicle')
            }
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                <p className="ml-4 text-lg font-semibold text-gray-700">Loading vehicles...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center">
                            <Car className="h-8 w-8 text-purple-600" />
                            <h1 className="ml-3 text-2xl font-bold text-gray-900">Vehicle Management</h1>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                        >
                            <Plus size={20} />
                            Add Vehicle
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {vehicles.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                            <Car className="h-8 w-8 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Vehicles Added</h3>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">
                            You need to add at least one vehicle before you can start posting rides for passengers.
                        </p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-purple-600 text-white font-bold py-3 px-8 rounded-xl hover:scale-105 transition-transform"
                        >
                            Add Your First Vehicle
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {vehicles.map((vehicle) => (
                            <div key={vehicle.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {vehicle.make} {vehicle.model}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {vehicle.year} • {vehicle.color}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(vehicle)}
                                            className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                                        >
                                            <Settings size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(vehicle.id)}
                                            className="p-2 text-red-600 hover:text-red-800 transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Vehicle Details */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm font-medium text-gray-900">Capacity: {vehicle.capacity} Passengers</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Fuel className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm font-medium text-gray-900">KMs Driven: {vehicle.kmsDriven || '0'} KMs</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm font-medium text-gray-900">AC: {vehicle.hasAC ? 'Available' : 'No'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm font-medium text-gray-900">RC: {vehicle.licenseNumber || 'N/A'}</span>
                                    </div>
                                </div>

                                {/* Vehicle Photos */}
                                {vehicle.photos && vehicle.photos.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="text-sm font-medium text-gray-900 mb-2">Vehicle Photos</h4>
                                        <div className="grid grid-cols-3 gap-2">
                                            {vehicle.photos.map((photo, index) => (
                                                <div key={index} className="relative group">
                                                    <img
                                                        src={photo}
                                                        alt={`Vehicle photo ${index + 1}`}
                                                        className="w-full h-24 object-cover rounded-lg"
                                                    />
                                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg opacity-0 group-hover:opacity-100">
                                                        <button
                                                            onClick={() => {
                                                                // Photo view/delete functionality
                                                                console.log('View photo:', photo)
                                                            }}
                                                            className="absolute top-2 right-2 p-1 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <Eye size={16} className="text-gray-600" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900">
                                {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
                            </h2>
                            <button
                                onClick={() => {
                                    setIsModalOpen(false)
                                    setEditingVehicle(null)
                                    setFormData({
                                        make: '',
                                        model: '',
                                        year: '',
                                        color: '',
                                        carNumber: '',
                                        licenseNumber: '',
                                        capacity: '',
                                        hasAC: false,
                                        hasAudio: false,
                                        kmsDriven: '',
                                        rcFile: null,
                                        insuranceFile: null,
                                        pollutionFile: null,
                                        photos: []
                                    })
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Tabs */}
                            <div className="flex space-x-1 border-b border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('details')}
                                    className={`py-2 px-4 text-sm font-medium ${
                                        activeTab === 'details'
                                            ? 'text-purple-600 border-b-2 border-purple-600'
                                            : 'text-gray-500 hover:text-gray-700 border-transparent'
                                    }`}
                                >
                                    Basic Details
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('documents')}
                                    className={`py-2 px-4 text-sm font-medium ${
                                        activeTab === 'documents'
                                            ? 'text-purple-600 border-b-2 border-purple-600'
                                            : 'text-gray-500 hover:text-gray-700 border-transparent'
                                    }`}
                                >
                                    Documents
                                </button>
                            </div>

                            {/* Basic Details Tab */}
                            {activeTab === 'details' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Make</label>
                                        <input
                                            type="text"
                                            name="make"
                                            value={formData.make}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                                        <input
                                            type="text"
                                            name="model"
                                            value={formData.model}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                                        <input
                                            type="number"
                                            name="year"
                                            value={formData.year}
                                            onChange={handleInputChange}
                                            min="1900"
                                            max={new Date().getFullYear() + 1}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                                        <input
                                            type="text"
                                            name="color"
                                            value={formData.color}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Car Number</label>
                                        <input
                                            type="text"
                                            name="carNumber"
                                            value={formData.carNumber}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
                                        <input
                                            type="text"
                                            name="licenseNumber"
                                            value={formData.licenseNumber}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Capacity</label>
                                        <input
                                            type="number"
                                            name="capacity"
                                            value={formData.capacity}
                                            onChange={handleInputChange}
                                            min="1"
                                            max="8"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">KMs Driven</label>
                                        <input
                                            type="text"
                                            name="kmsDriven"
                                            value={formData.kmsDriven}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                    <div className="flex items-center space-x-6">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                name="hasAC"
                                                checked={formData.hasAC}
                                                onChange={handleInputChange}
                                                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                            />
                                            <span className="ml-2 text-sm font-medium text-gray-700">Air Conditioning</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                name="hasAudio"
                                                checked={formData.hasAudio}
                                                onChange={handleInputChange}
                                                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                            />
                                            <span className="ml-2 text-sm font-medium text-gray-700">Audio System</span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* Documents Tab */}
                            {activeTab === 'documents' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">RC Certificate</label>
                                            <div className="mt-1">
                                                <input
                                                    type="file"
                                                    name="rcFile"
                                                    onChange={handleInputChange}
                                                    accept="image/*,.pdf"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Insurance Certificate</label>
                                            <div className="mt-1">
                                                <input
                                                    type="file"
                                                    name="insuranceFile"
                                                    onChange={handleInputChange}
                                                    accept="image/*,.pdf"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Pollution Certificate</label>
                                            <div className="mt-1">
                                                <input
                                                    type="file"
                                                    name="pollutionFile"
                                                    onChange={handleInputChange}
                                                    accept="image/*,.pdf"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Photos</label>
                                            <div className="mt-1">
                                                <input
                                                    type="file"
                                                    name="photos"
                                                    onChange={handleInputChange}
                                                    accept="image/*"
                                                    multiple
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Form Actions */}
                            <div className="flex justify-end space-x-4 pt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsModalOpen(false)
                                        setEditingVehicle(null)
                                        setFormData({
                                            make: '',
                                            model: '',
                                            year: '',
                                            color: '',
                                            carNumber: '',
                                            licenseNumber: '',
                                            capacity: '',
                                            hasAC: false,
                                            hasAudio: false,
                                            kmsDriven: '',
                                            rcFile: null,
                                            insuranceFile: null,
                                            pollutionFile: null,
                                            photos: []
                                        })
                                    }}
                                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                                >
                                    {editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default VehicleManagement
