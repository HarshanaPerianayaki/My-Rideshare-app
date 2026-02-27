import React from 'react'
import { X } from 'lucide-react'

const RazorpayInterface = ({ amount, phone, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex bg-white">
      {/* Sidebar */}
      <div className="w-1/3 bg-blue-700 text-white flex flex-col p-6">
        <h2 className="text-2xl font-bold mb-6">Ride Sharing App</h2>
        <div className="mt-auto">
          <p className="text-sm uppercase tracking-wide">Price Summary</p>
          <p className="text-4xl font-black mt-2">₹{amount}</p>
        </div>
        <div className="mt-6 text-sm">Using as +91 {phone || 'xxxxxxxxxx'}</div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6 overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
        <h3 className="text-lg font-bold mb-4">Recommended</h3>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-4 border rounded-xl text-center cursor-pointer hover:shadow">
            <p className="font-semibold">UPI QR</p>
            <img
              src="https://via.placeholder.com/120"
              alt="QR code"
              className="mx-auto mt-2"
            />
          </div>
          <div className="p-4 border rounded-xl text-center cursor-pointer hover:shadow">
            <p className="font-semibold">UPI - PhonePe</p>
          </div>
        </div>

        <h3 className="text-lg font-bold mb-4">Other Options</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border rounded-xl text-center cursor-pointer hover:shadow">Cards</div>
          <div className="p-4 border rounded-xl text-center cursor-pointer hover:shadow">Netbanking</div>
          <div className="p-4 border rounded-xl text-center cursor-pointer hover:shadow">Wallet</div>
          <div className="p-4 border rounded-xl text-center cursor-pointer hover:shadow">Pay Later</div>
        </div>
      </div>
    </div>
  )
}

export default RazorpayInterface
