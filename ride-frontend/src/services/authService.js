import API from '../utils/axiosConfig'
import axios from 'axios'

const login = async (credentials) => {
    const response = await API.post('/auth/login', credentials)
    if (response.data.token) {
        localStorage.setItem('token', response.data.token)
        if (response.data.role) {
            localStorage.setItem('role', response.data.role)
        }
        localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    return response.data
}

const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
}

const registerAdmin = async (adminData) => {
    const response = await API.post('/auth/register', { ...adminData, role: 'ADMIN' })
    return response.data
}

const registerDriver = async (formData) => {
    const response = await API.post('/auth/driver/register', formData)
    return response.data
}

const registerPassenger = async (formData) => {
    const response = await API.post('/auth/passenger/register', formData)
    return response.data
}

const getCurrentUser = () => {
    const userStr = localStorage.getItem('user')
    if (userStr) return JSON.parse(userStr)
    return null
}

const getProfile = async () => {
    const response = await API.get('/users/profile')
    return response.data
}

const verifyEmail = async (token) => {
    const response = await API.get(`/auth/verify?token=${token}`)
    return response.data
}

const getAdminDashboard = async () => {
    const response = await API.get('/admin/dashboard')
    return response.data
}

const getAllUsers = async () => {
    const response = await API.get('/admin/users')
    return response.data.map((user) => ({
        ...user,
        isVerified: user.isVerified ?? user.verified ?? false
    }))
}

const verifyUser = async (id) => {
    const response = await API.put(`/admin/users/${id}/verify`)
    return response.data
}

const deleteUser = async (id) => {
    const response = await API.delete(`/admin/users/${id}`)
    return response.data
}

// Admin Stats
const getAdminRevenueMonthly = () => API.get('/admin/revenue/monthly');
const getAdminUserGrowth = () => API.get('/admin/users/growth');
const getAdminActiveTrips = () => API.get('/admin/trips/active');
const getAdminCompletionRate = () => API.get('/admin/trips/completion-rate');
const getAdminTopDrivers = () => API.get('/admin/drivers/top');
const getAdminTripsByCity = () => API.get('/admin/trips/by-city');

const changePassword = async (passwordData) => {
    const response = await API.post('/auth/change-password', passwordData)
    return response.data
}

const getDriverProfile = () =>
    API.get('/driver/profile');

const getDriverStats = () =>
    API.get('/driver/dashboard-stats');

const getDriverVehicles = () =>
    API.get('/driver/vehicles');

const addVehicle = (formData) =>
    API.post('/driver/vehicles', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });

const getVehicleById = (id) =>
    API.get(`/driver/vehicles/${id}`);

const updateVehicle = (id, formData) =>
    API.put(`/driver/vehicles/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });

const deleteVehicle = (vehicleId) => axios.delete(
    `http://localhost:8080/api/driver/vehicles/${vehicleId}`,
    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
);

const getDriverRides = () =>
    API.get('/driver/rides');

// Driver Stats
const getDriverEarningsSummary = () => API.get('/driver/earnings/summary');
const getDriverTripStats = () => API.get('/driver/trips/stats');
const getDriverWeeklyTrips = () => API.get('/driver/trips/weekly');
const getDriverRatingStats = () => API.get('/driver/rating');
const getDriverBookings = async () => {
    return await API.get('/driver/bookings')
}

const updateRide = async (rideId, data) => {
    const formattedData = { ...data };

    // Handle date format (if DD-MM-YYYY, convert to YYYY-MM-DD)
    if (data.travelDate && /^\d{2}-\d{2}-\d{4}$/.test(data.travelDate)) {
        const [d, m, y] = data.travelDate.split('-');
        formattedData.travelDate = `${y}-${m}-${d}`;
    }

    // Handle time format (ensure HH:mm:ss)
    if (data.departureTime && /^\d{2}:\d{2}$/.test(data.departureTime)) {
        formattedData.departureTime = `${data.departureTime}:00`;
    }

    return await API.put(`/driver/rides/${rideId}`, formattedData);
};

