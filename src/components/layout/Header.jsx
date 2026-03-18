import React, { useState, useRef, useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import UserAvatar from '../ui/UserAvatar'

const NAV_LABELS = {
    '/': 'Home',
    '/messages': 'Messages',
    '/tasks': 'Tasks',
    '/members': 'Members',
    '/settings': 'Settings',
}

const STATUS_COLOR = {
    todo: '#5030E5',
    inProgress: '#FFA500',
    completed: '#7AC555',
    onHold: '#D87272',
}
const STATUS_LABEL = {
    todo: 'To Do',
    inProgress: 'In Progress',
    completed: 'Completed',
    onHold: 'On Hold',
}

/* ── Highlight matching text ──────────────────────────────────────── */
const Highlight = ({ text, query }) => {
    if (!query) return <span>{text}</span>
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'))
    return (
        <span>
            {parts.map((part, i) =>
                part.toLowerCase() === query.toLowerCase()
                    ? <mark key={i} className="bg-[#5030E5]/15 text-[#5030E5] rounded-sm px-0.5 font-semibold not-italic">{part}</mark>
                    : <span key={i}>{part}</span>
            )}
        </span>
    )
}

/* ── Task Calendar Modal ──────────────────────────────────────────── */
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const TaskCalendar = ({ projectTasks, projects, onClose }) => {
    const navigate = useNavigate()
    const [currentMonth, setCurrentMonth] = useState(new Date())

    const allTasks = useMemo(() => {
        return Object.entries(projectTasks).flatMap(([projectId, tasks]) =>
            tasks.map(t => ({
                ...t,
                projectId: Number(projectId),
                projectName: projects.find(p => p.id === Number(projectId))?.name ?? 'Unknown',
                // Use explicit dueDate, or derive from id timestamp if it looks like one
                date: t.dueDate
                    || (typeof t.id === 'number' && t.id > 1_000_000_000_000
                        ? new Date(t.id).toISOString().slice(0, 10)
                        : new Date().toISOString().slice(0, 10)),
            }))
        )
    }, [projectTasks, projects])

    const tasksByDate = useMemo(() => {
        const groups = {}
        allTasks.forEach(task => {
            if (!groups[task.date]) groups[task.date] = []
            groups[task.date].push(task)
        })
        return groups
    }, [allTasks])

    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDayOfWeek = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const today = new Date().toISOString().slice(0, 10)

    const prevMonth = () => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))
    const nextMonth = () => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))
    const goToday = () => setCurrentMonth(new Date())

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.18)] w-[820px] max-w-[95vw] h-[90vh] flex flex-col overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Calendar header */}
                <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-black text-[#0D062D]">Task Calendar</h2>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">Click a task to open its project board</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={goToday}
                            className="px-3 py-1.5 text-xs font-bold text-[#5030E5] bg-[#5030E5]/8 hover:bg-[#5030E5]/15 rounded-lg transition-colors"
                        >
                            Today
                        </button>
                        <div className="flex items-center gap-1 bg-slate-50 rounded-xl p-1">
                            <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm text-slate-400 hover:text-slate-700 transition-all">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
                            </button>
                            <span className="text-[13px] font-bold text-[#0D062D] min-w-[130px] text-center">
                                {MONTH_NAMES[month]} {year}
                            </span>
                            <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm text-slate-400 hover:text-slate-700 transition-all">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
                            </button>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors ml-1">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        </button>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 px-7 py-3 border-b border-slate-50 flex-shrink-0">
                    {Object.entries(STATUS_LABEL).map(([key, label]) => (
                        <div key={key} className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: STATUS_COLOR[key] }} />
                            <span className="text-[11px] font-medium text-slate-500">{label}</span>
                        </div>
                    ))}
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 px-4 pt-3 gap-1 flex-shrink-0">
                    {DAY_NAMES.map(d => (
                        <div key={d} className="text-center text-[11px] font-bold text-slate-400 uppercase tracking-wide pb-2">{d}</div>
                    ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1 px-4 pb-5 flex-1 overflow-y-auto">
                    {/* Empty leading cells */}
                    {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                        <div key={`empty-${i}`} className="min-h-[88px]" />
                    ))}

                    {/* Day cells */}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1
                        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                        const dayTasks = tasksByDate[dateStr] || []
                        const isToday = dateStr === today
                        const isWeekend = ((firstDayOfWeek + i) % 7 === 0 || (firstDayOfWeek + i) % 7 === 6)

                        return (
                            <div
                                key={day}
                                className={`min-h-[88px] rounded-2xl p-2 flex flex-col gap-1 border transition-colors ${isToday
                                    ? 'border-[#5030E5]/40 bg-[#5030E5]/5'
                                    : isWeekend
                                        ? 'border-slate-100 bg-slate-50/60'
                                        : 'border-slate-100 bg-white hover:bg-slate-50/80'
                                    }`}
                            >
                                <span className={`text-xs font-bold self-end w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0 ${isToday ? 'bg-[#5030E5] text-white' : 'text-slate-400'
                                    }`}>
                                    {day}
                                </span>

                                {dayTasks.slice(0, 3).map(task => (
                                    <button
                                        key={task.id}
                                        onClick={() => { onClose(); navigate(`/project/${task.projectId}`) }}
                                        className="text-left text-[9px] font-bold px-1.5 py-1 rounded-md truncate w-full transition-all hover:opacity-75 active:scale-95"
                                        style={{
                                            backgroundColor: (STATUS_COLOR[task.status] || '#787486') + '1A',
                                            color: STATUS_COLOR[task.status] || '#787486',
                                            border: `1px solid ${(STATUS_COLOR[task.status] || '#787486')}33`,
                                        }}
                                        title={`${task.title} · ${task.projectName}`}
                                    >
                                        {task.title}
                                    </button>
                                ))}

                                {dayTasks.length > 3 && (
                                    <span className="text-[9px] text-slate-400 font-semibold px-1">
                                        +{dayTasks.length - 3} more
                                    </span>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

/* ── Main Header component ────────────────────────────────────────── */
const Header = ({ projects = [], projectTasks = {} }) => {
    const location = useLocation()
    const navigate = useNavigate()
    const { currentUser, logout, users } = useAuth()
    const user = currentUser || {}
    const [search, setSearch] = useState('')
    const [searchFocused, setSearchFocused] = useState(false)
    const [profileOpen, setProfileOpen] = useState(false)
    const [calendarOpen, setCalendarOpen] = useState(false)
    const [activeIndex, setActiveIndex] = useState(-1)
    const profileRef = useRef(null)
    const searchInputRef = useRef(null)
    const searchWrapRef = useRef(null)

    const pageLabel = NAV_LABELS[location.pathname]
        ?? (location.pathname.startsWith('/project') ? 'Project Board' : '')

    /* ── Close profile dropdown on outside click ── */
    useEffect(() => {
        const handler = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    /* ── Close search on outside click ── */
    useEffect(() => {
        const handler = (e) => {
            if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) {
                setSearchFocused(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    /* ── Ctrl+K shortcut ── */
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault()
                searchInputRef.current?.focus()
                setSearchFocused(true)
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    /* ── Build search results ── */
    const results = useMemo(() => {
        const q = search.trim().toLowerCase()
        if (!q) return { tasks: [], projects: [], members: [] }

        const allTasks = Object.entries(projectTasks).flatMap(([projectId, tasks]) =>
            tasks.map(t => ({
                ...t,
                projectId: Number(projectId),
                projectName: projects.find(p => p.id === Number(projectId))?.name ?? 'Unknown',
            }))
        )
        const matchedTasks = allTasks.filter(t =>
            t.title?.toLowerCase().includes(q) || t.text?.toLowerCase().includes(q)
        ).slice(0, 5)

        const matchedProjects = projects.filter(p =>
            p.name?.toLowerCase().includes(q)
        ).slice(0, 4)

        const matchedMembers = users.filter(u =>
            u.name?.toLowerCase().includes(q) || u.location?.toLowerCase().includes(q)
        ).slice(0, 4)

        return { tasks: matchedTasks, projects: matchedProjects, members: matchedMembers }
    }, [search, projects, projectTasks])

    const totalResults = results.tasks.length + results.projects.length + results.members.length

    const flatItems = useMemo(() => [
        ...results.tasks.map(t => ({ type: 'task', data: t })),
        ...results.projects.map(p => ({ type: 'project', data: p })),
        ...results.members.map(m => ({ type: 'member', data: m })),
    ], [results])

    const handleResultClick = (type, data) => {
        setSearch('')
        setSearchFocused(false)
        setActiveIndex(-1)
        if (type === 'task') navigate(`/project/${data.projectId}`)
        else if (type === 'project') navigate(`/project/${data.id}`)
        else if (type === 'member') navigate('/members', { state: { memberId: data.id } })
    }

    const handleKeyDown = (e) => {
        if (!showDropdown) return
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setActiveIndex(i => Math.min(i + 1, flatItems.length - 1))
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setActiveIndex(i => Math.max(i - 1, 0))
        } else if (e.key === 'Enter' && activeIndex >= 0) {
            const item = flatItems[activeIndex]
            if (item) handleResultClick(item.type, item.data)
        } else if (e.key === 'Escape') {
            setSearch('')
            setSearchFocused(false)
            setActiveIndex(-1)
            searchInputRef.current?.blur()
        }
    }

    const showDropdown = searchFocused && search.trim().length > 0

    const handleSignOut = () => {
        setProfileOpen(false)
        logout()
        toast.success('Signed out successfully. See you soon!', {
            icon: '👋',
            duration: 3000,
        })
        navigate('/login')
    }

    /* ── Profile dropdown menu items ── */
    const profileMenuItems = [
        {
            icon: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
            ),
            label: 'View Profile',
            path: '/settings',
        },
        {
            icon: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
            ),
            label: 'Settings',
            path: '/settings',
        },
        {
            icon: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 12l2 2 4-4" />
                </svg>
            ),
            label: 'My Tasks',
            path: '/tasks',
        },
    ]

    return (
        <>
            <header className='h-20 sticky top-0 bg-white/90 backdrop-blur-md z-30 w-full border-b border-[#DBDBDB]/60 flex items-center justify-between px-8 gap-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]'>

                {/* ── Left: Page Label ── */}
                <div className="flex items-center gap-3 min-w-[160px]">
                    <div className="h-8 w-8 rounded-lg bg-[#5030E5]/10 flex items-center justify-center flex-shrink-0">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5030E5" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-[11px] font-medium text-[#787486] leading-none mb-0.5 uppercase tracking-wide">VBT</p>
                        <h2 className="text-[15px] font-bold text-[#0D062D] leading-none">{pageLabel || 'Dashboard'}</h2>
                    </div>
                </div>

                {/* ── Centre: Search ── */}
                <div className="flex-1 max-w-[480px] relative" ref={searchWrapRef}>
                    <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border-2 bg-white transition-all duration-200 ${searchFocused
                        ? 'border-[#5030E5] shadow-[0_0_0_4px_rgba(80,48,229,0.08)]'
                        : 'border-[#DBDBDB]/70 hover:border-[#DBDBDB]'
                        }`}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={searchFocused ? '#5030E5' : '#787486'} strokeWidth="2.5" strokeLinecap="round" className="flex-shrink-0 transition-colors">
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={search}
                            onChange={e => { setSearch(e.target.value); setActiveIndex(-1) }}
                            onFocus={() => setSearchFocused(true)}
                            onKeyDown={handleKeyDown}
                            placeholder="Search tasks, projects, members…"
                            className='bg-transparent outline-none text-[14px] text-[#0D062D] placeholder:text-[#787486]/70 w-full font-medium'
                        />
                        {search && (
                            <button onClick={() => { setSearch(''); setActiveIndex(-1) }} className="text-[#787486] hover:text-[#0D062D] transition-colors flex-shrink-0">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        )}
                        {!searchFocused && !search && (
                            <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
                                <kbd className="flex items-center gap-0.5 text-[10px] font-bold text-[#787486]/70 bg-[#f3f4f6] border border-[#DBDBDB] rounded-md px-1.5 py-0.5 shadow-[0_1px_0_rgba(0,0,0,0.1)]">
                                    <span className="opacity-70">{navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? '⌘' : 'Ctrl'}</span>
                                    <span className="opacity-40">+</span>
                                    <span>K</span>
                                </kbd>
                            </div>
                        )}
                    </div>

                    {/* ── Results Dropdown ── */}
                    {showDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.14)] border border-[#DBDBDB]/60 overflow-hidden z-[200] max-h-[420px] overflow-y-auto">

                            {totalResults === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 gap-3 text-center px-6">
                                    <div className="h-12 w-12 rounded-full bg-[#5030E5]/8 flex items-center justify-center">
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5030E5" strokeWidth="2" strokeLinecap="round">
                                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-[14px] font-bold text-[#0D062D]">No results found</p>
                                        <p className="text-[12px] text-[#787486] mt-0.5">Try searching for tasks, project names, or member names</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Tasks Group */}
                                    {results.tasks.length > 0 && (
                                        <div>
                                            <div className="px-4 pt-3 pb-1.5 flex items-center gap-2">
                                                <div className="h-5 w-5 rounded-md bg-[#5030E5]/10 flex items-center justify-center">
                                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#5030E5" strokeWidth="2.5" strokeLinecap="round">
                                                        <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 12l2 2 4-4" />
                                                    </svg>
                                                </div>
                                                <span className="text-[10px] font-black text-[#787486] uppercase tracking-widest">Tasks</span>
                                                <span className="ml-auto text-[10px] text-[#787486]/60 font-bold">{results.tasks.length}</span>
                                            </div>
                                            {results.tasks.map((task, idx) => {
                                                const isActive = idx === activeIndex
                                                return (
                                                    <button
                                                        key={task.id}
                                                        onClick={() => handleResultClick('task', task)}
                                                        onMouseEnter={() => setActiveIndex(idx)}
                                                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${isActive ? 'bg-[#5030E5]/5' : 'hover:bg-gray-50'}`}
                                                    >
                                                        <div className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: STATUS_COLOR[task.status] ?? '#787486' }} />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-[13px] font-semibold text-[#0D062D] truncate">
                                                                <Highlight text={task.title} query={search.trim()} />
                                                            </p>
                                                            <p className="text-[11px] text-[#787486] truncate">{task.projectName} · {STATUS_LABEL[task.status] ?? task.status}</p>
                                                        </div>
                                                        {task.priority && task.priority !== 'Completed' && (
                                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                                                                style={{
                                                                    color: task.priority === 'High' ? '#D8727D' : '#D58D49',
                                                                    backgroundColor: task.priority === 'High' ? '#D8727D18' : '#D58D4918',
                                                                }}>
                                                                {task.priority}
                                                            </span>
                                                        )}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    )}

                                    {/* Projects Group */}
                                    {results.projects.length > 0 && (
                                        <div className={results.tasks.length > 0 ? 'border-t border-[#DBDBDB]/40' : ''}>
                                            <div className="px-4 pt-3 pb-1.5 flex items-center gap-2">
                                                <div className="h-5 w-5 rounded-md bg-[#FFA500]/10 flex items-center justify-center">
                                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#FFA500" strokeWidth="2.5" strokeLinecap="round">
                                                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                                                    </svg>
                                                </div>
                                                <span className="text-[10px] font-black text-[#787486] uppercase tracking-widest">Projects</span>
                                                <span className="ml-auto text-[10px] text-[#787486]/60 font-bold">{results.projects.length}</span>
                                            </div>
                                            {results.projects.map((project, idx) => {
                                                const flatIdx = results.tasks.length + idx
                                                const isActive = flatIdx === activeIndex
                                                return (
                                                    <button
                                                        key={project.id}
                                                        onClick={() => handleResultClick('project', project)}
                                                        onMouseEnter={() => setActiveIndex(flatIdx)}
                                                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${isActive ? 'bg-[#5030E5]/5' : 'hover:bg-gray-50'}`}
                                                    >
                                                        <div className="h-7 w-7 rounded-lg bg-[#5030E5]/8 flex items-center justify-center flex-shrink-0">
                                                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: STATUS_COLOR[project.status] ?? '#5030E5' }} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-[13px] font-semibold text-[#0D062D] truncate">
                                                                <Highlight text={project.name} query={search.trim()} />
                                                            </p>
                                                            <p className="text-[11px] text-[#787486]">
                                                                {(projectTasks[project.id] ?? []).length} tasks · {STATUS_LABEL[project.status] ?? 'Unknown'}
                                                            </p>
                                                        </div>
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DBDBDB" strokeWidth="2" strokeLinecap="round">
                                                            <path d="M9 18l6-6-6-6" />
                                                        </svg>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    )}

                                    {/* Members Group */}
                                    {results.members.length > 0 && (
                                        <div className={(results.tasks.length > 0 || results.projects.length > 0) ? 'border-t border-[#DBDBDB]/40' : ''}>
                                            <div className="px-4 pt-3 pb-1.5 flex items-center gap-2">
                                                <div className="h-5 w-5 rounded-md bg-[#7AC555]/10 flex items-center justify-center">
                                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#7AC555" strokeWidth="2.5" strokeLinecap="round">
                                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                                    </svg>
                                                </div>
                                                <span className="text-[10px] font-black text-[#787486] uppercase tracking-widest">Members</span>
                                                <span className="ml-auto text-[10px] text-[#787486]/60 font-bold">{results.members.length}</span>
                                            </div>
                                            {results.members.map((member, idx) => {
                                                const flatIdx = results.tasks.length + results.projects.length + idx
                                                const isActive = flatIdx === activeIndex
                                                return (
                                                    <button
                                                        key={member.id}
                                                        onClick={() => handleResultClick('member', member)}
                                                        onMouseEnter={() => setActiveIndex(flatIdx)}
                                                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${isActive ? 'bg-[#5030E5]/5' : 'hover:bg-gray-50'}`}
                                                    >
                                                        <UserAvatar user={member} className="h-7 w-7 rounded-xl ring-2 ring-[#5030E5]/15 flex-shrink-0" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-[13px] font-semibold text-[#0D062D] truncate">
                                                                <Highlight text={member.name} query={search.trim()} />
                                                            </p>
                                                            <p className="text-[11px] text-[#787486] truncate">{member.location}</p>
                                                        </div>
                                                        <div className="h-2 w-2 rounded-full bg-[#7AC555] flex-shrink-0" />
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    )}

                                    {/* Footer hint */}
                                    <div className="border-t border-[#DBDBDB]/40 px-4 py-2.5 flex items-center gap-4">
                                        <div className="flex items-center gap-1.5 text-[10px] text-[#787486]/60">
                                            <kbd className="bg-[#f3f4f6] border border-[#DBDBDB] rounded px-1 py-0.5 font-bold">↑↓</kbd>
                                            <span>Navigate</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[10px] text-[#787486]/60">
                                            <kbd className="bg-[#f3f4f6] border border-[#DBDBDB] rounded px-1 py-0.5 font-bold">↵</kbd>
                                            <span>Open</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[10px] text-[#787486]/60">
                                            <kbd className="bg-[#f3f4f6] border border-[#DBDBDB] rounded px-1 py-0.5 font-bold">Esc</kbd>
                                            <span>Close</span>
                                        </div>
                                        <span className="ml-auto text-[10px] text-[#787486]/50 font-medium">{totalResults} result{totalResults !== 1 ? 's' : ''}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Right: Action Icons + Profile ── */}
                <div className="flex items-center gap-1.5">

                    {/* Calendar */}
                    <button
                        onClick={() => setCalendarOpen(true)}
                        title="Task Calendar"
                        className="relative h-9 w-9 rounded-xl flex items-center justify-center text-[#787486] hover:text-[#5030E5] hover:bg-[#5030E5]/8 transition-all duration-150"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                    </button>

                    {/* Messages */}
                    <button
                        onClick={() => navigate('/messages')}
                        title="Messages"
                        className="relative h-9 w-9 rounded-xl flex items-center justify-center text-[#787486] hover:text-[#5030E5] hover:bg-[#5030E5]/8 transition-all duration-150"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        <span className="absolute top-1 right-1 h-[16px] min-w-[16px] px-0.5 bg-[#D8727D] rounded-full text-[9px] font-bold text-white flex items-center justify-center leading-none ring-2 ring-white">
                            3
                        </span>
                    </button>

                    {/* Notifications */}
                    <button
                        title="Notifications"
                        className="relative h-9 w-9 rounded-xl flex items-center justify-center text-[#787486] hover:text-[#5030E5] hover:bg-[#5030E5]/8 transition-all duration-150"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                        <span className="absolute top-1 right-1 h-[16px] min-w-[16px] px-0.5 bg-[#D8727D] rounded-full text-[9px] font-bold text-white flex items-center justify-center leading-none ring-2 ring-white">
                            7
                        </span>
                    </button>

                    <div className="h-6 w-[1px] bg-[#DBDBDB] mx-2" />

                    {/* Profile Dropdown */}
                    <div className="relative" ref={profileRef}>
                        <button
                            onClick={() => setProfileOpen(!profileOpen)}
                            className={`flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-xl transition-all duration-150 ${profileOpen ? 'bg-[#5030E5]/8' : 'hover:bg-gray-50'}`}
                        >
                            <div className="relative">
                                <UserAvatar user={user} className="h-8 w-8 rounded-xl ring-2 ring-[#5030E5]/20" />
                                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-[#7AC555] rounded-full ring-2 ring-white" />
                            </div>
                            <div className="text-left hidden md:block">
                                <p className="text-[13px] font-bold text-[#0D062D] leading-tight">{user.name}</p>
                                <p className="text-[11px] text-[#787486] leading-tight">{user.location || user.role}</p>
                            </div>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#787486" strokeWidth="2.5" strokeLinecap="round"
                                className={`hidden md:block transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`}>
                                <path d="M6 9l6 6 6-6" />
                            </svg>
                        </button>

                        {profileOpen && (
                            <div className="absolute right-0 top-full mt-2 w-[232px] bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] border border-[#DBDBDB]/60 overflow-hidden z-50">
                                {/* User card */}
                                <div className="p-4 border-b border-[#DBDBDB]/60 bg-gradient-to-br from-[#5030E5]/5 to-transparent">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <UserAvatar user={user} className="h-10 w-10 rounded-xl ring-2 ring-[#5030E5]/20" />
                                            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-[#7AC555] rounded-full ring-2 ring-white" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[14px] font-bold text-[#0D062D] truncate">{user.name}</p>
                                            <p className="text-[11px] text-[#787486] truncate">{user.email}</p>
                                            <span className="inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#5030E5]/10 text-[#5030E5] capitalize">{user.role}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Menu items */}
                                <div className="py-1.5">
                                    {profileMenuItems.map(item => (
                                        <button
                                            key={item.label}
                                            onClick={() => { setProfileOpen(false); navigate(item.path) }}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-[#787486] hover:bg-[#5030E5]/5 hover:text-[#5030E5] transition-colors text-left"
                                        >
                                            <span className="w-[22px] h-[22px] rounded-md bg-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-[#5030E5]/10">
                                                {item.icon}
                                            </span>
                                            {item.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="h-[1px] bg-[#DBDBDB]/60 mx-3" />

                                {/* Sign out */}
                                <div className="py-1.5">
                                    <button
                                        onClick={handleSignOut}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-[#D8727D] hover:bg-[#D8727D]/5 transition-colors"
                                    >
                                        <span className="w-[22px] h-[22px] rounded-md bg-red-50 flex items-center justify-center flex-shrink-0">
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                                <polyline points="16 17 21 12 16 7" />
                                                <line x1="21" y1="12" x2="9" y2="12" />
                                            </svg>
                                        </span>
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* ── Calendar Modal ── */}
            {calendarOpen && (
                <TaskCalendar
                    projectTasks={projectTasks}
                    projects={projects}
                    onClose={() => setCalendarOpen(false)}
                />
            )}
        </>
    )
}

export default Header
