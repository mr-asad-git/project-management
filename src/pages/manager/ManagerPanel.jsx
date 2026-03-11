import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import UserAvatar from '../../components/ui/UserAvatar'

/* ── helpers ────────────────────────────────────────────────────── */
const ROLE_COLORS = { admin: '#5030E5', manager: '#3b82f6', client: '#64748b' }

const Avatar = ({ src, name, size = 8 }) => (
    <UserAvatar user={{ name, image: src }} className={`w-${size} h-${size} rounded-xl bg-slate-100 flex-shrink-0 text-xs border border-white`} />
)

const sectionCls = "bg-white rounded-2xl border border-slate-100 shadow-[0_4px_24px_rgb(0,0,0,0.04)] overflow-hidden"
const headerCls = "px-6 py-5 border-b border-slate-50 flex items-center justify-between"

/* ── Group Card ──────────────────────────────────────────────────── */
const GroupCard = ({ group, allUsers, projects, onRename, onDelete, onToggleMember, onToggleProject, isManager }) => {
    const [editingName, setEditingName] = useState(false)
    const [nameDraft, setNameDraft] = useState(group.name)
    const [showMembers, setShowMembers] = useState(false)
    const [showProjects, setShowProjects] = useState(false)

    const members = allUsers.filter(u => group.memberIds.includes(u.id))
    const assignedProjects = projects.filter(p => group.projectIds.includes(p.id))
    const unassigned = allUsers.filter(u => u.role !== 'admin' && !group.memberIds.includes(u.id))
    const unassignedProjects = projects.filter(p => !group.projectIds.includes(p.id))

    const commitName = () => {
        setEditingName(false)
        if (nameDraft.trim() && nameDraft !== group.name) onRename(group.id, nameDraft.trim())
        else setNameDraft(group.name)
    }

    const STATUS_COLOR = { completed: '#7AC555', inProgress: '#FFA500', onHold: '#D87272', todo: '#5030E5' }

    return (
        <div className={sectionCls}>
            <div className={headerCls}>
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-[#5030E5]/10 flex items-center justify-center flex-shrink-0">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5030E5" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                    </div>
                    {editingName ? (
                        <input
                            autoFocus
                            value={nameDraft}
                            onChange={e => setNameDraft(e.target.value)}
                            onBlur={commitName}
                            onKeyDown={e => { if (e.key === 'Enter') commitName(); if (e.key === 'Escape') { setEditingName(false); setNameDraft(group.name) } }}
                            className="font-bold text-[#0D062D] text-base border-b-2 border-[#5030E5] outline-none bg-transparent flex-1"
                        />
                    ) : (
                        <h3
                            className="font-bold text-[#0D062D] text-base cursor-pointer hover:text-[#5030E5] transition-colors truncate"
                            onClick={() => setEditingName(true)}
                            title="Click to rename"
                        >
                            {group.name}
                        </h3>
                    )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-slate-400 font-medium">{members.length} member{members.length !== 1 ? 's' : ''}</span>
                    {!isManager && (
                        <button
                            onClick={() => onDelete(group.id)}
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                            title="Delete group"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                        </button>
                    )}
                </div>
            </div>

            <div className="p-6 flex flex-col gap-5">
                {/* Members section */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Members</span>
                        <button
                            onClick={() => setShowMembers(v => !v)}
                            className="text-xs font-bold text-[#5030E5] hover:underline"
                        >
                            {showMembers ? 'Done' : '+ Add'}
                        </button>
                    </div>

                    {members.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {members.map(m => (
                                <div key={m.id} className="flex items-center gap-1.5 bg-slate-50 rounded-xl px-3 py-1.5 group">
                                    <Avatar src={m.image} name={m.name} size={5} />
                                    <span className="text-xs font-semibold text-slate-700">{m.name}</span>
                                    <button
                                        onClick={() => onToggleMember(group.id, m.id)}
                                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all ml-0.5"
                                    >
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-slate-400 italic">No members yet. Click + Add to assign.</p>
                    )}

                    {/* Add member dropdown */}
                    {showMembers && unassigned.length > 0 && (
                        <div className="mt-3 border border-slate-100 rounded-xl overflow-hidden">
                            {unassigned.map(u => (
                                <button
                                    key={u.id}
                                    onClick={() => onToggleMember(group.id, u.id)}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-left transition-colors border-b border-slate-50 last:border-0"
                                >
                                    <Avatar src={u.image} name={u.name} size={6} />
                                    <div>
                                        <div className="text-sm font-semibold text-slate-700">{u.name}</div>
                                        <div className="text-xs text-slate-400">{u.email}</div>
                                    </div>
                                    <span
                                        className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
                                        style={{ background: `${ROLE_COLORS[u.role]}18`, color: ROLE_COLORS[u.role] }}
                                    >
                                        {u.role}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                    {showMembers && unassigned.length === 0 && (
                        <p className="mt-3 text-xs text-slate-400 italic text-center py-2">All users are in this group.</p>
                    )}
                </div>

                {/* Projects assigned */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assigned Projects</span>
                        <button
                            onClick={() => setShowProjects(v => !v)}
                            className="text-xs font-bold text-[#5030E5] hover:underline"
                        >
                            {showProjects ? 'Done' : '+ Assign'}
                        </button>
                    </div>

                    {assignedProjects.length > 0 ? (
                        <div className="flex flex-col gap-1.5">
                            {assignedProjects.map(p => (
                                <div key={p.id} className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 group">
                                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: STATUS_COLOR[p.status] ?? '#5030E5' }} />
                                    <span className="text-xs font-semibold text-slate-700 flex-1 truncate">{p.name}</span>
                                    <button
                                        onClick={() => onToggleProject(group.id, p.id)}
                                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all"
                                    >
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-slate-400 italic">No projects assigned. Click + Assign.</p>
                    )}

                    {showProjects && unassignedProjects.length > 0 && (
                        <div className="mt-3 border border-slate-100 rounded-xl overflow-hidden">
                            {unassignedProjects.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => onToggleProject(group.id, p.id)}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-left transition-colors border-b border-slate-50 last:border-0"
                                >
                                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: STATUS_COLOR[p.status] ?? '#5030E5' }} />
                                    <span className="text-sm font-semibold text-slate-700">{p.name}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="text-[10px] text-slate-300 font-medium">Created {group.createdAt}</div>
            </div>
        </div>
    )
}

/* ── Progress Section ────────────────────────────────────────────── */
const ProgressSection = ({ groups, projects, projectTasks }) => {
    const groupsWithProjects = groups.filter(g => g.projectIds.length > 0)

    if (groupsWithProjects.length === 0) {
        return (
            <div className={sectionCls}>
                <div className={headerCls}>
                    <h2 className="font-black text-[#0D062D] text-base">Progress Overview</h2>
                </div>
                <div className="p-12 text-center text-slate-400 text-sm font-medium">
                    <svg className="mx-auto mb-3 text-slate-200" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
                    Assign projects to groups to see progress.
                </div>
            </div>
        )
    }

    return (
        <div className={sectionCls}>
            <div className={headerCls}>
                <h2 className="font-black text-[#0D062D] text-base">Progress Overview</h2>
                <span className="text-xs text-slate-400 font-medium">{groupsWithProjects.length} group{groupsWithProjects.length !== 1 ? 's' : ''} with projects</span>
            </div>
            <div className="divide-y divide-slate-50">
                {groupsWithProjects.map(group => (
                    <div key={group.id} className="px-6 py-5">
                        <div className="font-bold text-sm text-[#0D062D] mb-4">{group.name}</div>
                        <div className="flex flex-col gap-4">
                            {group.projectIds.map(pid => {
                                const project = projects.find(p => p.id === pid)
                                const tasks = projectTasks[pid] ?? []
                                const total = tasks.length
                                const done = tasks.filter(t => t.status === 'completed').length
                                const pct = total === 0 ? 0 : Math.round((done / total) * 100)
                                const inProgress = tasks.filter(t => t.status === 'inProgress').length

                                return project ? (
                                    <div key={pid}>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-sm font-semibold text-slate-600 truncate flex-1">{project.name}</span>
                                            <span className="text-xs font-bold text-slate-400 ml-3 flex-shrink-0">{done}/{total} tasks · {pct}%</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-700"
                                                style={{
                                                    width: `${pct}%`,
                                                    background: pct === 100 ? '#7AC555' : pct > 50 ? '#5030E5' : pct > 0 ? '#FFA500' : '#e2e8f0'
                                                }}
                                            />
                                        </div>
                                        <div className="flex gap-4 mt-1.5">
                                            <span className="text-[10px] text-slate-400 font-medium">{done} done</span>
                                            <span className="text-[10px] text-[#FFA500] font-medium">{inProgress} in progress</span>
                                            <span className="text-[10px] text-slate-400 font-medium">{total - done - inProgress} todo</span>
                                        </div>
                                    </div>
                                ) : null
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/* ── Main Manager Panel ──────────────────────────────────────────── */
const ManagerPanel = ({ projects, projectTasks, groups, onAddGroup, onRenameGroup, onDeleteGroup, onGroupMemberToggle, onGroupProjectToggle }) => {
    const { users, currentUser } = useAuth()
    const isManager = currentUser?.role === 'manager' // managers can't delete groups
    const [newGroupName, setNewGroupName] = useState('')
    const [creatingGroup, setCreatingGroup] = useState(false)

    const nonAdminUsers = users.filter(u => u.role !== 'admin')

    const handleCreateGroup = () => {
        if (!newGroupName.trim()) return
        onAddGroup({ name: newGroupName.trim() })
        setNewGroupName('')
        setCreatingGroup(false)
    }

    return (
        <div className="px-6 md:px-10 py-8 flex flex-col gap-8 bg-[#FCFCFD] min-h-screen">

            {/* Header */}
            <div className="flex items-center justify-between gap-6 flex-wrap">
                <div>
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider">
                        {isManager ? 'Manager' : 'Admin'} View
                    </span>
                    <h1 className="text-3xl font-black text-[#0D062D] tracking-tight mt-2">Manager Panel</h1>
                    <p className="text-slate-500 font-medium mt-1">Create groups, assign projects, and track progress.</p>
                </div>
                <button
                    onClick={() => setCreatingGroup(true)}
                    className="flex items-center gap-2 px-5 py-3 bg-[#5030E5] text-white rounded-2xl font-bold text-sm hover:bg-[#3d22c4] transition-all shadow-lg shadow-indigo-200 cursor-pointer"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    New Group
                </button>
            </div>

            {/* Create Group prompt */}
            {creatingGroup && (
                <div className="bg-white rounded-2xl border border-[#5030E5]/30 shadow-lg p-5 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#5030E5]/10 flex items-center justify-center flex-shrink-0">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5030E5" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                    </div>
                    <input
                        autoFocus
                        type="text"
                        placeholder="Group name…"
                        value={newGroupName}
                        onChange={e => setNewGroupName(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleCreateGroup(); if (e.key === 'Escape') setCreatingGroup(false) }}
                        className="flex-1 text-sm font-semibold text-[#0D062D] outline-none bg-transparent placeholder:text-slate-300"
                    />
                    <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => setCreatingGroup(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-500 text-sm font-bold hover:bg-slate-50 transition-colors">Cancel</button>
                        <button onClick={handleCreateGroup} disabled={!newGroupName.trim()} className="px-4 py-2 rounded-xl bg-[#5030E5] text-white text-sm font-bold hover:bg-[#3d22c4] disabled:opacity-40 transition-colors">Create</button>
                    </div>
                </div>
            )}

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Groups', value: groups.length, color: '#5030E5' },
                    { label: 'Members Available', value: nonAdminUsers.length, color: '#3b82f6' },
                    { label: 'Projects', value: projects.length, color: '#10b981' },
                ].map(s => (
                    <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_24px_rgb(0,0,0,0.04)] p-5 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${s.color}18` }}>
                            <div className="w-3 h-3 rounded-full" style={{ background: s.color }} />
                        </div>
                        <div>
                            <div className="text-2xl font-black text-[#0D062D]">{s.value}</div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Groups (left 2/3) */}
                <div className="xl:col-span-2 flex flex-col gap-5">
                    <h2 className="font-black text-[#0D062D] text-lg">
                        Member Groups
                        <span className="ml-2 text-sm font-bold text-slate-400">{groups.length}</span>
                    </h2>

                    {groups.length === 0 ? (
                        <div className={sectionCls + " p-12 text-center"}>
                            <svg className="mx-auto mb-3 text-slate-200" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                            <p className="text-sm text-slate-400 font-medium">No groups yet. Click "New Group" to create one.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {groups.map(g => (
                                <GroupCard
                                    key={g.id}
                                    group={g}
                                    allUsers={nonAdminUsers}
                                    projects={projects}
                                    onRename={onRenameGroup}
                                    onDelete={onDeleteGroup}
                                    onToggleMember={onGroupMemberToggle}
                                    onToggleProject={onGroupProjectToggle}
                                    isManager={isManager}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Progress (right 1/3) */}
                <div className="flex flex-col gap-5">
                    <h2 className="font-black text-[#0D062D] text-lg">Progress</h2>
                    <ProgressSection groups={groups} projects={projects} projectTasks={projectTasks} />

                    {/* Quick members list */}
                    <div className={sectionCls}>
                        <div className={headerCls}>
                            <h3 className="font-bold text-sm text-[#0D062D]">All Members</h3>
                            <span className="text-xs text-slate-400 font-medium">{nonAdminUsers.length} total</span>
                        </div>
                        <div className="divide-y divide-slate-50 max-h-[360px] overflow-y-auto">
                            {nonAdminUsers.length === 0 ? (
                                <p className="p-6 text-sm text-slate-400 text-center font-medium">No members yet.</p>
                            ) : nonAdminUsers.map(u => (
                                <div key={u.id} className="flex items-center gap-3 px-5 py-3">
                                    <Avatar src={u.image} name={u.name} size={8} />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-semibold text-slate-700 truncate">{u.name}</div>
                                        <div className="text-xs text-slate-400 truncate">{u.email}</div>
                                    </div>
                                    <span
                                        className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize flex-shrink-0"
                                        style={{ background: `${ROLE_COLORS[u.role]}18`, color: ROLE_COLORS[u.role] }}
                                    >
                                        {u.role}
                                    </span>
                                    {u.blocked && (
                                        <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full flex-shrink-0">Blocked</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ManagerPanel
