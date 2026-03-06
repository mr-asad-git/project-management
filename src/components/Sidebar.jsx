import React, { useState, useRef, useEffect, useMemo } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

/* ── Constants ───────────────────────────────────────────────────── */
const STATUS_OPTIONS = [
    { value: 'todo', label: 'To Do', color: '#5030E5' },
    { value: 'inProgress', label: 'In Progress', color: '#FFA500' },
    { value: 'completed', label: 'Completed', color: '#7AC555' },
    { value: 'onHold', label: 'On Hold', color: '#D87272' },
]

const statusColor = (s) => ({ completed: '#7AC555', inProgress: '#FFA500', onHold: '#D87272' }[s] ?? '#5030E5')

/* ── Sortable Project Item ───────────────────────────────────────── */
const SortableProjectItem = ({ project, isActive, menuOpen, sidebar, isDragDisabled, onSelect, onToggleMenu, onEdit, onDelete }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: project.id,
        disabled: isDragDisabled
    });

    const navigate = useNavigate();

    // Track whether the pointer actually moved enough to constitute a drag.
    // isDragging from useSortable is already false by the time the click fires,
    // so we use a ref that stays true through the click and is cleared right after.
    const wasDragged = React.useRef(false);

    React.useEffect(() => {
        if (isDragging) {
            wasDragged.current = true;
        }
    }, [isDragging]);

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        position: 'relative',
        zIndex: isDragging ? 99 : (menuOpen ? 50 : 1),
        opacity: isDragging ? 0.8 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="relative">
            <div
                onClick={(e) => {
                    if (wasDragged.current) {
                        e.preventDefault();
                        wasDragged.current = false;
                        return;
                    }
                    onSelect(project.id);
                    navigate(`/project/${project.id}`);
                }}
                className={`group flex items-center ${sidebar ? 'justify-between px-3 py-2.5' : 'justify-center w-12 h-12 self-center'} rounded-xl transition-all duration-200 cursor-grab active:cursor-grabbing ${isActive ? 'bg-[#5030E5]/10' : 'hover:bg-[#5030E5]/5'}`}
            >
                <div className="flex items-center gap-4 overflow-hidden pointer-events-none">
                    <div className="h-[8px] w-[8px] rounded-full flex-shrink-0" style={{ background: statusColor(project.status) }} />
                    <span className={`text-[16px] font-medium transition-all duration-300 ${isActive ? 'text-[#0D062D] font-bold' : 'text-[#787486] group-hover:text-[#0D062D]'} ${sidebar ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none absolute'} whitespace-nowrap select-none`}>
                        {project.name}
                    </span>
                </div>

                {sidebar && (
                    <button
                        onClick={e => { e.preventDefault(); e.stopPropagation(); onToggleMenu(); }}
                        className="p-1 rounded-md hover:bg-black/5 transition-colors z-10 relative"
                        onPointerDown={e => e.stopPropagation()}
                    >
                        <img src="/setting.svg" className="h-[16px] w-[16px] object-contain opacity-0 group-hover:opacity-50 group-focus:opacity-50 transition-opacity pointer-events-none" alt="Options" />
                    </button>
                )}
            </div>

            {/* Context menu */}
            {menuOpen && sidebar && (
                <div className="absolute left-[calc(100%-8px)] top-0 bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] ring-1 ring-black/5 overflow-hidden z-[9999] w-[140px] drop-shadow-2xl" onPointerDown={e => e.stopPropagation()}>
                    <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(); }}
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
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(); }}
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
    );
};

