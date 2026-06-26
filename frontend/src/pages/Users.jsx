import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { api } from '../services/api'

const ROLES = ['Administrator', 'Campaign Planner', 'BA / Solution Designer', 'DevOps', 'Developer']
const STATUSES = ['Active', 'Locked', 'Disabled']

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
}

function StatusPill({ status }) {
  const cls = status === 'Active' ? 'user-status-active' : status === 'Locked' ? 'user-status-locked' : 'user-status-disabled'
  return <span className={`user-status-pill ${cls}`}>{status}</span>
}

function RoleBadge({ role }) {
  return <span className="user-role-badge">{role}</span>
}

const EMPTY_FORM = { firstName: '', lastName: '', username: '', email: '', role: '', status: 'Active' }

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const [modal, setModal] = useState(null) // null | { mode: 'add' | 'edit', user? }
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const [confirm, setConfirm] = useState(null) // { action, user }
  const [actionBusy, setActionBusy] = useState(null)

  useEffect(() => {
    api.getUsers()
      .then(d => setUsers(d.users))
      .finally(() => setLoading(false))
  }, [])

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    const matchSearch = !q || `${u.firstName} ${u.lastName} ${u.email} ${u.username}`.toLowerCase().includes(q)
    const matchRole = !filterRole || u.role === filterRole
    const matchStatus = !filterStatus || u.status === filterStatus
    return matchSearch && matchRole && matchStatus
  })

  function openAdd() {
    setForm(EMPTY_FORM)
    setFormError('')
    setModal({ mode: 'add' })
  }

  function openEdit(user) {
    setForm({ firstName: user.firstName, lastName: user.lastName, username: user.username, email: user.email, role: user.role, status: user.status })
    setFormError('')
    setModal({ mode: 'edit', user })
  }

  async function handleSave() {
    if (!form.firstName || !form.lastName || !form.username || !form.email || !form.role) {
      setFormError('All fields are required.')
      return
    }
    setSaving(true)
    setFormError('')
    if (modal.mode === 'add') {
      const res = await api.createUser(form)
      if (res.ok) {
        const updated = await api.getUsers()
        setUsers(updated.users)
      }
    } else {
      await api.updateUser(modal.user.userId, { firstName: form.firstName, lastName: form.lastName, email: form.email, role: form.role, status: form.status })
      setUsers(prev => prev.map(u => u.userId === modal.user.userId ? { ...u, firstName: form.firstName, lastName: form.lastName, email: form.email, role: form.role, status: form.status } : u))
    }
    setSaving(false)
    setModal(null)
  }

  async function handleConfirmAction() {
    if (!confirm) return
    setActionBusy(confirm.user.userId + confirm.action)
    if (confirm.action === 'disable') {
      await api.disableUser(confirm.user.userId)
      setUsers(prev => prev.map(u => u.userId === confirm.user.userId ? { ...u, status: 'Disabled' } : u))
    } else if (confirm.action === 'enable') {
      await api.enableUser(confirm.user.userId)
      setUsers(prev => prev.map(u => u.userId === confirm.user.userId ? { ...u, status: 'Active', failedLoginCount: 0 } : u))
    } else if (confirm.action === 'reset') {
      await api.resetPassword(confirm.user.userId)
      setUsers(prev => prev.map(u => u.userId === confirm.user.userId ? { ...u, forcePasswordChange: true } : u))
    }
    setActionBusy(null)
    setConfirm(null)
  }

  const totalActive   = users.filter(u => u.status === 'Active').length
  const totalLocked   = users.filter(u => u.status === 'Locked').length
  const totalDisabled = users.filter(u => u.status === 'Disabled').length

  return (
    <Layout>
      <div className="page-shell">
        <section className="hero">
          <div className="hero-header">
            <h1>User Management</h1>
            <button className="primary-btn" onClick={openAdd}>+ Add User</button>
          </div>
        </section>

        {/* Summary cards */}
        <div className="um-summary-row">
          <div className="um-summary-card">
            <div className="um-summary-num">{users.length}</div>
            <div className="um-summary-label">Total Users</div>
          </div>
          <div className="um-summary-card">
            <div className="um-summary-num um-summary-active">{totalActive}</div>
            <div className="um-summary-label">Active</div>
          </div>
          <div className="um-summary-card">
            <div className="um-summary-num um-summary-locked">{totalLocked}</div>
            <div className="um-summary-label">Locked</div>
          </div>
          <div className="um-summary-card">
            <div className="um-summary-num um-summary-disabled">{totalDisabled}</div>
            <div className="um-summary-label">Disabled</div>
          </div>
        </div>

        <div className="panel">
          {/* Toolbar */}
          <div className="um-toolbar">
            <input
              type="text"
              className="um-search"
              placeholder="Search name, email, username…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select className="um-filter-select" value={filterRole} onChange={e => setFilterRole(e.target.value)}>
              <option value="">All Roles</option>
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
            <select className="um-filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">All Statuses</option>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          {loading && <div className="fetch-state">Loading users…</div>}

          {!loading && (
            <div className="table-card">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Last Login</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8', padding: '32px 0' }}>No users found.</td></tr>
                  ) : filtered.map(u => (
                    <tr key={u.userId}>
                      <td>
                        <div className="um-name">{u.firstName} {u.lastName}</div>
                        {u.forcePasswordChange && <div className="um-force-reset">Password reset required</div>}
                      </td>
                      <td className="um-username">{u.username}</td>
                      <td>{u.email}</td>
                      <td><RoleBadge role={u.role} /></td>
                      <td>
                        <StatusPill status={u.status} />
                        {u.status === 'Locked' && u.failedLoginCount > 0 && (
                          <div className="um-failed-count">{u.failedLoginCount} failed attempts</div>
                        )}
                      </td>
                      <td className="um-lastlogin">{formatDate(u.lastLogin)}</td>
                      <td>
                        <div className="um-actions">
                          <button className="um-action-btn" onClick={() => openEdit(u)} title="Edit">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            Edit
                          </button>
                          {u.status === 'Active' || u.status === 'Locked' ? (
                            <button className="um-action-btn um-action-disable" onClick={() => setConfirm({ action: 'disable', user: u })} title="Disable">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                              Disable
                            </button>
                          ) : (
                            <button className="um-action-btn um-action-enable" onClick={() => setConfirm({ action: 'enable', user: u })} title="Enable">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                              Enable
                            </button>
                          )}
                          <button className="um-action-btn um-action-reset" onClick={() => setConfirm({ action: 'reset', user: u })} title="Reset Password">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                            Reset PW
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modal && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: 520 }}>
            <h2>{modal.mode === 'add' ? 'Add New User' : 'Edit User'}</h2>
            {formError && <div className="error-msg" style={{ marginBottom: 16 }}>{formError}</div>}
            <div className="um-form-grid">
              <div className="field">
                <label>First Name<span className="required">*</span></label>
                <input type="text" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} placeholder="First name" />
              </div>
              <div className="field">
                <label>Last Name<span className="required">*</span></label>
                <input type="text" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} placeholder="Last name" />
              </div>
              <div className="field">
                <label>Username<span className="required">*</span></label>
                <input type="text" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} placeholder="e.g. jdelacruz" disabled={modal.mode === 'edit'} />
              </div>
              <div className="field">
                <label>Email<span className="required">*</span></label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="name@globe.com.ph" />
              </div>
              <div className="field">
                <label>Role<span className="required">*</span></label>
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                  <option value="">Select role</option>
                  {ROLES.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              {modal.mode === 'edit' && (
                <div className="field">
                  <label>Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              )}
            </div>
            {modal.mode === 'add' && (
              <p className="um-modal-note">A temporary password will be generated and the user will be required to change it on first login.</p>
            )}
            <div className="button-row" style={{ marginTop: 24 }}>
              <button type="button" className="back-button" onClick={() => setModal(null)}>Cancel</button>
              <button type="button" className="primary-btn" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : modal.mode === 'add' ? 'Create User' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm action modal */}
      {confirm && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: 420 }}>
            <h2>
              {confirm.action === 'disable' ? 'Disable User' :
               confirm.action === 'enable'  ? 'Enable User'  : 'Reset Password'}
            </h2>
            <p style={{ marginTop: 8 }}>
              {confirm.action === 'disable' && <>Are you sure you want to <strong>disable</strong> <strong>{confirm.user.firstName} {confirm.user.lastName}</strong>? They will no longer be able to log in.</>}
              {confirm.action === 'enable'  && <>Re-enable <strong>{confirm.user.firstName} {confirm.user.lastName}</strong>? Their account will be set to Active.</>}
              {confirm.action === 'reset'   && <>Send a password reset to <strong>{confirm.user.firstName} {confirm.user.lastName}</strong>? They will be required to change their password on next login.</>}
            </p>
            <div className="button-row" style={{ marginTop: 24 }}>
              <button type="button" className="back-button" onClick={() => setConfirm(null)}>Cancel</button>
              <button
                type="button"
                className={confirm.action === 'disable' ? 'um-btn-danger' : 'primary-btn'}
                onClick={handleConfirmAction}
                disabled={!!actionBusy}
              >
                {actionBusy ? 'Processing…' :
                  confirm.action === 'disable' ? 'Disable' :
                  confirm.action === 'enable'  ? 'Enable'  : 'Reset Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
