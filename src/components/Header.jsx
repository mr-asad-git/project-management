import React, { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import users from '../mui/users'

const NAV_LABELS = {
    '/': 'Home',
    '/messages': 'Messages',
    '/tasks': 'Tasks',
    '/members': 'Members',
    '/settings': 'Settings',
}

const QUICK_ACTIONS = [
    {
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
        ), label: 'Calendar', badge: null
    },
    {
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
        ), label: 'Messages', badge: 3
    },
    {
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
        ), label: 'Notifications', badge: 7
    },
]

const Header = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const [search, setSearch] = useState('')
    const [searchFocused, setSearchFocused] = useState(false)
    const [profileOpen, setProfileOpen] = useState(false)
    const profileRef = useRef(null)

    const currentUser = users[0]

    // Determine current page label (handles /project/:id)
    const pageLabel = NAV_LABELS[location.pathname]
        ?? (location.pathname.startsWith('/project') ? 'Project Board' : '')

    useEffect(() => {
        const handler = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setProfileOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    return (
        <header className='h-20 sticky top-0 bg-white/90 backdrop-blur-md z-30 w-full border-b border-[#DBDBDB]/60 flex items-center justify-between px-8 gap-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]'>

            {/* ── Left: Page Label + Breadcrumb ── */}
            <div className="flex items-center gap-3 min-w-[160px]">
                <div className="h-8 w-8 rounded-lg bg-[#5030E5]/10 flex items-center justify-center flex-shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5030E5" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                </div>
                <div>
                    <p className="text-[11px] font-medium text-[#787486] leading-none mb-0.5 uppercase tracking-wide">
                        Project M.
                    </p>
                    <h2 className="text-[15px] font-bold text-[#0D062D] leading-none">
                        {pageLabel || 'Dashboard'}
                    </h2>
                </div>
            </div>

            {/* ── Centre: Search Bar ── */}
            <div className={`flex-1 max-w-[440px] relative transition-all duration-200`}>
                <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border-2 bg-white transition-all duration-200 ${searchFocused
                    ? 'border-[#5030E5] shadow-[0_0_0_4px_rgba(80,48,229,0.08)]'
                    : 'border-[#DBDBDB]/70 hover:border-[#DBDBDB]'
                    }`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={searchFocused ? '#5030E5' : '#787486'} strokeWidth="2.5" strokeLinecap="round" className="flex-shrink-0 transition-colors">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                        placeholder="Search tasks, projects, members…"
                        className='bg-transparent outline-none text-[14px] text-[#0D062D] placeholder:text-[#787486]/70 w-full font-medium'
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="text-[#787486] hover:text-[#0D062D] transition-colors flex-shrink-0">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    )}
                    {/* Keyboard shortcut hint */}
                    {!searchFocused && !search && (
                        <kbd className="hidden sm:flex items-center gap-0.5 text-[10px] font-medium text-[#787486]/60 bg-[#f3f4f6] border border-[#DBDBDB] rounded px-1.5 py-0.5 flex-shrink-0">
                            ⌘K
                        </kbd>
                    )}
                </div>
            </div>

            {/* ── Right: Action Icons + Profile ── */}
            <div className="flex items-center gap-1.5">

                {/* Quick action icon buttons */}
                {QUICK_ACTIONS.map((action) => (
                    <button
                        key={action.label}
                        title={action.label}
                        className="relative h-9 w-9 rounded-xl flex items-center justify-center text-[#787486] hover:text-[#0D062D] hover:bg-[#5030E5]/8 transition-all duration-150 group"
                    >
                        {action.icon}
                        {/* Notification badge */}
                        {action.badge && (
                            <span className="absolute top-1 right-1 h-[16px] min-w-[16px] px-0.5 bg-[#D8727D] rounded-full text-[9px] font-bold text-white flex items-center justify-center leading-none ring-2 ring-white">
                                {action.badge > 9 ? '9+' : action.badge}
                            </span>
                        )}
                    </button>
                ))}

                {/* Divider */}
                <div className="h-6 w-[1px] bg-[#DBDBDB] mx-2" />

                {/* Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                    <button
                        onClick={() => setProfileOpen(!profileOpen)}
                        className={`flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-xl transition-all duration-150 group ${profileOpen ? 'bg-[#5030E5]/8' : 'hover:bg-gray-50'}`}
                    >
                        <div className="relative">
                            <img
                                src={currentUser.image}
                                alt={currentUser.name}
                                className="h-8 w-8 rounded-xl object-cover ring-2 ring-[#5030E5]/20"
                            />
                            {/* Online indicator */}
                            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-[#7AC555] rounded-full ring-2 ring-white" />
                        </div>
                        <div className="text-left hidden md:block">
                            <p className="text-[13px] font-bold text-[#0D062D] leading-tight">{currentUser.name}</p>
                            <p className="text-[11px] text-[#787486] leading-tight">{currentUser.location}</p>
                        </div>
                        <svg
                            width="12" height="12" viewBox="0 0 24 24" fill="none"
                            stroke="#787486" strokeWidth="2.5" strokeLinecap="round"
                            className={`hidden md:block transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`}
                        >
                            <path d="M6 9l6 6 6-6" />
                        </svg>
                    </button>

                    {/* Profile dropdown menu */}
                    {profileOpen && (
                        <div className="absolute right-0 top-full mt-2 w-[220px] bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] border border-[#DBDBDB]/60 overflow-hidden z-50">
                            {/* User info card */}
                            <div className="p-4 border-b border-[#DBDBDB]/60 bg-gradient-to-br from-[#5030E5]/5 to-transparent">
                                <div className="flex items-center gap-3">
                                    <img src={currentUser.image} alt={currentUser.name} className="h-10 w-10 rounded-xl object-cover ring-2 ring-[#5030E5]/20" />
                                    <div>
                                        <p className="text-[14px] font-bold text-[#0D062D]">{currentUser.name}</p>
                                        <p className="text-[12px] text-[#787486]">{currentUser.location}</p>
                                    </div>
                                </div>
                            </div>
                            {/* Menu items */}
                            {[
                                { icon: '👤', label: 'View Profile', path: '/settings' },
                                { icon: '⚙️', label: 'Settings', path: '/settings' },
                                { icon: '📊', label: 'My Tasks', path: '/tasks' },
                            ].map(item => (
                                <button
                                    key={item.label}
                                    onClick={() => { setProfileOpen(false); navigate(item.path); }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-[#787486] hover:bg-[#5030E5]/5 hover:text-[#5030E5] transition-colors text-left"
                                >
                                    <span className="text-[15px]">{item.icon}</span>
                                    {item.label}
                                </button>
                            ))}
                            <div className="h-[1px] bg-[#DBDBDB]/60 mx-3" />
                            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-[#D8727D] hover:bg-[#D8727D]/5 transition-colors">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                    <polyline points="16 17 21 12 16 7" />
                                    <line x1="21" y1="12" x2="9" y2="12" />
                                </svg>
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}

export default Header