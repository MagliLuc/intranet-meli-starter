import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function LoginForm() {
  const { login } = useAuth()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // “Primer uso”
  const [canSelfRegister, setCanSelfRegister] = useState(false)
  const [forceSelfRegister, setForceSelfRegister] = useState(false)

  // Fields
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')

  // Leer ?first=1 para forzar el formulario inicial
  useEffect(() => {
    const url = new URL(window.location.href)
    if (url.searchParams.get('first') === '1') setForceSelfRegister(true)
  }, [])

  // Consultar /auth/first-run (si falla, dejamos login pero con opción de forzar)
  useEffect(() => {
    let ignore = false
    async function checkFirstRun() {
      try {
        const { data } = await api.get('/auth/first-run')
        if (!ignore) setCanSelfRegister(Boolean(data?.canSelfRegister))
      } catch (e) {
        // Si falla, mostramos link para forzar registro inicial
        if (!ignore) setCanSelfRegister(false)
      }
    }
    checkFirstRun()
    return () => { ignore = true }
  }, [])

  // --- LOGIN ---
  async function onLogin(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { username, password })
      login(data.token)
    } catch (err) {
      setError(err?.response?.data?.error || 'Error de autenticación')
    } finally {
      setLoading(false)
    }
  }

  // --- REGISTRO INICIAL ---
  async function onRegister(e) {
    e.preventDefault()
    setError('')
    if (!username || !password) return setError('Completá usuario y contraseña')
    if (password !== password2) return setError('Las contraseñas no coinciden')

    setLoading(true)
    try {
      // El backend asigna 'admin' si es el primer usuario
      const { data } = await api.post('/auth/register', { username, password })
      login(data.token)
    } catch (err) {
      setError(err?.response?.data?.error || 'No se pudo crear el usuario inicial')
    } finally {
      setLoading(false)
    }
  }

  const showSelfRegister = canSelfRegister || forceSelfRegister

  if (showSelfRegister) {
    return (
      <form onSubmit={onRegister} className="space-y-4">
        <p className="rounded-xl bg-blue-50 p-3 text-sm text-blue-900">
          Creá el <b>primer usuario (admin)</b> para empezar.
        </p>
        <div>
          <label className="label">Usuario</label>
          <input className="input mt-1" value={username}
                 onChange={e => setUsername(e.target.value)} placeholder="admin" />
        </div>
        <div>
          <label className="label">Contraseña</label>
          <input className="input mt-1" type="password" value={password}
                 onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        <div>
          <label className="label">Repetí la contraseña</label>
          <input className="input mt-1" type="password" value={password2}
                 onChange={e => setPassword2(e.target.value)} placeholder="••••••••" />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button className="btn btn-primary w-full" disabled={loading}>
          {loading ? 'Creando…' : 'Crear y acceder'}
        </button>
        <button
          type="button"
          className="mt-2 w-full text-xs underline text-gray-600"
          onClick={() => setForceSelfRegister(false)}
        >
          Volver al login
        </button>
      </form>
    )
  }

  // Login normal
  return (
    <form onSubmit={onLogin} className="space-y-4">
      <div>
        <label className="label">Usuario</label>
        <input className="input mt-1" value={username}
               onChange={e => setUsername(e.target.value)} autoComplete="username" />
      </div>
      <div>
        <label className="label">Contraseña</label>
        <input className="input mt-1" type="password" value={password}
               onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button className="btn btn-primary w-full" disabled={loading}>
        {loading ? 'Ingresando…' : 'Ingresar'}
      </button>
      <p className="text-xs text-gray-500 mt-2">
        {`¿Primer uso? `}
        <button type="button" className="underline" onClick={() => setForceSelfRegister(true)}>
          Crear primer usuario
        </button>
        {` o agregá "?first=1" a la URL.`}
      </p>
    </form>
  )
}
