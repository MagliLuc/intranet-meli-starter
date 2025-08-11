import { useEffect, useMemo, useState } from 'react'
import { api } from '../api/client'
import Toast from '../components/Toast'
import { useAuth } from '../context/AuthContext'

function Row({ p, isAdmin, onPause, onActivate }) {
  return (
    <tr className="border-b last:border-none">
      <td className="px-3 py-2 text-sm">{p.meli_id}</td>
      <td className="px-3 py-2 text-sm">{p.title}</td>
      <td className="px-3 py-2 text-sm text-right">{Number(p.price).toFixed(2)}</td>
      <td className="px-3 py-2 text-sm text-center">{p.available_quantity}</td>
      <td className="px-3 py-2 text-sm">{p.status}</td>
      <td className="px-3 py-2 text-xs text-gray-500">{p.last_sync ? new Date(p.last_sync).toLocaleString() : '-'}</td>
      <td className="px-3 py-2 text-sm">
        {isAdmin && (
          <div className="flex gap-2">
            {p.status !== 'paused' && <button className="btn btn-secondary" onClick={() => onPause(p.meli_id)}>Pausar</button>}
            {p.status !== 'active' && <button className="btn btn-secondary" onClick={() => onActivate(p.meli_id)}>Activar</button>}
          </div>
        )}
      </td>
    </tr>
  )
}

export default function Publications() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [list, setList] = useState([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState({ open: false, title: '', description: '', type: 'success' })

  const query = useMemo(() => ({ page, pageSize, search, status }), [page, pageSize, search, status])

  async function fetchList() {
    setLoading(true)
    try {
      const { data } = await api.get('/publications', { params: query })
      setList(data.items || [])
      setTotalPages(data.totalPages || 1)
    } catch (err) {
      setToast({ open: true, title: 'Error', description: err?.response?.data?.error || 'No se pudo listar', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  async function syncNow() {
    setLoading(true)
    try {
      const { data } = await api.post('/publications/sync', { max: 500 })
      setToast({ open: true, title: 'Sync completado', description: `Se sincronizaron ${data.synced} publicaciones.`, type: 'success' })
      fetchList()
    } catch (err) {
      setToast({ open: true, title: 'Error al sincronizar', description: err?.response?.data?.error || 'Fallo el sync', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  async function pause(id) {
    try {
      await api.post(`/publications/${id}/pause`)
      setToast({ open: true, title: 'Pausada', description: id, type: 'success' })
      fetchList()
    } catch (err) {
      setToast({ open: true, title: 'Error', description: err?.response?.data?.error || 'No se pudo pausar', type: 'error' })
    }
  }

  async function activate(id) {
    try {
      await api.post(`/publications/${id}/activate`)
      setToast({ open: true, title: 'Activada', description: id, type: 'success' })
      fetchList()
    } catch (err) {
      setToast({ open: true, title: 'Error', description: err?.response?.data?.error || 'No se pudo activar', type: 'error' })
    }
  }

  useEffect(() => { fetchList() }, [page, pageSize]) // eslint-disable-line

  return (
    <>
      <Toast open={toast.open} title={toast.title} description={toast.description} type={toast.type} onClose={() => setToast(t => ({ ...t, open: false }))} />

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="label">Buscar</label>
          <input className="input mt-1" value={search} onChange={e => setSearch(e.target.value)} placeholder="Título o ID" />
        </div>
        <div>
          <label className="label">Estado</label>
          <select className="input mt-1" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">Todos</option>
            <option value="active">Activas</option>
            <option value="paused">Pausadas</option>
            <option value="closed">Cerradas</option>
          </select>
        </div>
        <div>
          <label className="label">Página</label>
          <input className="input mt-1 w-24" type="number" min={1} value={page} onChange={e => setPage(Number(e.target.value) || 1)} />
        </div>
        <div>
          <label className="label">Por página</label>
          <select className="input mt-1" value={pageSize} onChange={e => setPageSize(Number(e.target.value))}>
            {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <button className="btn btn-secondary" onClick={() => { setPage(1); fetchList() }}>Aplicar filtros</button>
        {isAdmin && (
          <button className="btn btn-primary" onClick={syncNow} disabled={loading}>
            {loading ? 'Sincronizando…' : 'Sincronizar desde Mercado Libre'}
          </button>
        )}
      </div>

      <div className="overflow-auto rounded-2xl border bg-white">
        <table className="min-w-full">
          <thead className="bg-gray-50 text-left text-sm">
            <tr>
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Título</th>
              <th className="px-3 py-2 text-right">Precio</th>
              <th className="px-3 py-2 text-center">Stock</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2">Últ. sync</th>
              <th className="px-3 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {list.map(p => (
              <Row key={p.id} p={p} isAdmin={isAdmin} onPause={pause} onActivate={activate} />
            ))}
            {!list.length && (
              <tr>
                <td className="px-3 py-6 text-center text-sm text-gray-500" colSpan={7}>
                  {loading ? 'Cargando…' : 'Sin resultados'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">Página {page} de {totalPages}</div>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>Anterior</button>
          <button className="btn btn-secondary" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>Siguiente</button>
        </div>
      </div>
    </>
  )
}
