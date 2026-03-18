export default function Modal({ open, onClose, title, children }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 animate-fade-in" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 z-10 animate-slide-up">
        {title && <h2 className="text-lg font-bold text-primary-600 mb-3">{title}</h2>}
        {children}
      </div>
    </div>
  )
}
