import { useEffect, useState } from 'react'
import {
  Clock, LogOut, Mail, User, MapPin, Search, Calendar, Users, CreditCard, ChevronRight,
  LayoutDashboard, Heart, CheckCircle2, Tag, MessageCircle, AlertTriangle, AlertCircle,
  Shield, Settings, Bell, Star, TrendingDown, Car, Phone, FileText, Menu, X, ChevronDown,
  Send, MessageCircleMore, MapPinIcon, Navigation2, Loader, Globe, MoreVertical
} from 'lucide-react'
import authService from '../../services/authService'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import RideMap from "../../components/RideMap";
import { geocodeLocation } from "../../utils/geocode";
import { calculateDistance } from "../../utils/osrm";
import ChartCard from '../../components/common/ChartCard'
import ConfirmModal from '../../components/ConfirmModal'
import PaymentModal from '../../components/PaymentModal'
import RazorpayInterface from '../../components/RazorpayInterface'

const MyBookingsView = () => {
  const { user } = useAuth() // for phone number
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [activeBookingId, setActiveBookingId] = useState(null)

  // payment flow state
  const [paymentStep, setPaymentStep] = useState('IDLE') // IDLE | CONFIRMATION_MODAL | PAYMENT_GATEWAY
  const [paymentBooking, setPaymentBooking] = useState(null)

  const openPayment = (booking) => {
    setPaymentBooking(booking)
    setPaymentStep('CONFIRMATION_MODAL')
  }
  const cancelPayment = () => {
    setPaymentBooking(null)
    setPaymentStep('IDLE')
  }

  // invoke server to create order then open Razorpay checkout
  const handleRazorpay = async () => {
    if (!paymentBooking) return
    try {
      const res = await authService.createPaymentOrder({
        bookingId: paymentBooking.id,
        amount: paymentBooking.totalFare
      })
      const { order_id, message } = res.data
      console.log('Order created:', order_id, message)
      
      // Wait for Razorpay to load
      const waitForRazorpay = setInterval(() => {
        if (window.Razorpay) {
          clearInterval(waitForRazorpay)
          
          const options = {
            key: import.meta.env.REACT_APP_RAZORPAY_KEY || 'rzp_test_yourkeyhere',
            amount: Math.round(paymentBooking.totalFare * 100),
            currency: 'INR',
            name: 'Ride Sharing App',
            description: 'Booking payment for ' + paymentBooking.pickupLocation + ' → ' + paymentBooking.dropLocation,
            order_id,
            handler: async function (response) {
              try {
                console.log('Payment response:', response)
                const verifyRes = await authService.verifyPayment({
                  bookingId: paymentBooking.id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpaySignature: response.razorpay_signature
                })
                console.log('Payment verified:', verifyRes.data)
                toast.success('✅ Payment successful!')
                cancelPayment()
                // Refresh bookings to show PAID status
                await new Promise(r => setTimeout(r, 1000))
                fetchBookings()
              } catch (err) {
                console.error('Verification error:', err)
                toast.error('Payment verification failed')
              }
            },
            prefill: {
              contact: user?.phone || '',
              email: user?.email || ''
            },
            theme: { color: '#22c55e' },
            modal: {
              ondismiss: () => {
                console.log('Razorpay modal closed')
              }
            }
          }
          
          const rzp = new window.Razorpay(options)
          rzp.on('payment.failed', function (response) {
            console.error('Payment failed:', response)
            toast.error('Payment failed: ' + response.error.description)
          })
          rzp.open()
        }
      }, 100)
      
      // Timeout if Razorpay doesn't load in 5 seconds
      setTimeout(() => clearInterval(waitForRazorpay), 5000)
    } catch (err) {
      console.error('Payment initiation error:', err)
      toast.error('Payment failed to initiate: ' + (err.response?.data || err.message))
    }
  }

  const confirmPayment = () => {
    // open checkout directly
    handleRazorpay()
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const res = await authService.getPassengerBookings()
      setBookings(res.data || [])
    } catch (err) {
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const openCancelModal = (bookingId) => {
    setActiveBookingId(bookingId)
    setShowConfirmModal(true)
  }

  const handleCancelBooking = async () => {
    const bookingId = activeBookingId
    if (!bookingId) return
    try {
      const res = await authService.cancelBooking(bookingId)
      if (res && (res.status === 200 || res.status === 204 || res.data?.message)) {
        toast.success('Booking cancelled')
        // Optimistically remove the cancelled booking from state
        setBookings(prev => prev.filter(item => item.booking.id !== bookingId))
      } else {
        toast.error('Failed to cancel booking')
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to cancel booking'
      toast.error(msg)
    } finally {
      setShowConfirmModal(false)
      setActiveBookingId(null)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        📋 My Bookings ({bookings.length})
      </h1>

      {bookings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl">
          <Calendar size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Bookings Yet</h3>
          <p className="text-gray-500">Search for rides and make your first booking!</p>
        </div>
      ) : (
        bookings.map(item => {
          const { booking, ride, driver, vehicle } = item;
          return (
            <div
              key={booking.id}
              className="bg-white rounded-2xl shadow-sm p-6 mb-4 border-l-4 border-blue-500"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">
                    {booking.pickupLocation} → {booking.dropLocation}
                  </h3>
                  <div className="flex gap-4 mt-1">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${booking.status === 'PENDING' ? 'bg-blue-100 text-blue-700' :
                      booking.status === 'APPROVED' ? 'bg-indigo-100 text-indigo-700' :
                      booking.status === 'PAID' ? 'bg-green-100 text-green-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                      {booking.status}
                    </span>
                    {driver && (
                      <span className="text-sm text-gray-600 flex items-center gap-1">
                        <User size={14} /> {driver.firstName} {driver.lastName}
                      </span>
                    )}
                    {vehicle && (
                      <span className="text-sm text-gray-600 flex items-center gap-1">
                        <Car size={14} /> {vehicle.model} ({vehicle.color})
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total Fare</p>
                  <p className="text-2xl font-bold text-blue-600">₹{booking.totalFare}</p>
                </div>
              </div>

                <div className="grid grid-cols-4 gap-4 bg-gray-50 rounded-xl p-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500">Pickup</p>
                  <p className="font-semibold text-sm">{booking.pickupLocation}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Drop</p>
                  <p className="font-semibold text-sm">{booking.dropLocation}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Date</p>
                  <p className="font-semibold text-sm">
                    {ride?.departureDate ? new Date(ride.departureDate).toLocaleDateString() : new Date(booking.bookedAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Time</p>
                  <p className="font-semibold text-sm">{ride?.departureTime ? (typeof ride.departureTime === 'string' ? ride.departureTime : new Date(`1970-01-01T${ride.departureTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })) : (booking.departureTime || new Date(booking.bookedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))}</p>
                </div>
                
              </div>

              {(booking.status === 'PENDING' || booking.status === 'APPROVED') && (
                <div className="flex justify-between items-center">
                  <p className="text-sm text-blue-600 font-semibold">{booking.status === 'PENDING' ? '⏳ Waiting for driver approval.' : '✅ Booking approved.'}</p>
                  <div className="flex items-center gap-2">
                    {booking.status === 'APPROVED' && (
                      <button
                        onClick={() => openPayment(booking)}
                        className="px-6 py-2 bg-[#22c55e] text-white font-bold rounded-xl hover:bg-green-600 transition-all"
                      >
                        Proceed to Payment
                      </button>
                    )}
                    <button
                      onClick={() => openCancelModal(booking.id)}
                      className="px-6 py-2 bg-red-50 text-red-600 border border-red-200 font-bold rounded-xl hover:bg-red-100 transition-all"
                    >
                      {booking.status === 'PENDING' ? 'Cancel Booking Request' : 'Cancel Booking'}
                    </button>
                  </div>
                </div>
              )}

              {showConfirmModal && (
                <ConfirmModal
                  title="Are you sure?"
                  body="Are you sure you want to cancel this booking?"
                  confirmLabel="Yes, Cancel Booking"
                  cancelLabel="No"
                  danger={true}
                  onConfirm={handleCancelBooking}
                  onCancel={() => { setShowConfirmModal(false); setActiveBookingId(null) }}
                />
              )}
            </div>
          )
        })
      )}

      {/* payment modal/flow components */}
      <PaymentModal
        isOpen={paymentStep === 'CONFIRMATION_MODAL'}
        amount={paymentBooking?.totalFare}
        onCancel={cancelPayment}
        onConfirm={confirmPayment}
      />

      {paymentStep === 'PAYMENT_GATEWAY' && paymentBooking && (
        <RazorpayInterface
          amount={paymentBooking.totalFare}
          phone={user?.phone}
          onClose={cancelPayment}
        />
      )}

    </div>
  )
}

const SearchRidesView = () => {
  const [fromCity, setFromCity] = useState('')
  const [toCity, setToCity] = useState('')
  const [travelDate, setTravelDate] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [selectedRide, setSelectedRide] = useState(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [source, setSource] = useState(null)
  const [destination, setDestination] = useState(null)
  const [distance, setDistance] = useState(0)
  const [showMap, setShowMap] = useState(false)
  const [geocoding, setGeocoding] = useState(false)

  const pricePerKm = 10 // ₹10 per km as per backend
  const estimatedFare = distance * pricePerKm

  // Geocode cities when they change
  useEffect(() => {
    if (fromCity) {
      handleGeocode(fromCity, 'source')
    }
  }, [fromCity])

  useEffect(() => {
    if (toCity) {
      handleGeocode(toCity, 'destination')
    }
  }, [toCity])

  const handleGeocode = async (city, type) => {
    if (!city) return
    setGeocoding(true)
    try {
      const coords = await geocodeLocation(city)
      if (type === 'source') {
        setSource(coords)
      } else {
        setDestination(coords)
      }
    } catch (error) {
      console.error('Geocoding error:', error)
      toast.error('Could not find location for: ' + city)
    } finally {
      setGeocoding(false)
    }
  }

  const handleSearch = async () => {
    if (!fromCity || !toCity || !travelDate) {
      toast.error('Please fill all fields');
      return;
    }

    if (fromCity === toCity) {
      toast.error('From and To cities cannot be the same');
      return;
    }

    setSearching(true);
    setSearchResults([]);

    try {
      console.log('Searching with:', { fromCity, toCity, travelDate });

      const trimmedFrom = fromCity.trim();
      const trimmedTo = toCity.trim();

      const res = await authService.searchRides({
        fromCity: trimmedFrom,
        toCity: trimmedTo,
        travelDate
      });

      console.log('Search results:', res.data);

      if (res.data && res.data.length > 0) {
        setSearchResults(res.data);
        toast.success(`Found ${res.data.length} ride(s)`);
      } else {
        setSearchResults([]);
        toast('No rides found for this route and date');
      }
    } catch (err) {
      console.error('Search failed:', err);
      const errorMessage = err.response?.data?.message ||
        'Search failed. Please try again.';
      toast.error(errorMessage);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        🔍 Search Rides
      </h1>

      {/* Map Toggle Button */}
      <div className="mb-4">
        <button
          onClick={() => setShowMap(!showMap)}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-all font-semibold"
        >
          {showMap ? '🗺️ Hide Map' : '🗺️ Show Map'}
        </button>
      </div>

      {/* Interactive Map */}
      {showMap && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            📍 Route Map & Distance Calculator
          </h3>
          <RideMap
            source={source}
            destination={destination}
            setDistance={setDistance}
          />
          {distance > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-xl">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Distance</p>
                  <p className="text-2xl font-bold text-blue-600">{distance} KM</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estimated Fare</p>
                  <p className="text-2xl font-bold text-blue-600">₹{estimatedFare.toFixed(2)}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                *Based on ₹{pricePerKm} per kilometer
              </p>
            </div>
          )}
        </div>
      )}

      {/* Search Form */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Start City *
            </label>
            <input
              type="text"
              value={fromCity}
              onChange={e => setFromCity(e.target.value)}
              placeholder="Enter start city"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              End City *
            </label>
            <input
              type="text"
              value={toCity}
              onChange={e => setToCity(e.target.value)}
              placeholder="Enter destination city"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Travel Date *
            </label>
            <input
              type="date"
              value={travelDate}
              onChange={e => setTravelDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
          </div>
        </div>

        <button
          onClick={handleSearch}
          disabled={searching || geocoding}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold py-4 rounded-xl hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 shadow-blue-200 shadow-xl"
        >
          {searching ? (
            <><Loader className="animate-spin inline mr-2" size={20} /> Searching...</>
          ) : geocoding ? (
            <><Loader className="animate-spin inline mr-2" size={20} /> Finding locations...</>
          ) : (
            <>🔍 Search Rides</>
          )}
        </button>
      </div>

      {
        searchResults.length === 0 && !searching && fromCity && toCity && travelDate && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center shadow-sm mb-6">
            <p className="text-yellow-800 font-medium">
              No rides available for this route on the selected date.
            </p>
            <p className="text-yellow-600 text-sm mt-2">
              Try changing the date or check different cities.
            </p>
          </div>
        )
      }

      {/* Search Results */}
      {
        searchResults.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Available Rides ({searchResults.length})
            </h2>

            {searchResults.map(result => (
              <RideResultCard
                key={result.ride.id}
                result={result}
                onBook={() => {
                  setSelectedRide(result)
                  setShowBookingModal(true)
                }}
              />
            ))}
          </div>
        )
      }

      {/* Booking Modal */}
      {
        showBookingModal && selectedRide && (
          <BookingModal
            ride={selectedRide}
            onClose={() => {
              setShowBookingModal(false)
              setSelectedRide(null)
            }}
            onSuccess={() => {
              setShowBookingModal(false)
              handleSearch() // Refresh results
            }}
          />
        )
      }
    </div >
  )
}

const RideResultCard = ({ result, onBook }) => {
  const { ride, driver, vehicle, pickupLocations, dropLocations } = result
  const images = vehicle?.carImagePaths?.split(',') || []

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-4 border border-gray-200 hover:border-blue-300 transition-all hover:shadow-md">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-2xl text-gray-800 flex items-center gap-2">
            📍 {ride.fromCity} → {ride.toCity}
          </h3>
          <div className="flex gap-4 text-sm text-gray-600 mt-2">
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {new Date(ride.travelDate).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {ride.departureTime}
            </span>
            <span className="flex items-center gap-1">
              <Users size={14} />
              {ride.availableSeats} seats available
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Fare per Seat</p>
          <p className="text-3xl font-bold text-blue-600">₹{ride.baseFare}</p>
        </div>
      </div>

      {/* Driver Info */}
      <div className="flex items-center gap-3 mb-4 bg-gray-50 rounded-xl p-3">
        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-lg shadow-blue-100">
          {driver?.firstName?.[0]}
        </div>
        <div>
          <p className="font-semibold text-gray-800">
            Driver: {driver?.firstName} {driver?.lastName}
          </p>
          <div className="flex items-center gap-1 text-sm">
            <Star size={14} className="text-yellow-500 fill-yellow-500" />
            <span className="font-bold">5.0</span>
            <span className="text-gray-500">(Verified Driver)</span>
          </div>
        </div>
      </div>

      {/* Vehicle Photos */}
      <div className="mb-4">
        <p className="text-sm font-semibold text-gray-700 mb-2">🚗 Vehicle Photos (Click to view)</p>
        <div className="flex gap-2 overflow-x-auto">
          {images.slice(0, 4).map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt="Vehicle"
              className="w-20 h-16 rounded-lg object-cover cursor-pointer hover:scale-110 transition-transform"
            />
          ))}
          {images.length > 4 && (
            <div className="w-20 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-xs font-bold text-gray-600">
              +{images.length - 4} more
            </div>
          )}
        </div>
      </div>

      {/* Vehicle Details */}
      <div className="grid grid-cols-2 gap-4 mb-4 bg-gray-50 rounded-xl p-4">
        <div>
          <p className="text-xs text-gray-500">Type</p>
          <p className="font-semibold text-gray-800">Car</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Model</p>
          <p className="font-semibold text-gray-800">{vehicle?.model}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">AC</p>
          <p className="font-semibold text-gray-800">
            {vehicle?.hasAC ? '❄️ Yes' : '🌡️ No'}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Color</p>
          <p className="font-semibold text-gray-800">{vehicle?.color}</p>
        </div>
      </div>

      <button
        onClick={onBook}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all shadow-md"
      >
        Book Now →
      </button>
    </div>
  )
}

const BookingModal = ({ ride, onClose, onSuccess }) => {
  const [seatsBooked, setSeatsBooked] = useState(1)
  const [pickupLocation, setPickupLocation] = useState('')
  const [dropLocation, setDropLocation] = useState('')
  const [calculatedFare, setCalculatedFare] = useState(0)
  const [isBooking, setIsBooking] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [calculatingFare, setCalculatingFare] = useState(false)

  const pickupLocations = JSON.parse(
    ride.ride.pickupLocations || '[]'
  )
  const dropLocations = JSON.parse(
    ride.ride.dropLocations || '[]'
  )

  // Calculate fare when seats/locations change
  useEffect(() => {
    if (pickupLocation && dropLocation && seatsBooked > 0) {
      calculateDynamicFare()
    }
  }, [seatsBooked, pickupLocation, dropLocation])

  const calculateDynamicFare = async () => {
    setCalculatingFare(true)
    try {
      // Use OSRM to calculate distance
      const distance = await calculateDistance(pickupLocation, dropLocation)
      const baseFare = ride.ride.baseFare || 50
      const farePerKm = ride.ride.farePerKm || 10
      const farePerSeat = baseFare + (distance * farePerKm)
      const total = farePerSeat * seatsBooked
      setCalculatedFare(total || (baseFare * seatsBooked))
    } catch (error) {
      console.error('Fare calculation error:', error)
      // Fallback to hardcoded distance
      const distance = 50 // fallback
      const baseFare = ride.ride.baseFare || 50
      const farePerKm = ride.ride.farePerKm || 10
      const farePerSeat = baseFare + (distance * farePerKm)
      const total = farePerSeat * seatsBooked
      setCalculatedFare(total)
    } finally {
      setCalculatingFare(false)
    }
  }

  const handleConfirm = () => {
    if (!pickupLocation || !dropLocation) {
      toast.error('Please select pickup and drop locations')
      return
    }
    setShowConfirm(true)
  }

  const handleBook = async () => {
    setIsBooking(true)
    try {
      await authService.createBooking({
        rideId: ride.ride.id,
        pickupLocation,
        dropLocation,
        seatsBooked,
        totalFare: calculatedFare
      })
      toast.success('Booking successful! Waiting for driver approval.')
      onSuccess()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed')
    } finally {
      setIsBooking(false)
      setShowConfirm(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">Book This Ride</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Seats */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Number of Seats (Max: {ride.ride.availableSeats})
          </label>
          <input
            type="number"
            min={1}
            max={ride.ride.availableSeats}
            value={seatsBooked}
            onChange={e => setSeatsBooked(parseInt(e.target.value) || 1)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-center text-xl font-bold transition-all"
          />
        </div>

        {/* Pickup Location */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Pickup Location in {ride.ride.fromCity}
          </label>
          <select
            value={pickupLocation}
            onChange={e => setPickupLocation(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
          >
            <option value="">Select pickup location</option>
            {pickupLocations.filter(Boolean).map((loc, idx) => (
              <option key={idx} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        {/* Drop Location */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Drop Location in {ride.ride.toCity}
          </label>
          <select
            value={dropLocation}
            onChange={e => setDropLocation(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
          >
            <option value="">Select drop location</option>
            {dropLocations.filter(Boolean).map((loc, idx) => (
              <option key={idx} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        {/* Estimated Fare */}
        {calculatedFare > 0 && (
          <div className="bg-blue-50 rounded-xl p-4 mb-4">
            <p className="text-sm text-gray-600">Estimated Total Fare</p>
            <p className="text-3xl font-bold text-blue-600">
              {calculatingFare ? 'Calculating...' : `₹${calculatedFare.toFixed(2)}`}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Base: ₹{ride.ride.baseFare} + Distance × ₹{ride.ride.farePerKm}/km × {seatsBooked} seat(s)
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!pickupLocation || !dropLocation || calculatingFare}
            className="flex-1 px-4 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-100 transition-all font-semibold"
          >
            Confirm
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 max-w-sm text-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">❓</span>
            </div>
            <h4 className="font-bold text-xl mb-2">Are you sure?</h4>
            <p className="text-gray-600 text-sm mb-6">
              Create a booking request for ₹{calculatedFare.toFixed(2)}?
              Driver needs to approve before you can proceed to payment.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2 border-2 border-gray-200 text-gray-600 font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleBook}
                disabled={isBooking}
                className="flex-1 px-4 py-2 bg-blue-600 text-white font-bold rounded-xl disabled:opacity-50 hover:bg-blue-700 transition-all"
              >
                {isBooking ? 'Booking...' : 'Yes, Create Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const PassengerDashboard = () => {
  console.log('✅ PassengerDashboard LOADED - NEW VERSION')
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState(null)
  const [bookings, setBookings] = useState([])
  const [savedRides, setSavedRides] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false)
  const [selectedRideForBooking, setSelectedRideForBooking] = useState(null)
  const [activeProfileTab, setActiveProfileTab] = useState('personal')
  const [filtersExpanded, setFiltersExpanded] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [bookingFilter, setBookingFilter] = useState('all')
  const [notificationFilter, setNotificationFilter] = useState('all')
  const [seatCount, setSeatCount] = useState(1)
  const [chartData, setChartData] = useState({
    history: null,
    spending: null,
    routes: null,
    breakdown: null
  })
  const [chartsLoading, setChartsLoading] = useState(false)

  // Settings toggles
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    rideReminders: true,
    offerAlerts: true,
    shareLocation: true,
    showProfile: true,
    allowHistory: true
  })

  // Time and greeting
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const getDateString = () => {
    return currentTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, statsData, bookingsData, savedData] = await Promise.all([
          authService.getPassengerProfile(),
          authService.getPassengerStats(),
          authService.getPassengerBookings(),
          authService.getSavedRides()
        ])
        setProfile(profileData)
        setStats(statsData)
        setBookings(bookingsData)
        setSavedRides(savedData)

        fetchChartsData()
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const fetchChartsData = async () => {
    setChartsLoading(true)
    try {
      const [history, spending, routes, breakdown] = await Promise.all([
        authService.getPassengerTripHistory(),
        authService.getPassengerSpendingStats(),
        authService.getPassengerFrequentRoutes(),
        authService.getPassengerTripBreakdown()
      ])
      setChartData({
        history: history.data,
        spending: spending.data,
        routes: routes.data,
        breakdown: breakdown.data
      })
    } catch (error) {
      console.error('Failed to fetch charts:', error)
    } finally {
      setChartsLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleBookRide = async (rideId) => {
    if (!profile?.isVerified) {
      toast.error('Account Pending Approval')
      return
    }
    setSelectedRideForBooking({ id: rideId, seats: seatCount })
    setIsBookingModalOpen(true)
  }

  const confirmBooking = async () => {
    try {
      await authService.createBooking({
        rideId: selectedRideForBooking.id,
        seats: seatCount,
        totalFare: 300
      })
      toast.success('🎉 Booking Confirmed!')
      setIsBookingModalOpen(false)
      setActiveView('bookings')
    } catch (error) {
      toast.error('Failed to create booking')
    }
  }

  const handleSaveRide = async (rideId) => {
    try {
      await authService.saveRide({ rideId })
      toast.success('Ride saved!')
    } catch (error) {
      toast.error('Failed to save ride')
    }
  }

  const handleRemoveSavedRide = async (rideId) => {
    try {
      await authService.removeSavedRide(rideId)
      toast.success('Ride removed')
    } catch (error) {
      toast.error('Failed to remove ride')
    }
  }

  const handleCancelBooking = async (bookingId) => {
    if (!bookingId) return
    if (confirm('Are you sure you want to cancel this booking?')) {
      try {
        const res = await authService.cancelBooking(bookingId)
        if (res && (res.status === 200 || res.status === 204 || res.data?.message)) {
          toast.success('Booking cancelled')
          setBookings(prev => prev.filter(item => item.booking.id !== bookingId))
        } else {
          toast.error('Failed to cancel booking')
        }
      } catch (error) {
        const msg = error.response?.data?.message || 'Failed to cancel booking'
        toast.error(msg)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1E3C72] to-[#2A5298] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (profile && !profile.isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1E3C72] to-[#2A5298] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-12 text-center shadow-2xl border border-blue-100">
          <div className="w-24 h-24 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
            <Clock size={48} className="text-orange-500" />
          </div>
          <h2 className="text-3xl font-black text-gray-800 mb-4">Account Pending Approval</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Your account is currently under review by our admin team. You will receive an email once approved.
          </p>
          <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4 mb-8 border border-gray-200">
            <Mail size={20} className="text-gray-400" />
            <div className="text-left">
              <p className="text-xs text-gray-500 font-bold uppercase">Check your email</p>
              <p className="text-gray-800 font-bold">{profile.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/40 text-red-600 font-bold py-4 rounded-2xl transition-all"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </div>
    )
  }

  // Navigation items
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'search', label: 'Find a Ride', icon: Search },
    { id: 'saved', label: 'Saved Rides', icon: Heart },
    { id: 'bookings', label: 'My Bookings', icon: Calendar },
    { id: 'history', label: 'Trip History', icon: MapPin },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'offers', label: 'Offers', icon: Tag },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'safety', label: 'Safety', icon: Shield },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardHome
          profile={profile}
          stats={stats}
          savedRides={savedRides}
          setActiveView={setActiveView}
          chartData={chartData}
          chartsLoading={chartsLoading}
        />
      case 'search':
        return <SearchRidesView />
      case 'saved':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-sm p-6">
              <h1 className="text-gray-800 font-bold text-2xl">❤️ Saved Rides</h1>
              <p className="text-gray-500 mt-1">Your favourite rides for quick booking</p>
            </div>

            {savedRides.length === 0 ? (
              <div className="bg-white rounded-3xl shadow-sm p-12 text-center">
                <Heart size={64} className="text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-semibold">No saved rides yet</p>
                <p className="text-gray-400 text-sm">Save rides while searching to access them quickly</p>
                <button
                  onClick={() => setActiveView('search')}
                  className="mt-4 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-bold py-2 px-6 rounded-2xl relative overflow-hidden shimmer-button"
                >
                  Find a Ride
                </button>
              </div>
            ) : (
              <div>Saved rides will appear here</div>
            )}
          </div>
        )
      case 'bookings':
        return <MyBookingsView />
      case 'history':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-sm p-6">
              <h1 className="text-gray-800 font-bold text-2xl">🗺️ Trip History</h1>
              <p className="text-gray-500 mt-1">All your completed journeys</p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <p className="text-gray-500 text-sm">Total Trips</p>
                <p className="text-gray-800 text-2xl font-bold mt-1">0</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <p className="text-gray-500 text-sm">Distance Traveled</p>
                <p className="text-gray-800 text-2xl font-bold mt-1">0 km</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <p className="text-gray-500 text-sm">Money Saved</p>
                <p className="text-gray-800 text-2xl font-bold mt-1">₹0</p>
              </div>
            </div>

            {/* Empty State */}
            <div className="bg-white rounded-3xl shadow-sm p-12 text-center">
              <MapPin size={64} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-semibold">No trip history yet</p>
              <p className="text-gray-400 text-sm">Your completed trips will appear here</p>
            </div>
          </div>
        )
      case 'messages':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-sm p-6">
              <h1 className="text-gray-800 font-bold text-2xl">💬 Messages</h1>
              <p className="text-gray-500 mt-1">Chat with your drivers</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[600px]">
              {/* Conversations List */}
              <div className="bg-white rounded-2xl shadow-sm p-4 overflow-y-auto">
                <input type="text" placeholder="Search conversations..." className="w-full border border-gray-200 rounded-xl px-3 py-2 mb-4 focus:border-emerald-500 outline-none" />
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 cursor-pointer">
                    <div className="bg-blue-100 text-blue-700 w-10 h-10 rounded-full font-bold flex items-center justify-center flex-shrink-0">
                      M
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-800">Mohan Kumar</p>
                      <p className="text-gray-500 text-xs truncate">Thanks for booking!</p>
                    </div>
                    <p className="text-gray-400 text-xs flex-shrink-0">Now</p>
                  </div>
                </div>
              </div>

              {/* Chat Area */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm flex flex-col">
                {/* Header */}
                <div className="border-b border-gray-200 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 text-blue-700 w-10 h-10 rounded-full font-bold flex items-center justify-center">
                      M
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Mohan Kumar</p>
                      <p className="text-emerald-600 text-xs">● Online</p>
                    </div>
                  </div>
                  <MoreVertical size={20} className="text-gray-400 cursor-pointer" />
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-800 rounded-3xl px-4 py-2 max-w-xs">
                      <p className="text-sm">Hi, I've booked your ride for tomorrow</p>
                      <p className="text-gray-500 text-xs mt-1">10:30 AM</p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-emerald-500 text-white rounded-3xl px-4 py-2 max-w-xs">
                      <p className="text-sm">Sure, I'll be at the pickup point by 9 AM</p>
                      <p className="text-emerald-100 text-xs mt-1">10:32 AM</p>
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-800 rounded-3xl px-4 py-2 max-w-xs">
                      <p className="text-sm">Great, thank you!</p>
                      <p className="text-gray-500 text-xs mt-1">10:33 AM</p>
                    </div>
                  </div>
                </div>

                {/* Input */}
                <div className="border-t border-gray-200 p-4 flex gap-3">
                  <input type="text" placeholder="Type a message..." className="flex-1 border border-gray-200 rounded-2xl px-4 py-3 focus:border-emerald-500 outline-none" />
                  <button className="bg-gradient-to-r from-emerald-500 to-emerald-700 text-white rounded-2xl px-6 py-3 flex items-center gap-2 hover:shadow-md transition-all relative overflow-hidden shimmer-button">
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      case 'payments':
        return (
          <div className="space-y-6">
            {/* Wallet Card */}
            <div className="bg-gradient-to-r from-emerald-700 to-emerald-500 rounded-3xl p-8 text-white">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-emerald-100 text-sm">💳 Wallet Balance</p>
                  <p className="text-5xl font-black mt-2">₹0.00</p>
                  <p className="text-emerald-100 text-sm mt-2">Add money to book rides instantly</p>
                </div>
                <div className="flex gap-3 mt-6 md:mt-0">
                  <button
                    onClick={() => toast.success('Wallet top-up coming soon!')}
                    className="bg-white text-emerald-700 font-bold py-3 px-6 rounded-2xl hover:bg-emerald-50 transition-all"
                  >
                    + Add Money
                  </button>
                  <button className="border-2 border-white text-white font-bold py-3 px-6 rounded-2xl hover:bg-white/10 transition-all">
                    Withdraw
                  </button>
                </div>
              </div>
            </div>

            {/* Payment Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <p className="text-gray-500 text-sm font-medium">Total Spent</p>
                <p className="text-red-600 font-bold text-2xl mt-2">₹0</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <p className="text-gray-500 text-sm font-medium">Total Saved</p>
                <p className="text-emerald-600 font-bold text-2xl mt-2">₹0</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <p className="text-gray-500 text-sm font-medium">Last Transaction</p>
                <p className="text-gray-800 font-bold text-2xl mt-2">N/A</p>
              </div>
            </div>

            {/* Transaction History */}
            <div className="bg-white rounded-3xl shadow-sm p-6">
              <h2 className="text-gray-800 font-bold text-lg mb-4">Transaction History</h2>
              <div className="text-center py-12">
                <CreditCard size={64} className="text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-semibold">No transactions yet</p>
                <p className="text-gray-400 text-sm">Your payment history will appear here</p>
              </div>
            </div>
          </div>
        )
      case 'offers':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-sm p-6">
              <h1 className="text-gray-800 font-bold text-2xl">🎁 Exclusive Offers</h1>
              <p className="text-gray-500 mt-1">Grab the best deals on your rides</p>
            </div>

            <div className="bg-white rounded-3xl shadow-sm p-12 text-center">
              <Tag size={64} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-semibold">No offers available right now</p>
              <p className="text-gray-400 text-sm">Check back later for exciting discounts!</p>
            </div>
          </div>
        )
      case 'reviews':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-sm p-6">
              <h1 className="text-gray-800 font-bold text-2xl">⭐ My Reviews</h1>
              <p className="text-gray-500 mt-1">Feedback from your drivers</p>
            </div>

            <div className="bg-white rounded-3xl shadow-sm p-12 text-center">
              <Star size={64} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-semibold">No reviews yet</p>
              <p className="text-gray-400 text-sm">Reviews from drivers will appear here after your rides</p>
            </div>
          </div>
        )
      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-sm p-6">
              <h1 className="text-gray-800 font-bold text-2xl">🔔 Notifications</h1>
              <p className="text-gray-500 mt-1">Your latest updates and alerts</p>
            </div>

            <div className="bg-white rounded-3xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-gray-800 font-bold text-lg">All Notifications</h2>
                <select
                  value={notificationFilter}
                  onChange={(e) => setNotificationFilter(e.target.value)}
                  className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:border-blue-500 outline-none"
                >
                  <option value="all">All</option>
                  <option value="unread">Unread</option>
                  <option value="booking">Booking</option>
                  <option value="offer">Offers</option>
                </select>
              </div>
              <div className="space-y-4">
                <div className="flex gap-3 pb-4 border-b">
                  <div className="bg-emerald-100 text-emerald-600 w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Bell size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Welcome to SmartRide! 🎉</p>
                    <p className="text-gray-500 text-sm">Complete your profile to get started</p>
                    <p className="text-gray-400 text-xs">Just now</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="bg-blue-100 text-blue-600 w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Car size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Find Your First Ride 🚗</p>
                    <p className="text-gray-500 text-sm">Search for available rides on your route</p>
                    <p className="text-gray-400 text-xs">2 mins ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      case 'safety':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-sm p-6">
              <h1 className="text-gray-800 font-bold text-2xl">🛡️ Safety Center</h1>
              <p className="text-gray-500 mt-1">Your safety is our priority</p>
            </div>

            <div className="bg-white rounded-3xl shadow-sm p-6">
              <h2 className="text-gray-800 font-bold text-lg mb-4">Emergency Contacts</h2>
              <p className="text-gray-500 text-sm mb-4">Add trusted contacts who can be notified in case of an emergency during a ride.</p>
              <button className="bg-blue-500 text-white font-bold py-2 px-4 rounded-xl hover:bg-blue-600 transition-all">
                Add Emergency Contact
              </button>
            </div>

            <div className="bg-white rounded-3xl shadow-sm p-6">
              <h2 className="text-gray-800 font-bold text-lg mb-4">Share My Ride</h2>
              <p className="text-gray-500 text-sm mb-4">You can share your live ride status with friends and family for peace of mind.</p>
              <button className="bg-emerald-500 text-white font-bold py-2 px-4 rounded-xl hover:bg-emerald-600 transition-all">
                Learn More
              </button>
            </div>
          </div>
        )
      case 'profile':
        return <ProfileView profile={profile} setProfile={setProfile} activeTab={activeProfileTab} setActiveTab={setActiveProfileTab} />
      case 'settings':
        return <SettingsView settings={settings} setSettings={setSettings} />
      default:
        return <DashboardHome
          profile={profile}
          stats={stats}
          savedRides={savedRides}
          setActiveView={setActiveView}
          chartData={chartData}
          chartsLoading={chartsLoading}
        />
    }
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#1E3C72] to-[#2A5298]">
      {/* SIDEBAR */}
      <div
        className={`fixed md:static w-64 h-screen z-40 transition-transform duration-300 bg-white shadow-2xl border-r border-gray-100 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        style={{
          position: 'relative'
        }}
      >
        <div className="flex flex-col h-full">
          {/* Top Section */}
          <div className="p-6 border-b border-white/10">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-300 flex items-center justify-center mb-3">
              <span className="text-2xl font-bold text-blue-900">{profile?.firstName?.[0]?.toUpperCase() || 'P'}</span>
            </div>
            <h3 className="text-gray-800 font-bold text-base">{profile?.firstName} {profile?.lastName}</h3>
            <p className="text-blue-600 text-xs mt-1 truncate">{profile?.email}</p>
            <div className="mt-2 flex gap-2">
              {profile?.isVerified ? (
                <span className="bg-emerald-500 text-white rounded-full px-3 py-1 text-xs font-bold">✓ Verified</span>
              ) : (
                <span className="bg-orange-500 text-white rounded-full px-3 py-1 text-xs font-bold">⏳ Pending</span>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {navItems.map(item => {
              const Icon = item.icon
              const isActive = activeView === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id)
                    setSidebarOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mx-1 mb-1 cursor-pointer transition-all duration-200 ${isActive
                    ? 'bg-blue-50 text-blue-700 font-bold shadow-sm'
                    : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50/50'
                    }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                  {item.id === 'notifications' && (
                    <span className="ml-auto w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Bottom Section */}
          <div className="p-4 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 bg-red-500/20 hover:bg-red-500/40 text-red-300 hover:text-white border-0 rounded-2xl px-4 py-3 transition-all duration-200 font-bold"
            >
              <LogOut size={20} /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-y-auto p-6 bg-transparent relative">
        <div className="absolute inset-0 pointer-events-none opacity-5">
          <div className="absolute top-10 left-10 w-64 h-64 bg-blue-500 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: '1.5s' }}
          />
        </div>
        {/* Mobile Menu Toggle */}
        <div className="md:hidden fixed top-4 left-4 z-50">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="bg-emerald-600 text-white p-2 rounded-lg"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 md:p-6">
          {renderContent()}
        </div>
      </div>

      {/* BOOKING MODAL */}
      {
        isBookingModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-gray-800 font-bold text-xl">Confirm Your Booking</h2>
                <button
                  onClick={() => setIsBookingModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="bg-emerald-50 rounded-3xl p-5 mb-6">
                <p className="text-sm text-gray-600 mb-2">Trip Summary</p>
                <p className="font-bold text-gray-800">Delhi → Gurgaon</p>
                <p className="text-gray-600 text-sm mt-1">Today, 10:00 AM</p>
                <p className="text-gray-600 text-sm">Driver: Mohan Kumar ⭐ 4.5</p>
                <p className="text-gray-600 text-sm">Vehicle: Sedan - DL01AB1234</p>
              </div>

              <div className="mb-4">
                <p className="text-gray-700 font-semibold mb-3">Number of Seats:</p>
                <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-3">
                  <button
                    onClick={() => setSeatCount(Math.max(1, seatCount - 1))}
                    className="w-8 h-8 bg-emerald-500 text-white rounded-lg font-bold hover:bg-emerald-600"
                  >
                    −
                  </button>
                  <span className="font-bold text-gray-800 text-lg">{seatCount}</span>
                  <button
                    onClick={() => setSeatCount(Math.min(3, seatCount + 1))}
                    className="w-8 h-8 bg-emerald-500 text-white rounded-lg font-bold hover:bg-emerald-600"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="border-t pt-4 mb-6">
                <p className="text-gray-600 mb-2">Fare per seat: <span className="text-gray-800 font-bold">₹150</span></p>
                <p className="text-gray-600 mb-2">Seats: <span className="text-gray-800 font-bold">× {seatCount}</span></p>
                <div className="border-t my-2"></div>
                <p className="text-gray-600">Total: <span className="text-emerald-600 font-bold text-2xl">₹{150 * seatCount}</span></p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setIsBookingModalOpen(false)}
                  className="border-2 border-gray-200 text-gray-600 font-bold py-3 rounded-2xl hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmBooking}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-bold py-3 rounded-2xl hover:shadow-lg transition-all relative overflow-hidden shimmer-button"
                >
                  Confirm ✓
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  )
}

const StatCard = ({ icon: Icon, iconColor, value, label, sub, border }) => (
  <div className={`bg-white rounded-2xl shadow-sm p-6 border-l-4 border-${border}-500 transition-all duration-300 hover:scale-105 hover:shadow-xl`}>
    <div className={`w-12 h-12 rounded-full mb-4 flex items-center justify-center bg-${iconColor}-50 text-${iconColor}-600`}>
      <Icon size={24} />
    </div>
    <p className="text-4xl font-bold text-gray-800 mb-1">{value}</p>
    <p className="text-gray-700 font-bold mb-1">{label}</p>
    <p className="text-gray-400 text-sm">{sub}</p>
  </div>
)

const QuickActionButton = ({ icon: Icon, label, gradient, onClick }) => (
  <button
    onClick={onClick}
    className={`bg-gradient-to-r ${gradient} text-white p-6 rounded-3xl shadow-lg flex items-center gap-4 transition-all hover:scale-105 active:scale-95 group relative overflow-hidden shimmer-button`}
  >
    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center group-hover:rotate-12 transition-transform">
      <Icon size={24} />
    </div>
    <div className="text-left">
      <p className="font-black text-xl leading-tight">{label}</p>
      <p className="text-white/70 text-sm font-bold">Manage now →</p>
    </div>
  </button>
)

const DashboardHome = ({ profile, stats, savedRides, setActiveView, chartData, chartsLoading }) => {
  const getTimeGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8 font-black">
        <h1 className="text-4xl text-white mb-2">{getTimeGreeting()}, {profile?.firstName}!</h1>
        <p className="text-blue-100 text-xl">Where are you heading today?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard icon={MapPin} iconColor="emerald" value={stats?.totalTrips || 0} label="Total Trips" sub="Completed journeys" border="emerald" />
        <StatCard icon={CreditCard} iconColor="blue" value={`₹${stats?.totalSpent || 0}`} label="Total Spends" sub="Lifetime" border="blue" />
        <StatCard icon={Heart} iconColor="pink" value={savedRides?.length || 0} label="Saved Rides" sub="Favorites" border="pink" />
        <StatCard icon={Shield} iconColor="indigo" value="Active" label="Safety Level" sub="Shield Protected" border="indigo" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <QuickActionButton icon={Search} label="Find a Ride" gradient="from-emerald-500 to-emerald-700" onClick={() => setActiveView('search')} />
        <QuickActionButton icon={Calendar} label="My Bookings" gradient="from-blue-500 to-blue-700" onClick={() => setActiveView('bookings')} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <ChartCard
          title="Trip History (Monthly)"
          type="area"
          data={chartData.history}
          loading={chartsLoading}
          colors={['#10b981']}
          currency={false}
        />
        <ChartCard
          title="Spending Patterns"
          type="bar"
          data={chartData.spending}
          loading={chartsLoading}
          colors={['#3b82f6']}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartCard
          title="Most Frequent Routes"
          type="pie"
          data={chartData.routes}
          loading={chartsLoading}
          colors={['#10b981', '#3b82f6', '#f59e0b', '#ef4444']}
          currency={false}
        />
        <ChartCard
          title="Trip Breakdown"
          type="line"
          data={chartData.breakdown}
          loading={chartsLoading}
          colors={['#8b5cf6']}
          currency={false}
        />
      </div>
    </div>
  )
}

const ProfileView = ({ profile, activeTab, setActiveTab }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-sm p-6">
        <h1 className="text-gray-800 font-bold text-2xl">👤 My Profile</h1>
        <p className="text-gray-500 mt-1">Manage your personal information</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'personal', label: '👤 Personal' },
          { id: 'address', label: '📍 Address' },
          { id: 'education', label: '🎓 Education' },
          { id: 'documents', label: '📄 Documents' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-2xl px-5 py-2 font-bold transition-all ${activeTab === tab.id
              ? 'bg-emerald-500 text-white'
              : 'bg-white text-gray-600 border border-gray-200'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-sm p-8">
        {activeTab === 'personal' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: 'First Name', value: profile?.firstName },
              { label: 'Last Name', value: profile?.lastName },
              { label: 'Email Address', value: profile?.email },
              { label: 'Phone Number', value: profile?.phoneNumber }
            ].map((field, i) => (
              <div key={i}>
                <p className="text-gray-500 text-xs uppercase font-black mb-1 ml-1">{field.label}</p>
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <p className="text-gray-800 font-bold">{field.value || 'N/A'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'address' && <p className="text-gray-500 font-bold text-center py-12">Address details coming soon.</p>}
        {activeTab === 'education' && <p className="text-gray-500 font-bold text-center py-12">Education details coming soon.</p>}
        {activeTab === 'documents' && <p className="text-gray-500 font-bold text-center py-12">Documents coming soon.</p>}
      </div>
    </div>
  )
}

const SettingsView = ({ settings, setSettings }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-sm p-6">
        <h1 className="text-gray-800 font-bold text-2xl">⚙️ Settings</h1>
        <p className="text-gray-500 mt-1">Account & Privacy preferences</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm p-6">
        <h2 className="text-gray-800 font-bold text-lg mb-6">Notifications</h2>
        <div className="space-y-4">
          {[
            { key: 'emailNotifications', label: 'Email Notifications' },
            { key: 'smsNotifications', label: 'SMS Notifications' },
            { key: 'pushNotifications', label: 'Push Notifications' }
          ].map(item => (
            <div key={item.key} className="flex justify-between items-center py-3 border-b border-gray-50">
              <p className="font-bold text-gray-700">{item.label}</p>
              <button
                onClick={() => setSettings(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                className={`relative inline-flex h-6 w-12 rounded-full transition-colors ${settings[item.key] ? 'bg-emerald-500' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${settings[item.key] ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PassengerDashboard
