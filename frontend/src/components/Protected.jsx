import { useAuth } from '../context/AuthContext'

export default function Protected({ children, roles }) {
  const { token, loading, user } = useAuth()
  if (loading) return <div className="text-gray-600">Cargando…</div>
  if (!token) return <div>No autorizado</div>
  if (roles && !roles.includes(user?.role)) return <div>No autorizado para esta sección</div>
  return children
}
