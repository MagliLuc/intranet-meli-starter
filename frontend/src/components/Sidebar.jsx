import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function NavItem({ to, children }) {
  const { pathname } = useLocation()
  const active = pathname === to
  return (
    <Link
      to={to}
      className={`block rounded-xl px-3 py-2 text-sm transition
        ${active ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}
      `}
    >
      {children}
    </Link>
  )
}

export default function Sidebar() {
  const { user } = useAuth()
  const role = user?.role

  return (
    <aside className="h-full w-64 shrink-0 border-r bg-white p-4">
      <div className="mb-4">
        <div className="text-sm text-gray-500">Sesión</div>
        <div className="font-semibold">{user?.username}</div>
        <div className="text-xs text-gray-500">Rol: {role}</div>
      </div>

      <nav className="space-y-1">
        <NavItem to="/dashboard">Dashboard</NavItem>
        <NavItem to="/publications">Publicaciones</NavItem>

        {/* Solo admin */}
        {role === 'admin' && (
          <>
            <div className="mt-3 text-xs font-semibold uppercase text-gray-400">Administración</div>
            <NavItem to="/users">Usuarios</NavItem>
          </>
        )}
      </nav>
    </aside>
  )
}
