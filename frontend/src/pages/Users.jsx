import { useState } from 'react'
import { api } from '../api/client'
import Toast from '../components/Toast'
import Protected from '../components/Protected'

export default function Users() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('operador')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState({ open: false, title: '', description: '', type: 'success' })

  async function onSubmit(e) {
    e.preventDefault()
    if (!username || !password) {
      setToast({ open: true, title: 'Faltan datos', description: 'Completá usuario y contraseña', type: 'error' })
      return
    }
    setLoading(true)
    try {
      await api.post('/auth/register', { username, password, role })
      setToast({
        open: true,
        title: 'Usuario creado',
        description: `Se creó '${username}' con rol '${role}'.`,
        type: 'success'
      })
      setUsername('')
      setPassword('')
      setRole('operador')
    } catch (err) {
      const msg = err?.response?.data?.error || 'No se pudo crear el usuario'
      setToast({ open: true, title: 'Error', description: msg, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Protected roles={['admin']}>
      <Toast
        open={toast.open}
        title={toast.title}
        description={toast.description}
        type={toast.type}
        onClose={() => setToast(t => ({ ...t, open: false }))}
      />

      <div className="card max-w-xl">
        <h2 className="mb-2 text-lg font-semibold">Crear usuario</h2>
        <p className="mb-4 text-sm text-gray-600">
          Los administradores pueden crear nuevos usuarios con rol <b>admin</b> u <b>operador</b>.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label">Usuario</label>
            <input
              className="input mt-1"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="usuario"
              autoComplete="off"
            />
          </div>
          <div>
            <label className="label">Contraseña</label>
            <input
              className="input mt-1"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="label">Rol</label>
            <select className="input mt-1" value={role} onChange={e => setRole(e.target.value)}>
              <option value="operador">operador</option>
              <option value="admin">admin</option>
            </select>
          </div>

          <div className="pt-2">
            <button className="btn btn-primary" disabled={loading}>
              {loading ? 'Creando…' : 'Crear usuario'}
            </button>
          </div>
        </form>

        <p className="mt-4 text-xs text-gray-500">
          Tip: el primer usuario se puede crear desde la pantalla de login si el sistema está vacío.
        </p>
      </div>
    </Protected>
  )
}
