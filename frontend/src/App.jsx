import { AuthProvider, useAuth } from './context/AuthContext'
import LoginForm from './components/LoginForm'
import Protected from './components/Protected'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Publications from './pages/Publications'
import Users from './pages/Users'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

function Layout() {
  const { token, logout } = useAuth()
  return (
    <div className="flex min-h-screen">
      {token ? <Sidebar /> : null}
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <h1 className="text-lg font-semibold">Intranet Meli</h1>
            {token ? (
              <button className="btn btn-secondary" onClick={logout}>Salir</button>
            ) : null}
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
          <Routes>
            <Route
              path="/"
              element={
                token ? <Navigate to="/dashboard" replace /> : (
                  <div className="mx-auto max-w-md">
                    <div className="card">
                      <h2 className="mb-4 text-xl font-semibold">Acceso</h2>
                      <LoginForm />
                    </div>
                  </div>
                )
              }
            />
            <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
            <Route path="/publications" element={<Protected><Publications /></Protected>} />
            <Route path="/users" element={<Protected roles={['admin']}><Users /></Protected>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </AuthProvider>
  )
}
