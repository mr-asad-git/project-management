import { useState, useRef, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import UserAvatar from '../../components/ui/UserAvatar'

/* ── tiny reusable helpers ──────────────────────────────────────── */

const ROLE_META = {
    admin: { label: 'Admin', bg: 'bg-violet-50 ring-1 ring-violet-200', text: 'text-violet-600', dot: 'bg-violet-400' },
    manager: { label: 'Manager', bg: 'bg-sky-50 ring-1 ring-sky-200', text: 'text-sky-600', dot: 'bg-sky-400' },
    client: { label: 'Client', bg: 'bg-teal-50 ring-1 ring-teal-200', text: 'text-teal-600', dot: 'bg-teal-400' },
}

const RoleBadge = ({ role }) => {
    const m = ROLE_META[role] ?? ROLE_META.client
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${m.bg} ${m.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
            {m.label}
        </span>
    )
}

const StatusBadge = ({ blocked }) =>
    blocked
        ? <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 ring-1 ring-rose-200"><span className="w-1.5 h-1.5 rounded-full bg-rose-400" />Blocked</span>
        : <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-600 ring-1 ring-green-200"><span className="w-1.5 h-1.5 rounded-full bg-green-400" />Active</span>

/* ── Click-based Role Dropdown ────────────────────────────────────── */
const RoleSelect = ({ role, onPromote }) => {
    const [open, setOpen] = useState(false)
    const ref = useRef(null)

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const m = ROLE_META[role] ?? ROLE_META.client

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(o => !o)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold cursor-pointer transition-all ${m.bg} ${m.text} hover:opacity-80`}
            >
                <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
                {m.label}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"
                    className={`ml-0.5 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}>
                    <path d="M6 9l6 6 6-6" />
                </svg>
            </button>
            {open && (
                <div className="absolute left-0 top-full mt-1.5 bg-white rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden z-50 w-[140px]">
                    {['client', 'manager'].map(r => {
                        const rm = ROLE_META[r]
                        return (
                            <button
                                key={r}
                                onClick={() => { onPromote(r); setOpen(false) }}
                                className={`w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold capitalize transition-colors ${role === r ? 'bg-[#5030E5]/8 text-[#5030E5]' : 'text-slate-600 hover:bg-slate-50'}`}
                            >
                                <span className={`w-2 h-2 rounded-full ${rm.dot}`} />
                                {rm.label}
                                {role === r && (
                                    <svg className="ml-auto" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                )}
                            </button>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

/* ── Inline editable cell ─────────────────────────────────────── */
const InlineEdit = ({ value, onSave, type = 'text', disabled = false }) => {
    const [editing, setEditing] = useState(false)
    const [draft, setDraft] = useState(value)
    const inputRef = useRef(null)

    useEffect(() => { if (editing) inputRef.current?.focus() }, [editing])
    useEffect(() => { setDraft(value) }, [value])

    if (disabled) return <span className="text-sm text-slate-400 select-none">{value || '—'}</span>

    const commit = () => {
        setEditing(false)
        if (draft !== value) onSave(draft)
    }

    return editing ? (
        <input
            ref={inputRef}
            value={draft}
            type={type}
            onChange={e => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setEditing(false); setDraft(value) } }}
            className="text-sm border border-[#5030E5]/50 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-[#5030E5]/20 w-full bg-white"
        />
    ) : (
        <span
            onClick={() => setEditing(true)}
            title="Click to edit"
            className="text-sm text-slate-700 cursor-pointer hover:text-[#5030E5] transition-colors group flex items-center gap-1"
        >
            {value || <span className="text-slate-400 italic">—</span>}
            <svg className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
        </span>
    )
}

/* ── Add-User Modal ───────────────────────────────────────────── */
const AddUserModal = ({ onClose, onAdd }) => {
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'client', location: '', customId: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleChange = e => {
        const { name, value } = e.target
        setForm(p => ({ ...p, [name]: value }))
        if (error) setError('')
    }

    const handleSubmit = async e => {
        e.preventDefault()
        if (!form.name.trim() || !form.email || !form.password) { setError('Name, email and password are required.'); return }
        setLoading(true)
        await new Promise(r => setTimeout(r, 300))
        const result = onAdd(form)
        setLoading(false)
        if (result.success) {
            toast.success(`User "${form.name}" created successfully!`)
            onClose()
        } else {
            setError(result.message)
        }
    }

    const inputCls = "w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#5030E5] focus:ring-2 focus:ring-[#5030E5]/20 transition-all bg-slate-50 text-slate-700"

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-[480px] p-8 flex flex-col gap-6" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-[#0D062D]">Add User</h2>
                        <p className="text-sm text-slate-400 font-medium mt-0.5">Create a new account directly</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name *</label>
                            <input name="name" type="text" placeholder="Jane Doe" value={form.name} onChange={handleChange} className={inputCls} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Location</label>
                            <input name="location" type="text" placeholder="City, Country" value={form.location} onChange={handleChange} className={inputCls} />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Work Email *</label>
                        <input name="email" type="email" placeholder="jane@company.com" value={form.email} onChange={handleChange} className={inputCls} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password *</label>
                        <input name="password" type="password" placeholder="Min. 8 characters" value={form.password} onChange={handleChange} className={inputCls} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Role</label>
                            <select name="role" value={form.role} onChange={handleChange} className={inputCls + ' cursor-pointer'}>
                                <option value="client">Client</option>
                                <option value="manager">Manager</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Custom ID <span className="normal-case text-slate-300">(optional)</span></label>
                            <input
                                name="customId"
                                type="text"
                                placeholder={form.role === 'manager' ? 'e.g. MGR-001' : 'e.g. CLT-001'}
                                value={form.customId}
                                onChange={handleChange}
                                className={inputCls}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 font-medium">{error}</div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-500 font-bold hover:bg-slate-50 transition-colors text-sm">Cancel</button>
                        <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl bg-[#5030E5] text-white font-bold hover:bg-[#3d22c4] disabled:opacity-60 transition-colors text-sm">
                            {loading ? 'Creating…' : 'Create User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

/* ── Delete Confirm ───────────────────────────────────────────── */
const DeleteConfirm = ({ user, onConfirm, onClose }) => (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-2xl w-[400px] p-8 flex flex-col gap-5 items-center text-center" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
            </div>
            <div>
                <h2 className="text-xl font-black text-[#0D062D]">Delete User?</h2>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">This will permanently delete <span className="font-bold text-slate-700">{user.name}</span>'s account. This cannot be undone.</p>
            </div>
            <div className="flex gap-3 w-full">
                <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-500 font-bold hover:bg-slate-50 transition-colors text-sm">Cancel</button>
                <button onClick={onConfirm} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors text-sm">Delete</button>
            </div>
        </div>
    </div>
)

/* ── Stat Card ────────────────────────────────────────────────── */
const StatCard = ({ label, value, accent, icon }) => (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_24px_rgb(0,0,0,0.04)] p-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${accent}18` }}>
            <span style={{ color: accent }}>{icon}</span>
        </div>
        <div>
            <div className="text-2xl font-black text-[#0D062D]">{value}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">{label}</div>
        </div>
    </div>
)

/* ── Main Admin Panel ─────────────────────────────────────────── */
const AdminPanel = () => {
    const { users, currentUser, addUser, removeUser, blockUser, promoteUser, editUserField } = useAuth()

    const [showAdd, setShowAdd] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [search, setSearch] = useState('')
    const [roleFilter, setRoleFilter] = useState('all')

    // Exclude admin from the table — admin manages others, not itself
    const nonAdminUsers = users.filter(u => u.role !== 'admin')

    const filtered = nonAdminUsers.filter(u => {
        const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase()) ||
            (u.customId || '').toLowerCase().includes(search.toLowerCase())
        const matchRole = roleFilter === 'all' || u.role === roleFilter
        return matchSearch && matchRole
    }).sort((a, b) => {
        if (a.role === 'manager' && b.role !== 'manager') return -1;
        if (a.role !== 'manager' && b.role === 'manager') return 1;
        return 0;
    })

    const stats = {
        total: nonAdminUsers.length,
        managers: users.filter(u => u.role === 'manager').length,
        clients: users.filter(u => u.role === 'client').length,
        blocked: users.filter(u => u.blocked).length,
    }

    const handleBlock = (user) => {
        const willBlock = !user.blocked
        blockUser(user.id, willBlock)
        if (willBlock) {
            toast.error(`${user.name} has been blocked.`, { icon: '🚫' })
        } else {
            toast.success(`${user.name}'s access has been restored.`, { icon: '✅' })
        }
    }

    const handleDelete = () => {
        toast.success(`User "${deleteTarget.name}" has been permanently deleted.`, { icon: '🗑️' })
        removeUser(deleteTarget.id)
        setDeleteTarget(null)
    }

    return (
        <div className="px-6 md:px-10 py-8 flex flex-col gap-8 bg-[#FCFCFD] min-h-screen">

            {/* Header */}
            <div className="flex items-center justify-between gap-6 flex-wrap">
                <div>
                    <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-bold uppercase tracking-wider">Admin Only</span>
                    <h1 className="text-3xl font-black text-[#0D062D] tracking-tight mt-2">Admin Panel</h1>
                    <p className="text-slate-500 font-medium mt-1">Manage users, roles, and access permissions.</p>
                </div>
                <button
                    onClick={() => setShowAdd(true)}
                    className="flex items-center gap-2 px-5 py-3 bg-[#5030E5] text-white rounded-2xl font-bold text-sm hover:bg-[#3d22c4] transition-all shadow-lg shadow-indigo-200 cursor-pointer"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    Add User
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Total Users" value={stats.total} accent="#5030E5" icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>} />
                <StatCard label="Managers" value={stats.managers} accent="#3b82f6" icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></svg>} />
                <StatCard label="Clients" value={stats.clients} accent="#10b981" icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>} />
                <StatCard label="Blocked" value={stats.blocked} accent="#ef4444" icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>} />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[220px]">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                    <input
                        type="text"
                        placeholder="Search by name, email or ID…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#5030E5] focus:ring-2 focus:ring-[#5030E5]/20 transition-all bg-white text-slate-700"
                    />
                </div>
                <div className="flex gap-2">
                    {['all', 'manager', 'client'].map(r => (
                        <button
                            key={r}
                            onClick={() => setRoleFilter(r)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all border ${roleFilter === r
                                ? 'bg-[#5030E5] text-white border-[#5030E5] shadow-sm'
                                : 'bg-white text-slate-500 border-slate-200 hover:border-[#5030E5]/40'
                                }`}
                        >
                            {r === 'all' ? 'All' : r}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_24px_rgb(0,0,0,0.04)] overflow-hidden">
                <div className="overflow-x-auto overflow-y-auto min-h-[520px]">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/20">
                                <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">User</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">ID</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Email</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Location</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Password</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Role</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="text-right px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-16 text-slate-400 font-medium">
                                        <svg className="mx-auto mb-3 text-slate-200" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                        No users found
                                    </td>
                                </tr>
                            ) : filtered.map(u => (
                                <UserRow
                                    key={u.id}
                                    user={u}
                                    isSelf={u.id === currentUser?.id}
                                    onEdit={(field, val) => editUserField(u.id, field, val)}
                                    onBlock={() => handleBlock(u)}
                                    onPromote={newRole => promoteUser(u.id, newRole)}
                                    onDelete={() => setDeleteTarget(u)}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-3 border-t border-slate-50 bg-slate-50/40 text-xs text-slate-400 font-medium">
                    Showing {filtered.length} of {nonAdminUsers.length} users · Click any cell to edit inline
                </div>
            </div>

            {/* Modals */}
            {showAdd && <AddUserModal onClose={() => setShowAdd(false)} onAdd={addUser} />}
            {deleteTarget && (
                <DeleteConfirm
                    user={deleteTarget}
                    onClose={() => setDeleteTarget(null)}
                    onConfirm={handleDelete}
                />
            )}
        </div>
    )
}

/* ── User Row ─────────────────────────────────────────────────── */
const UserRow = ({ user, isSelf, onEdit, onBlock, onPromote, onDelete }) => {
    return (
        <tr className={`group transition-colors hover:bg-slate-500/40 ${user.blocked ? 'opacity-60' : ''}`}>
            {/* Avatar + Name */}
            <td className="px-6 py-4">
                <div className="flex items-center gap-3 min-w-[160px]">
                    <div className="relative flex-shrink-0">
                        <UserAvatar user={user} className="w-9 h-9 rounded-xl border border-slate-100" />
                        {isSelf && <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#5030E5] rounded-full border-2 border-white" title="You" />}
                    </div>
                    <div className="min-w-0 flex-1">
                        <InlineEdit value={user.name} onSave={v => onEdit('name', v)} />
                        {isSelf && <span className="text-[10px] text-[#5030E5] font-bold">You</span>}
                    </div>
                </div>
            </td>

            {/* Custom ID */}
            <td className="px-6 py-4 min-w-[120px]">
                <InlineEdit
                    value={user.customId || ''}
                    onSave={v => onEdit('customId', v)}
                />
            </td>

            {/* Email */}
            <td className="px-6 py-4 min-w-[200px]">
                <InlineEdit value={user.email} onSave={v => onEdit('email', v)} type="email" />
            </td>

            {/* Location */}
            <td className="px-6 py-4 min-w-[140px]">
                <InlineEdit value={user.location} onSave={v => onEdit('location', v)} />
            </td>

            {/* Password */}
            <td className="px-6 py-4 min-w-[140px]">
                <InlineEdit value={user.password} onSave={v => onEdit('password', v)} type="password" />
            </td>

            {/* Role — click dropdown */}
            <td className="px-6 py-4">
                <RoleSelect role={user.role} onPromote={onPromote} />
            </td>

            {/* Status */}
            <td className="px-6 py-4">
                <StatusBadge blocked={user.blocked} />
            </td>

            {/* Actions */}
            <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Block / Unblock */}
                    <button
                        onClick={onBlock}
                        title={user.blocked ? 'Grant Access' : 'Block Access'}
                        className={`p-2 rounded-lg transition-all ${user.blocked ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}`}
                    >
                        {user.blocked ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" /><path d="M9 12l2 2 4-4" /></svg>
                        ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>
                        )}
                    </button>

                    {/* Delete */}
                    <button
                        onClick={onDelete}
                        title="Delete User"
                        className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                    </button>
                </div>
            </td>
        </tr>
    )
}

export default AdminPanel