const searchRides = async (data) => {
    try {
        // Format date as yyyy-MM-dd
        const formattedData = {
            ...data,
            travelDate: data.travelDate // Should already be in yyyy-MM-dd format from input
        };

        const response = await API.post(
            '/passenger/search-rides',
            formattedData
        );
        return response;
    } catch (error) {
        console.error('Search error:', error.response?.data || error.message);
        throw error;
    }
};

const getPassengerProfile = () =>
    API.get('/api/passenger/profile');

const getPassengerStats = () =>
    API.get('/api/passenger/dashboard-stats');

const getPassengerBookings = () =>
    API.get('/passenger/bookings');

const createBooking = (data) =>
    API.post('/passenger/bookings', data);

const cancelBooking = (id) =>
    API.delete(`/passenger/bookings/${id}`);

// Payment endpoints
const createPaymentOrder = (data) =>
    API.post('/payments/order', data);

const verifyPayment = (data) =>
    API.post('/payments/verify', data);

const getSavedRides = () =>
    API.get('/api/passenger/saved-rides');

const saveRide = (data) =>
    API.post('/api/passenger/saved-rides', data);

const removeSavedRide = (rideId) =>
    API.delete(`/api/passenger/saved-rides/${rideId}`);

// Passenger Stats
const getPassengerTripHistory = () => API.get('/passenger/trips/history');
const getPassengerSpendingStats = () => API.get('/passenger/spending/monthly');
const getPassengerFrequentRoutes = () => API.get('/passenger/routes/frequent');
const getPassengerTripBreakdown = () => API.get('/passenger/trips/breakdown');

const calculateDistance = (pickup_location, drop_location) =>
    API.post('/rides/calculate-distance', { pickup_location, drop_location });

const getRideFare = (rideId, pickup, drop) =>
    API.get(`/rides/${rideId}/fare`, { params: { pickup, drop } });

const updateRideFareConfig = async (rideId, fareConfig) => {
    return await API.put(`/driver/rides/${rideId}/fare-config`, fareConfig)
}

const approveBooking = async (bookingId) => {
    return await API.put(`/driver/bookings/${bookingId}/approve`)
        .catch(err => {
            // propagate full error so UI can display response body
            throw err;
        })
}

const rejectBooking = async (bookingId) => {
    return await API.put(`/driver/bookings/${bookingId}/reject`)
}

const postRide = (data) =>
    API.post('/driver/rides', data);

const cancelRide = (rideId) =>
    API.delete(`/driver/rides/${rideId}`);

const authService = {
    login,
    logout,
    registerAdmin,
    registerDriver,
    registerPassenger,
    getCurrentUser,
    getProfile,
    verifyEmail,
    getAdminDashboard,
    getAllUsers,
    verifyUser,
    deleteUser,
    changePassword,
    getDriverProfile,
    getDriverStats,
    getDriverVehicles,
    addVehicle,
    getVehicleById,
    updateVehicle,
    deleteVehicle,
    getDriverRides,
    postRide,
    cancelRide,
    updateRide,
    searchRides,
    getPassengerProfile,
    getPassengerStats,
    getPassengerBookings,
    createBooking,
    cancelBooking,
    getSavedRides,
    saveRide,
    removeSavedRide,
    calculateDistance,
    getRideFare,
    updateRideFareConfig,
    getDriverBookings,
    approveBooking,
    rejectBooking,
    createPaymentOrder,
    verifyPayment,
    // Driver Stats
    getDriverEarningsSummary,
    getDriverTripStats,
    getDriverWeeklyTrips,
    getDriverRatingStats,
    // Passenger Stats
    getPassengerTripHistory,
    getPassengerSpendingStats,
    getPassengerFrequentRoutes,
    getPassengerTripBreakdown,
    // Admin Stats
    getAdminRevenueMonthly,
    getAdminUserGrowth,
    getAdminActiveTrips,
    getAdminCompletionRate,
    getAdminTopDrivers,
    getAdminTripsByCity
}

export default authService
