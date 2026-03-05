import React, { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

/* ── Constants ───────────────────────────────────────────────────── */
const STATUS_OPTIONS = [
    { value: 'todo', label: 'To Do', color: '#5030E5' },
    { value: 'inProgress', label: 'In Progress', color: '#FFA500' },
    { value: 'completed', label: 'Completed', color: '#7AC555' },
    { value: 'onHold', label: 'On Hold', color: '#D87272' },
]

const statusColor = (s) => ({ completed: '#7AC555', inProgress: '#FFA500', onHold: '#D87272' }[s] ?? '#5030E5')

/* ── Reusable Project Modal (Add / Edit) ─────────────────────────── */
const ProjectModal = ({ title, initialName = '', initialStatus = 'todo', onSubmit, onClose }) => {
    const [name, setName] = useState(initialName)
    const [status, setStatus] = useState(initialStatus)

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-[420px] p-8 flex flex-col gap-6" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center">
                    <h2 className="text-[20px] font-bold text-[#0D062D]">{title}</h2>
                    <button onClick={onClose} className="text-[#787486] hover:text-[#0D062D] text-[22px] leading-none transition-colors">×</button>
                </div>

                <form onSubmit={e => { e.preventDefault(); if (name.trim()) onSubmit({ name: name.trim(), status }) }} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-semibold text-[#787486] uppercase tracking-wide">Project Name</label>
                        <input
                            autoFocus
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. Marketing Campaign"
                            className="border border-[#DBDBDB] rounded-xl px-4 py-3 text-[15px] outline-none focus:border-[#5030E5] focus:ring-2 focus:ring-[#5030E5]/20 transition-all"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[13px] font-semibold text-[#787486] uppercase tracking-wide">Status</label>
                        <div className="flex gap-2 flex-wrap">
                            {STATUS_OPTIONS.map(opt => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setStatus(opt.value)}
                                    className={`px-4 py-1.5 rounded-full text-[13px] font-semibold border-2 transition-all duration-150 ${status === opt.value ? 'text-white border-transparent' : 'border-[#DBDBDB] text-[#787486] hover:border-gray-300'}`}
                                    style={status === opt.value ? { background: opt.color, borderColor: opt.color } : {}}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-[#DBDBDB] text-[#787486] font-semibold hover:bg-gray-50 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={!name.trim()} className="flex-1 py-3 rounded-xl bg-[#5030E5] text-white font-semibold hover:bg-[#3d22c4] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                            {title === 'New Project' ? 'Create Project' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

/* ── Delete Confirm Modal ────────────────────────────────────────── */
const DeleteModal = ({ projectName, onConfirm, onClose }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-2xl w-[400px] p-8 flex flex-col gap-5" onClick={e => e.stopPropagation()}>
            <div className="flex flex-col items-center gap-3 text-center">
                <div className="h-14 w-14 rounded-full bg-[#D8727D]/10 flex items-center justify-center">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D8727D" strokeWidth="2" strokeLinecap="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                </div>
                <h2 className="text-[20px] font-bold text-[#0D062D]">Delete Project?</h2>
                <p className="text-[14px] text-[#787486] leading-relaxed">
                    Are you sure you want to delete&nbsp;
                    <span className="font-semibold text-[#0D062D]">"{projectName}"</span>?<br />
                    This action cannot be undone.
                </p>
            </div>
            <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-[#DBDBDB] text-[#787486] font-semibold hover:bg-gray-50 transition-colors">
                    Cancel
                </button>
                <button onClick={onConfirm} className="flex-1 py-3 rounded-xl bg-[#D8727D] text-white font-semibold hover:bg-[#c45f6a] transition-colors">
                    Yes, Delete
                </button>
            </div>
        </div>
    </div>
)

/* ── Sidebar ─────────────────────────────────────────────────────── */
const Sidebar = ({ sidebar, toggleSidebar, selectedProjectID, setSelectedProjectID, projects, onAddProject, onEditProject, onDeleteProject }) => {
    const location = useLocation()
    const navigate = useNavigate()

    const [showAddModal, setShowAddModal] = useState(false)
    const [editProject, setEditProject] = useState(null)
    const [deleteProject, setDeleteProject] = useState(null)
    const [openMenuId, setOpenMenuId] = useState(null)
    const menuRef = useRef(null)

    useEffect(() => {
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenuId(null)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const navItems = [
        { icon: '/navIcons/category.svg', label: 'Home', path: '/' },
        { icon: '/navIcons/message.svg', label: 'Messages', path: '/messages' },
        { icon: '/navIcons/task-square.svg', label: 'Tasks', path: '/tasks' },
        { icon: '/navIcons/users.svg', label: 'Members', path: '/members' },
        { icon: '/navIcons/settings.svg', label: 'Settings', path: '/settings' },
    ]

    const handleDelete = () => {
        const id = deleteProject.id
        onDeleteProject(id)
        setDeleteProject(null)
        if (selectedProjectID === id) navigate('/')
    }

    return (
        <>
            {/* Add modal */}
            {showAddModal && (
                <ProjectModal
                    title="New Project"
                    onClose={() => setShowAddModal(false)}
                    onSubmit={(data) => { onAddProject(data); setShowAddModal(false) }}
                />
            )}

            {/* Edit modal */}
            {editProject && (
                <ProjectModal
                    title="Edit Project"
                    initialName={editProject.name}
                    initialStatus={editProject.status}
                    onClose={() => setEditProject(null)}
                    onSubmit={(data) => { onEditProject(editProject.id, data); setEditProject(null) }}
                />
            )}

            {/* Delete confirm */}
            {deleteProject && (
                <DeleteModal
                    projectName={deleteProject.name}
                    onConfirm={handleDelete}
                    onClose={() => setDeleteProject(null)}
                />
            )}

            <aside className={`Sidebar h-screen sticky top-0 left-0 ${sidebar ? 'w-[270px]' : 'w-[100px]'} transition-all duration-300 ease-in-out border-r border-[#DBDBDB] bg-white flex flex-col overflow-x-hidden overflow-y-auto scrollbar-hide select-none z-50`}>
                <div className="flex flex-col h-full w-full">

                    {/* Logo / toggle */}
                    <div className={`Header flex items-center ${sidebar ? 'justify-between px-6' : 'justify-center'} h-20 border-b border-[#DBDBDB]/50`}>
                        <div className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ${sidebar ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'}`}>
                            <img src="/logo.svg" className="h-[24px] w-[24px] object-contain flex-shrink-0" alt="Logo" />
                            <h1 className="font-bold text-[18px] tracking-tight text-[#0D062D] whitespace-nowrap">Project M.</h1>
                        </div>
                        <div className="flex justify-center items-center h-20">
                            <button onClick={toggleSidebar} className="p-1.5 hover:bg-gray-100 cursor-pointer rounded-lg transition-all duration-200 active:scale-90 flex-shrink-0">
                                <img src={sidebar ? '/dashboardclose.svg' : '/dashboardopen.svg'} className="h-[25px] w-[25px] object-contain" alt="Toggle" />
                            </button>
                        </div>
                    </div>

                    {/* Nav */}
                    <nav className="Navigations flex flex-col gap-1 py-6 px-4">
                        {navItems.map((item, index) => {
                            const isActive = location.pathname === item.path
                            return (
                                <Link
                                    to={item.path}
                                    key={index}
                                    className={`flex items-center ${sidebar ? 'px-3 py-3 gap-4' : 'justify-center w-12 h-12 self-center'} rounded-xl transition-all duration-200 cursor-pointer group ${isActive ? 'bg-[#5030E5]/10' : 'hover:bg-[#5030E5]/5'}`}
                                >
                                    <img src={item.icon} className={`h-[24px] w-[24px] object-contain flex-shrink-0 transition-opacity ${isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`} alt={item.label} />
                                    <span className={`text-[16px] font-medium transition-all duration-300 ${isActive ? 'text-[#0D062D]' : 'text-[#787486] group-hover:text-[#5030E5]'} ${sidebar ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none absolute'} whitespace-nowrap`}>
                                        {item.label}
                                    </span>
                                </Link>
                            )
                        })}
                    </nav>

                    <div className="px-6"><div className="h-[1px] w-full bg-[#DBDBDB]/50" /></div>

                    {/* Projects */}
                    <div className="flex-1 flex flex-col py-4 overflow-hidden">
                        <div className={`ProjectsHeader flex items-center ${sidebar ? 'justify-between px-7' : 'justify-center px-0'} mb-4`}>
                            <span className={`font-bold text-[12px] tracking-wider text-[#787486] uppercase transition-all duration-300 ${sidebar ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 absolute pointer-events-none'}`}>
                                MY PROJECTS
                            </span>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className={`hover:bg-[#5030E5]/10 p-1.5 rounded-md transition-colors flex-shrink-0 group ${!sidebar && 'hidden'}`}
                                title="Add project"
                            >
                                <img src="/add-task.svg" className="h-[16px] w-[16px] object-contain opacity-40 group-hover:opacity-100 transition-opacity" alt="Add" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-1 px-4 overflow-y-auto scrollbar-hide" ref={menuRef}>
                            {(projects ?? []).map((project) => {
                                const isActive = location.pathname === `/project/${project.id}`
                                const menuOpen = openMenuId === project.id
                                return (
                                    <div key={project.id} className="relative">
                                        <Link
                                            to={`/project/${project.id}`}
                                            onClick={() => { setSelectedProjectID(project.id); setOpenMenuId(null) }}
                                            className={`group flex items-center ${sidebar ? 'justify-between px-3 py-2.5' : 'justify-center w-12 h-12 self-center'} rounded-xl transition-all duration-200 cursor-pointer ${isActive ? 'bg-[#5030E5]/10' : 'hover:bg-[#5030E5]/5'}`}
                                        >
                                            <div className="flex items-center gap-4 overflow-hidden">
                                                <div className="h-[8px] w-[8px] rounded-full flex-shrink-0" style={{ background: statusColor(project.status) }} />
                                                <span className={`text-[16px] font-medium transition-all duration-300 ${isActive ? 'text-[#0D062D] font-bold' : 'text-[#787486] group-hover:text-[#0D062D]'} ${sidebar ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none absolute'} whitespace-nowrap`}>
                                                    {project.name}
                                                </span>
                                            </div>

                                            {sidebar && (
                                                <button
                                                    onClick={e => { e.preventDefault(); e.stopPropagation(); setOpenMenuId(menuOpen ? null : project.id) }}
                                                    className="p-1 rounded-md hover:bg-black/5 transition-colors"
                                                >
                                                    <img src="/setting.svg" className="h-[16px] w-[16px] object-contain opacity-0 group-hover:opacity-50 transition-opacity" alt="Options" />
                                                </button>
                                            )}
                                        </Link>

                                        {/* Context menu */}
                                        {menuOpen && sidebar && (
                                            <div className="absolute right-2 top-full mt-1 bg-white rounded-xl shadow-xl border border-[#DBDBDB]/60 overflow-hidden z-40 w-[140px]">
                                                <button
                                                    onClick={() => { setEditProject(project); setOpenMenuId(null) }}
                                                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium text-[#787486] hover:bg-[#5030E5]/5 hover:text-[#5030E5] transition-colors"
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                    </svg>
                                                    Edit
                                                </button>
                                                <div className="h-[1px] bg-[#DBDBDB]/60 mx-3" />
                                                <button
                                                    onClick={() => { setDeleteProject(project); setOpenMenuId(null) }}
                                                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium text-[#D8727D] hover:bg-[#D8727D]/5 transition-colors"
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                                        <polyline points="3 6 5 6 21 6" />
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                    </svg>
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Thoughts card */}
                <div className={`px-6 py-6 transition-all duration-500 ease-in-out ${sidebar ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
                    <div className="bg-[#F5F5F5] p-5 rounded-3xl relative flex flex-col items-center text-center gap-3 shadow-sm border border-white">
                        <div className="absolute -top-6 w-12 h-12 bg-[#F5F5F5] rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                            <div className="w-8 h-8 bg-yellow-400/20 rounded-full flex items-center justify-center text-yellow-600">
                                <span className="text-[18px]">💡</span>
                            </div>
                        </div>
                        <h4 className="text-[14px] font-bold mt-4 text-[#0D062D]">Thoughts Time</h4>
                        <p className="text-[12px] text-[#787486] leading-relaxed">We don't have any notice for now, till then share your thoughts.</p>
                        <button className="w-full py-2.5 bg-white text-[#0D062D] text-[12px] font-bold rounded-lg hover:bg-black hover:text-white transition-all duration-300 shadow-sm border border-[#DBDBDB]/50">
                            Write a message
                        </button>
                    </div>
                </div>
            </aside>
        </>
    )
}

export default Sidebar
