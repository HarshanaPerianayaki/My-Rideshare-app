import React from 'react'

const ConfirmModal = ({ title = 'Are you sure?', body = '', onConfirm, onCancel, confirmLabel = 'Yes, Cancel Booking', cancelLabel = 'No', confirmClass = 'bg-blue-600 text-white', danger = false }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel}></div>
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6 z-10">
        <h3 className="text-lg font-bold text-gray-800 mb-3">{title}</h3>
        <p className="text-gray-600 mb-6">{body}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 rounded-md bg-gray-100 text-gray-700">{cancelLabel}</button>
          <button onClick={onConfirm} className={`px-4 py-2 rounded-md font-bold ${danger ? 'bg-red-600 text-white' : confirmClass}`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
