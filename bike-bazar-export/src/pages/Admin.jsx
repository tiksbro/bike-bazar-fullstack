import { useState, useEffect } from 'react'
import { getVehicleBySlug } from '../services/vehicleService'
import { useAuth } from '../context/AuthContext'
import Button from '../components/Button'
import Card from '../components/Card'
import Badge from '../components/Badge'
import StatCard from '../components/StatCard'
import EmptyState from '../components/EmptyState'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

const initialPending = [
  { slug: 'honda-cb-shine-2019', status: 'pending' },
  { slug: 'bajaj-pulsar-150-2018', status: 'pending' },
  { slug: 'ktm-rc-200-2019', status: 'pending' },
]

const reasonLabels = {
  fake: 'Fake listing',
  scam: 'Scam',
  incorrect: 'Incorrect information',
  duplicate: 'Duplicate listing',
  sold: 'Already sold',
  other: 'Other',
}

function Admin() {
  const { user } = useAuth()
  const [pending, setPending] = useState(initialPending)
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  const [reports, setReports] = useState([])
  const [reportsLoading, setReportsLoading] = useState(true)
  const [reportsError, setReportsError] = useState('')
  const [reportsForbidden, setReportsForbidden] = useState(false)
  const [adminStats, setAdminStats] = useState(null)

  useEffect(() => {
    async function loadVehicles() {
      setLoading(true)
      setError('')
      try {
        const results = await Promise.all(pending.map((p) => getVehicleBySlug(p.slug)))
        setVehicles(results.filter(Boolean))
      } catch {
        setError("Couldn't load listing moderation data. Check your connection and try again.")
      } finally {
        setLoading(false)
      }
    }
    loadVehicles()
  }, [pending, retryCount])

  useEffect(() => {
    async function loadReports() {
      if (!user) {
        setReportsLoading(false)
        return
      }
      setReportsLoading(true)
      setReportsError('')
      setReportsForbidden(false)
      try {
        const token = localStorage.getItem('bikebazar_token')
        const res = await fetch(`${API_URL}/reports`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.status === 403) {
          setReportsForbidden(true)
          return
        }
        if (!res.ok) throw new Error('Failed to load reports')
        const data = await res.json()
        setReports(data)
      } catch {
        setReportsError("Couldn't load reports. Check your connection and try again.")
      } finally {
        setReportsLoading(false)
      }
    }
    loadReports()
  }, [user])

  useEffect(() => {
    async function loadAdminStats() {
      if (!user) return
      try {
        const token = localStorage.getItem('bikebazar_token')
        const res = await fetch(`${API_URL}/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          setAdminStats(await res.json())
        }
      } catch {
        // Silent — the stat cards just keep showing "—" if this fails.
      }
    }
    loadAdminStats()
  }, [user])

  async function respondToReport(reportId, status) {
    const token = localStorage.getItem('bikebazar_token')
    const res = await fetch(`${API_URL}/reports/${reportId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      const updated = await res.json()
      setReports(reports.map((r) => (r.id === reportId ? updated : r)))
    }
  }

  function updateStatus(slug, newStatus) {
    setPending(pending.map((p) => (p.slug === slug ? { ...p, status: newStatus } : p)))
  }

  const pendingCount = pending.filter((p) => p.status === 'pending').length
  const pendingReportsCount = reports.filter((r) => r.status === 'pending').length

  if (loading) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-textmuted">Loading admin dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <p className="text-sm text-danger bg-dangerbg rounded-ctl px-3 py-2 inline-block">{error}</p>
        <div className="mt-4">
          <Button onClick={() => setRetryCount((c) => c + 1)}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-display font-bold text-[26px]">Admin Dashboard</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">
        <StatCard label="Users" value={adminStats ? adminStats.totalUsers.toLocaleString('en-IN') : '—'} />
        <StatCard label="Active Listings" value={adminStats ? adminStats.activeListings.toLocaleString('en-IN') : '—'} />
        <StatCard label="Dealers" value={adminStats ? adminStats.totalDealers.toLocaleString('en-IN') : '—'} />
        <StatCard label="Pending Approvals" value={pendingCount} attention={pendingCount > 0} />
        <StatCard label="Pending Reports" value={pendingReportsCount} attention={pendingReportsCount > 0} />
      </div>

      <div className="mt-10">
        <h2 className="font-display font-bold text-xl">Reported Listings</h2>
        {reportsForbidden ? (
          <Card padding="sm" className="mt-4">
            <p className="text-sm text-textmuted">
              Admin access required — this section is only visible to admin accounts.
            </p>
          </Card>
        ) : reportsLoading ? (
          <p className="text-textmuted text-sm mt-4">Loading reports...</p>
        ) : reportsError ? (
          <p className="text-sm text-danger bg-dangerbg rounded-ctl px-3 py-2 mt-4 inline-block">{reportsError}</p>
        ) : reports.length === 0 ? (
          <div className="mt-4">
            <EmptyState title="No reports" message="Reported listings will show up here for review." />
          </div>
        ) : (
          <div className="flex flex-col gap-3 mt-4">
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} onRespond={respondToReport} />
            ))}
          </div>
        )}
      </div>

      <div className="mt-10">
        <h2 className="font-display font-bold text-xl">Listing Moderation</h2>
        <div className="flex flex-col gap-3 mt-4">
          {pending.map((p) => {
            const vehicle = vehicles.find((v) => v.slug === p.slug)
            if (!vehicle) return null

            return (
              <Card
                key={p.slug}
                padding="sm"
                className="flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="flex-1">
                  <p className="font-display font-semibold">
                    {vehicle.brand} {vehicle.model}
                  </p>
                  <p className="text-sm text-textmuted">
                    Rs. {vehicle.price.toLocaleString('en-IN')} · {vehicle.location}
                  </p>
                </div>

                {p.status === 'pending' ? (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => updateStatus(p.slug, 'approved')}>
                      Approve
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => updateStatus(p.slug, 'rejected')}>
                      Reject
                    </Button>
                  </div>
                ) : (
                  <Badge variant={p.status === 'approved' ? 'success' : 'danger'} dot>
                    {p.status === 'approved' ? 'Approved' : 'Rejected'}
                  </Badge>
                )}
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}

const reportStatusVariant = {
  pending: 'warning',
  reviewed: 'success',
  dismissed: 'neutral',
}

function ReportCard({ report, onRespond }) {
  return (
    <Card padding="sm">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="font-display font-semibold">
            {report.vehicle.brand} {report.vehicle.model}
          </p>
          <p className="text-sm text-textmuted mt-0.5">
            Reported by {report.reporter.name} · {reasonLabels[report.reason]}
          </p>
        </div>
        <Badge variant={reportStatusVariant[report.status]} dot>
          {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
        </Badge>
      </div>

      {report.status === 'pending' && (
        <div className="flex gap-2 mt-3">
          <Button size="sm" onClick={() => onRespond(report.id, 'reviewed')}>
            Mark Reviewed
          </Button>
          <Button variant="secondary" size="sm" onClick={() => onRespond(report.id, 'dismissed')}>
            Dismiss
          </Button>
        </div>
      )}
    </Card>
  )
}

export default Admin