import React from 'react'

const PaymentModal = ({ isOpen, amount, onConfirm, onCancel }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel}></div>
      <div className="relative bg-white rounded-2xl shadow-lg w-full max-w-sm p-6 z-10">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Payment</h2>
        <p className="text-gray-800 text-3xl font-bold mb-4">₹{amount}</p>
        <p className="text-gray-600 mb-6">You will be redirected to Razorpay secure payment gateway to complete your payment</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-white text-gray-700 border border-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-[#7e22ce] text-white hover:bg-purple-800"
          >
            Pay ₹{amount}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PaymentModal