/* ── Reusable Project Modal (Add / Edit) ─────────────────────────── */
const ProjectModal = ({ title, initialName = '', initialStatus = 'todo', existingProjects = [], currentProjectId = null, onSubmit, onClose }) => {
    const [name, setName] = useState(initialName)
    const [status, setStatus] = useState(initialStatus)
    const [error, setError] = useState('')

    useEffect(() => {
        const trimmedName = name.trim().toLowerCase()
        if (!trimmedName) {
            setError('')
            return
        }

        const isDuplicate = existingProjects.some(p =>
            p.name.trim().toLowerCase() === trimmedName && p.id !== currentProjectId
        )

        if (isDuplicate) {
            setError('A project with this name already exists.')
        } else {
            setError('')
        }
    }, [name, existingProjects, currentProjectId])

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-[420px] p-8 flex flex-col gap-6" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center">
                    <h2 className="text-[20px] font-bold text-[#0D062D]">{title}</h2>
                    <button onClick={onClose} className="text-[#787486] hover:text-[#0D062D] text-[22px] leading-none transition-colors">×</button>
                </div>

                <form onSubmit={e => { e.preventDefault(); if (name.trim() && !error) onSubmit({ name: name.trim(), status }) }} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-semibold text-[#787486] uppercase tracking-wide">Project Name</label>
                        <input
                            autoFocus
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. Marketing Campaign"
                            className={`border ${error ? 'border-red-500' : 'border-[#DBDBDB]'} rounded-xl px-4 py-3 text-[15px] outline-none focus:border-[#5030E5] focus:ring-2 focus:ring-[#5030E5]/20 transition-all`}
                        />
                        {error && (
                            <span className="text-red-500 text-[12px] font-medium mt-1 ml-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                {error}
                            </span>
                        )}
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
                        <button type="submit" disabled={!name.trim() || !!error} className="flex-1 py-3 rounded-xl bg-[#5030E5] text-white font-semibold hover:bg-[#3d22c4] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
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
const Sidebar = ({ sidebar, toggleSidebar, selectedProjectID, setSelectedProjectID, projects, onAddProject, onEditProject, onDeleteProject, onReorderProjects }) => {
    const location = useLocation()
    const navigate = useNavigate()

    const [showAddModal, setShowAddModal] = useState(false)
    const [editProject, setEditProject] = useState(null)
    const [deleteProject, setDeleteProject] = useState(null)
    const [openMenuId, setOpenMenuId] = useState(null)
    const [projectSortFilter, setProjectSortFilter] = useState('default')
    const [showProjectSort, setShowProjectSort] = useState(false)
    const menuRef = useRef(null)
    const sortFilterRef = useRef(null)

    useEffect(() => {
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenuId(null)
            if (sortFilterRef.current && !sortFilterRef.current.contains(e.target)) setShowProjectSort(false)
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

    const sortedProjects = useMemo(() => {
        if (!projects) return [];
        let sorted = [...projects];
        if (projectSortFilter === 'a-z') {
            sorted.sort((a, b) => a.name.localeCompare(b.name));
        } else if (projectSortFilter === 'z-a') {
            sorted.sort((a, b) => b.name.localeCompare(a.name));
        } else if (projectSortFilter === 'status') {
            const statusOrder = { 'todo': 0, 'inProgress': 1, 'completed': 2, 'onHold': 3 };
            sorted.sort((a, b) => (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0));
        }
        return sorted;
    }, [projects, projectSortFilter]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over?.id && onReorderProjects && projectSortFilter === 'default') {
            const oldIndex = sortedProjects.findIndex((p) => p.id === active.id);
            const newIndex = sortedProjects.findIndex((p) => p.id === over.id);
            const newProjects = arrayMove(sortedProjects, oldIndex, newIndex);
            onReorderProjects(newProjects);
        }
    };

    return (
        <>
            {/* Add modal */}
            {showAddModal && (
                <ProjectModal
                    title="New Project"
                    existingProjects={projects}
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
                    existingProjects={projects}
                    currentProjectId={editProject.id}
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

            <aside className={`Sidebar z-100 h-screen sticky top-0 left-0 ${sidebar ? 'w-[270px]' : 'w-[100px]'} transition-all duration-300 ease-in-out border-r border-[#DBDBDB] bg-white flex flex-col overflow-x-hidden overflow-y-auto scrollbar-hide select-none z-50`}>
                <div className="flex flex-col min-h-full w-full">

                    {/* Logo / toggle */}
                    <div className={`Header sticky top-0 left-0 z-50 bg-white/50 backdrop-blur-sm flex items-center ${sidebar ? 'justify-between px-6' : 'justify-center'} h-20 border-b border-[#DBDBDB]/50`}>
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
                    <div className="flex flex-col py-4 flex-grow relative z-[80]">
                        <div className={`ProjectsHeader flex items-center ${sidebar ? 'justify-between px-7' : 'justify-center px-0'} mb-4 relative z-50`}>
                            <span className={`font-bold text-[12px] tracking-wider text-[#787486] uppercase transition-all duration-300 ${sidebar ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 absolute pointer-events-none'}`}>
                                MY PROJECTS
                            </span>
                            <div className={`flex items-center gap-2 transition-all group ${!sidebar && 'hidden'}`}>
                                <div className="relative" ref={sortFilterRef}>
                                    <button
                                        onClick={() => setShowProjectSort(!showProjectSort)}
                                        className="hover:bg-[#5030E5]/10 p-1.5 rounded-md transition-colors flex-shrink-0"
                                        title="Filter Projects"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#787486] group-hover:text-[#5030E5] transition-colors">
                                            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                                        </svg>
                                    </button>
                                    {showProjectSort && (
                                        <div className="absolute right-0 top-full mt-2 w-36 bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-[#DBDBDB]/60 overflow-hidden z-50 py-1">
                                            <div className="px-3 py-1.5 text-[10px] font-bold text-[#787486] uppercase tracking-wider">Sort by</div>
                                            {[
                                                { label: 'Default', val: 'default' },
                                                { label: 'A-Z', val: 'a-z' },
                                                { label: 'Z-A', val: 'z-a' },
                                                { label: 'Status', val: 'status' }
                                            ].map(f => (
                                                <button
                                                    key={f.val}
                                                    onClick={() => { setProjectSortFilter(f.val); setShowProjectSort(false); }}
                                                    className={`w-full text-left px-4 py-2 text-[13px] font-medium transition-colors ${projectSortFilter === f.val ? 'bg-[#5030E5]/10 text-[#5030E5]' : 'text-[#787486] hover:bg-gray-50'}`}
                                                >
                                                    {f.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="bg-[rgba(80,48,229,0.1)] hover:bg-[#5030E5] text-[#5030E5] hover:text-white rounded-md transition-colors flex-shrink-0 flex items-center justify-center p-0 w-[28px] h-[28px]"
                                    title="Add project"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                                        <line x1="12" y1="5" x2="12" y2="19" />
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1 px-4 z-40 pb-4 h-full" ref={menuRef}>
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={sortedProjects.map(p => p.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {sortedProjects.map((project) => {
                                        const isActive = location.pathname === `/project/${project.id}`
                                        const menuOpen = openMenuId === project.id
                                        return (
                                            <SortableProjectItem
                                                key={project.id}
                                                project={project}
                                                isActive={isActive}
                                                menuOpen={menuOpen}
                                                sidebar={sidebar}
                                                isDragDisabled={projectSortFilter !== 'default'}
                                                onSelect={(id) => { setSelectedProjectID(id); setOpenMenuId(null); }}
                                                onToggleMenu={() => setOpenMenuId(menuOpen ? null : project.id)}
                                                onEdit={() => { setEditProject(project); setOpenMenuId(null); }}
                                                onDelete={() => { setDeleteProject(project); setOpenMenuId(null); }}
                                            />
                                        )
                                    })}
                                </SortableContext>
                            </DndContext>
                        </div>
                    </div>

                    {/* Spacer to push the thoughts card down if the list is short */}
                    <div className="flex-1" />

                    {/* Thoughts card */}
                    <div className={`px-6 pb-6 pt-2 mt-auto relative transition-all duration-500 ease-in-out z-10 ${sidebar ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
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

                </div>
            </aside>
        </>
    )
}

export default Sidebar
