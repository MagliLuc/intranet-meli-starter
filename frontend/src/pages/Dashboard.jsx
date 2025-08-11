import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import Toast from '../components/Toast'

export default function Dashboard() {
  const { user } = useAuth()
  const [me, setMe] = useState(null)
  const [tokenInfo, setTokenInfo] = useState(null)
  const [pubs, setPubs] = useState(null)
  const [orders, setOrders] = useState(null)

  const [toast, setToast] = useState({ open: false, title: '', description: '', type: 'success' })
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'

  useEffect(() => {
    const url = new URL(window.location.href)
    const meli = url.searchParams.get('meli')
    const reason = url.searchParams.get('reason')
    if (meli === 'ok') {
      setToast({ open: true, title: 'Cuenta conectada', description: 'Autorización con Mercado Libre completada.', type: 'success' })
    } else if (meli === 'error') {
      setToast({ open: true, title: 'Error al conectar Mercado Libre', description: reason || 'No se pudo completar la autorización.', type: 'error' })
    }
    if (meli) {
      url.searchParams.delete('meli')
      url.searchParams.delete('reason')
      window.history.replaceState({}, '', url.toString())
    }
  }, [])

  async function fetchMe() {
    const { data } = await api.get('/auth/me'); setMe(data)
  }
  async function fetchMeliToken() {
    const { data } = await api.get('/meli/token'); setTokenInfo(data)
  }
  async function refreshMeli() {
    const { data } = await api.post('/meli/oauth/refresh'); setTokenInfo(data)
  }
  function connectMeli() { window.location.href = `${baseURL}/meli/oauth/login` }
  async function fetchPublications() {
    const { data } = await api.get('/publications'); setPubs(data)
  }
  async function fetchSales() {
    const { data } = await api.get('/sales'); setOrders(data)
  }

  return (
    <>
      <Toast open={toast.open} title={toast.title} description={toast.description} type={toast.type} onClose={() => setToast(t => ({ ...t, open: false }))} />
      <div className="grid gap-6 md:grid-cols-2">
        <div className="card">
          <h2 className="mb-2 text-lg font-semibold">Estado de sesión</h2>
          <p className="text-sm text-gray-600">Usuario interno:</p>
          <pre className="mt-2 overflow-auto rounded-xl bg-gray-100 p-3 text-sm">
{JSON.stringify(user, null, 2)}
          </pre>
          <div className="mt-3 flex gap-2">
            <button className="btn btn-secondary" onClick={fetchMe}>GET /auth/me</button>
          </div>
          {me && <pre className="mt-3 overflow-auto rounded-xl bg-gray-100 p-3 text-sm">
{JSON.stringify(me, null, 2)}
          </pre>}
        </div>

        <div className="card">
          <h2 className="mb-2 text-lg font-semibold">Mercado Libre</h2>
          <p className="text-sm text-gray-600">Conectar y gestionar tokens OAuth.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="btn btn-primary" onClick={connectMeli}>Conectar Mercado Libre</button>
            <button className="btn btn-secondary" onClick={fetchMeliToken}>GET /meli/token</button>
            <button className="btn btn-secondary" onClick={refreshMeli}>POST /meli/oauth/refresh</button>
          </div>
          {tokenInfo && <pre className="mt-3 overflow-auto rounded-xl bg-gray-100 p-3 text-sm">
{JSON.stringify(tokenInfo, null, 2)}
          </pre>}
        </div>

        <div className="card">
          <h2 className="mb-2 text-lg font-semibold">Publicaciones (protegido)</h2>
          <div className="flex gap-2">
            <button className="btn btn-secondary" onClick={fetchPublications}>GET /publications</button>
          </div>
          {pubs && <pre className="mt-3 overflow-auto rounded-xl bg-gray-100 p-3 text-sm">
{JSON.stringify(pubs, null, 2)}
          </pre>}
        </div>

        <div className="card">
          <h2 className="mb-2 text-lg font-semibold">Ventas / Órdenes (protegido)</h2>
          <div className="flex gap-2">
            <button className="btn btn-secondary" onClick={fetchSales}>GET /sales</button>
          </div>
          {orders && <pre className="mt-3 overflow-auto rounded-xl bg-gray-100 p-3 text-sm">
{JSON.stringify(orders, null, 2)}
          </pre>}
        </div>
      </div>
    </>
  )
}
