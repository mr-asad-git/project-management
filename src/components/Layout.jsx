import React, { useState } from 'react'
import users from '../mui/users'
import edit from '/edit.svg'
import link from '/link.svg'
import share from '/share.svg'
import category from '/category.svg'
import Board from '../components/Board'

const STATUS_OPTIONS = [
    { value: 'todo', label: 'To Do', color: '#5030E5' },
    { value: 'inProgress', label: 'In Progress', color: '#FFA500' },
    { value: 'completed', label: 'Completed', color: '#7AC555' },
    { value: 'onHold', label: 'On Hold', color: '#D87272' },
]

const PRIORITY_FILTERS = ['All', 'Low', 'High', 'Completed']
const SORT_OPTIONS = [
    { label: 'Default', value: 'default' },
    { label: 'Priority ↑', value: 'priority_asc' },
    { label: 'Priority ↓', value: 'priority_desc' },
    { label: 'Title A-Z', value: 'title_asc' },
]

const PRIORITY_RANK = { High: 0, Low: 1, Completed: 2 }

const Layout = ({ selectedProject, onTaskMove, onTaskDelete, onTaskRestore, onTaskAdd, onTaskUpdate, onEditProject }) => {
    const [priorityFilter, setPriorityFilter] = useState('All')
    const [sortBy, setSortBy] = useState('default')
    const [showSort, setShowSort] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)

    // local edit form state (pre-filled)
    const [editName, setEditName] = useState('')
    const [editStatus, setEditStatus] = useState('todo')

    const openEditModal = () => {
        setEditName(selectedProject.name)
        setEditStatus(selectedProject.status ?? 'todo')
        setShowEditModal(true)
    }

    const handleEditSubmit = (e) => {
        e.preventDefault()
        if (!editName.trim()) return
        onEditProject(selectedProject.id, { name: editName.trim(), status: editStatus })
        setShowEditModal(false)
    }

    // Filter
    let tasks = priorityFilter === 'All'
        ? selectedProject.tasks
        : selectedProject.tasks.filter(t => t.priority === priorityFilter)

    // Sort
    if (sortBy === 'priority_asc') {
        tasks = [...tasks].sort((a, b) => (PRIORITY_RANK[a.priority] ?? 9) - (PRIORITY_RANK[b.priority] ?? 9))
    } else if (sortBy === 'priority_desc') {
        tasks = [...tasks].sort((a, b) => (PRIORITY_RANK[b.priority] ?? 9) - (PRIORITY_RANK[a.priority] ?? 9))
    } else if (sortBy === 'title_asc') {
        tasks = [...tasks].sort((a, b) => a.title.localeCompare(b.title))
    }

    const activeSortLabel = SORT_OPTIONS.find(o => o.value === sortBy)?.label ?? 'Sort'

    return (
        <div className='px-15 py-8 flex flex-col gap-[2rem]'>

            {/* ── Edit Project Modal ── */}
            {showEditModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowEditModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-[420px] p-8 flex flex-col gap-6" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center">
                            <h2 className="text-[20px] font-bold text-[#0D062D]">Edit Project</h2>
                            <button onClick={() => setShowEditModal(false)} className="text-[#787486] hover:text-[#0D062D] text-[22px] leading-none transition-colors">×</button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="flex flex-col gap-5">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] font-semibold text-[#787486] uppercase tracking-wide">Project Name</label>
                                <input
                                    autoFocus
                                    type="text"
                                    value={editName}
                                    onChange={e => setEditName(e.target.value)}
                                    className="border border-[#DBDBDB] rounded-xl px-4 py-3 text-[15px] outline-none focus:border-[#5030E5] focus:ring-2 focus:ring-[#5030E5]/20 transition-all"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[13px] font-semibold text-[#787486] uppercase tracking-wide">Status</label>
                                <div className="flex gap-2 flex-wrap">
                                    {STATUS_OPTIONS.map(opt => (
                                        <button key={opt.value} type="button" onClick={() => setEditStatus(opt.value)}
                                            className={`px-4 py-1.5 rounded-full text-[13px] font-semibold border-2 transition-all duration-150 ${editStatus === opt.value ? 'text-white border-transparent' : 'border-[#DBDBDB] text-[#787486] hover:border-gray-300'}`}
                                            style={editStatus === opt.value ? { background: opt.color, borderColor: opt.color } : {}}>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 py-3 rounded-xl border border-[#DBDBDB] text-[#787486] font-semibold hover:bg-gray-50 transition-colors">Cancel</button>
                                <button type="submit" disabled={!editName.trim()} className="flex-1 py-3 rounded-xl bg-[#5030E5] text-white font-semibold hover:bg-[#3d22c4] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Project Header ── */}
            <div className="header flex justify-between items-center">
                <div className="heading flex flex-row gap-[2rem] items-center">
                    <h1 className='text-[40px] font-[600] text-[#0D062D]'>{selectedProject.name}</h1>
                    <div className="heading-actions flex flex-row gap-[1rem]">
                        <button
                            onClick={openEditModal}
                            title="Edit project"
                            className="action-item px-[8px] py-[4px] bg-[var(--button-color)]/20 rounded-[8px] flex justify-center items-center hover:bg-[#5030E5]/30 transition-colors cursor-pointer"
                        >
                            <img src={edit} alt="Edit" />
                        </button>
                        <div className="action-item px-[8px] py-[4px] bg-[var(--button-color)]/20 rounded-[8px] flex justify-center items-center">
                            <img src={link} alt="" />
                        </div>
                    </div>
                </div>

                <div className="userInvites flex flex-row gap-[20px] items-center">
                    <div className="action-item px-[10px] py-[6px] bg-[var(--button-color)]/20 rounded-[8px] flex justify-center items-center">
                        <p className='text-[14px] font-bold text-[#5030E5]'>+</p>
                    </div>
                    <p className='text-lg font-[600] text-[#5030E5]'>Invite</p>
                    <div className="userImage flex">
                        {users.map((user) => (
                            <img key={user.id} src={user.image} alt={user.name} className='-mr-[10px]' />
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Filter + Sort Bar ── */}
            <div className="filteration flex justify-between items-center">

                {/* Priority filter pills */}
                <div className="flex items-center gap-3">
                    <span className="text-[13px] font-semibold text-[#787486] uppercase tracking-wide mr-1">Filter:</span>
                    {PRIORITY_FILTERS.map(f => (
                        <button
                            key={f}
                            onClick={() => setPriorityFilter(f)}
                            className={`px-4 py-1.5 rounded-full text-[13px] font-semibold border-2 transition-all duration-150 ${priorityFilter === f
                                ? f === 'All' ? 'bg-[#0D062D] border-[#0D062D] text-white'
                                    : f === 'High' ? 'bg-[#D8727D] border-[#D8727D] text-white'
                                        : f === 'Low' ? 'bg-[#D58D49] border-[#D58D49] text-white'
                                            : 'bg-[#7AC555] border-[#7AC555] text-white'
                                : 'border-[#DBDBDB] text-[#787486] hover:border-gray-400 bg-white'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Right side: Sort dropdown + view toggles */}
                <div className="flex items-center gap-4">

                    {/* Sort dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowSort(!showSort)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-[13px] font-semibold transition-all duration-150 ${showSort ? 'border-[#5030E5] text-[#5030E5] bg-[#5030E5]/5' : 'border-[#DBDBDB] text-[#787486] hover:border-[#5030E5]/40 bg-white'}`}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M3 6h18M6 12h12M9 18h6" />
                            </svg>
                            {activeSortLabel}
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`transition-transform ${showSort ? 'rotate-180' : ''}`}>
                                <path d="M6 9l6 6 6-6" />
                            </svg>
                        </button>
                        {showSort && (
                            <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-[#DBDBDB]/60 overflow-hidden z-30 w-[155px]">
                                {SORT_OPTIONS.map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => { setSortBy(opt.value); setShowSort(false) }}
                                        className={`w-full text-left px-4 py-2.5 text-[13px] font-medium transition-colors ${sortBy === opt.value ? 'bg-[#5030E5]/10 text-[#5030E5]' : 'text-[#787486] hover:bg-gray-50'}`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Share */}
                    <div className="share-button h-[40px] px-4 flex justify-center items-center rounded-xl border-2 border-[#DBDBDB] gap-2 hover:border-[#5030E5]/40 transition-colors cursor-pointer">
                        <img src={share} alt="" />
                        <p className='text-[13px] font-[600] text-[#787486]'>Share</p>
                    </div>

                    {/* View icons */}
                    <div className="flex items-center gap-2 border-l border-[#DBDBDB] pl-4">
                        <div className="h-[38px] w-[38px] bg-[var(--button-color)] flex justify-center items-center rounded-xl cursor-pointer hover:opacity-90 transition-opacity">
                            <div className="flex flex-col gap-[4px]">
                                <div className="h-[6px] w-[20px] bg-white rounded-[2px]" />
                                <div className="h-[6px] w-[20px] bg-white rounded-[2px]" />
                            </div>
                        </div>
                        <div className="h-[38px] w-[38px] flex justify-center items-center rounded-xl border-2 border-[#DBDBDB] cursor-pointer hover:border-[#5030E5]/40 transition-colors">
                            <img className='h-5 w-5' src={category} alt="" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Task count hint when filtered */}
            {priorityFilter !== 'All' && (
                <p className="text-[13px] text-[#787486]">
                    Showing <span className="font-semibold text-[#0D062D]">{tasks.length}</span> task{tasks.length !== 1 ? 's' : ''} with priority <span className="font-semibold">{priorityFilter}</span>
                    <button onClick={() => setPriorityFilter('All')} className="ml-3 text-[#5030E5] hover:underline">Clear</button>
                </p>
            )}

            <Board tasks={tasks} onTaskMove={onTaskMove} onTaskDelete={onTaskDelete} onTaskRestore={onTaskRestore} onTaskAdd={onTaskAdd} onTaskUpdate={onTaskUpdate} />
        </div>
    )
}

export default Layout