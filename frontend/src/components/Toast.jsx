import { useEffect } from 'react'

export default function Toast({ open, title, description, type = 'success', onClose, duration = 4000 }) {
  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => onClose?.(), duration)
    return () => clearTimeout(t)
  }, [open, duration, onClose])

  if (!open) return null

  const color =
    type === 'success' ? 'bg-green-600' :
    type === 'error' ? 'bg-red-600' :
    'bg-gray-800'

  return (
    <div className="fixed right-4 top-4 z-50">
      <div className={`rounded-2xl shadow-lg ${color} text-white px-4 py-3 max-w-sm`}>
        {title ? <div className="font-semibold">{title}</div> : null}
        {description ? <div className="text-sm opacity-90">{description}</div> : null}
        <button className="mt-2 text-xs underline underline-offset-2 opacity-90 hover:opacity-100" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  )
}
