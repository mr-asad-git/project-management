import React, { useMemo, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import UserAvatar from '../../components/ui/UserAvatar';

const COLORS = ['#5030E5', '#FFA500', '#7AC555', '#D87272', '#60a5fa'];

const Members = ({ projectTasks, groups = [], projects = [] }) => {
    const { users } = useAuth();
    const location = useLocation();
    const [search, setSearch] = useState('');
    const [selectedMember, setSelectedMember] = useState(null);

    // Auto-select member when navigating from search
    useEffect(() => {
        if (location.state?.memberId) {
            setSelectedMember(location.state.memberId);
        }
    }, [location.state]);

    const allTasks = useMemo(() => {
        if (!projectTasks) return [];
        return Object.values(projectTasks).flat();
    }, [projectTasks]);

    // Enrich each user with real group/project data — exclude admins
    const members = useMemo(() => users.filter(u => u.role !== 'admin').map((u, i) => {
        const userGroups = groups.filter(g => g.memberIds.includes(u.id));
        const projectIds = [...new Set(userGroups.flatMap(g => g.projectIds))];
        const userProjects = projects.filter(p => projectIds.includes(p.id)).map(p => p.name);
        // Real tasks: only tasks from the projects this user is assigned to via groups
        const assignedTasks = Object.entries(projectTasks || {})
            .filter(([projectId]) => projectIds.includes(Number(projectId)))
            .flatMap(([, tasks]) => tasks);
        return {
            ...u,
            color: COLORS[i % COLORS.length],
            initials: u.name.split(' ').map(n => n[0]).join('').toUpperCase(),
            assignedTasks,
            projects: userProjects,
        };
    }), [users, groups, projects, projectTasks]);

    const filtered = members.filter(m =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.role.toLowerCase().includes(search.toLowerCase())
    );

    const detail = selectedMember ? members.find(m => m.id === selectedMember) : null;

    return (
        <div className="px-6 md:px-12 py-10 flex flex-col gap-10 bg-[#FCFCFD] min-h-screen">

            {/* ── Header ── */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-wider">Team</span>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mt-2">Members</h1>
                    <p className="text-slate-500 font-medium mt-1">Manage your team and track individual contributions.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                        </svg>
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search members…"
                            className="pl-9 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm font-medium text-slate-700 placeholder:text-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all w-56"
                        />
                    </div>
                    <div className="px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600">
                        {filtered.length} <span className="font-medium text-slate-400">member{filtered.length !== 1 ? 's' : ''}</span>
                    </div>
                </div>
            </header>

            <div className="flex gap-8">
                {/* ── Member Grid ── */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 h-fit">
                    {filtered.map(member => {
                        const done = member.assignedTasks.filter(t => t.status === 'completed').length;
                        const total = member.assignedTasks.length || 1;
                        const pct = Math.round((done / total) * 100);
                        const isSelected = selectedMember === member.id;

                        return (
                            <div
                                key={member.id}
                                onClick={() => setSelectedMember(isSelected ? null : member.id)}
                                className={`group cursor-pointer bg-white rounded-[28px] border-2 transition-all duration-300 p-7 flex flex-col gap-5 relative overflow-hidden ${isSelected ? 'border-indigo-400 shadow-lg shadow-indigo-100' : 'border-slate-100 hover:border-indigo-200 hover:shadow-md'}`}
                            >
                                {/* BG ring */}
                                <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full opacity-10 transition-transform duration-500 group-hover:scale-150" style={{ backgroundColor: member.color }} />

                                <div className="flex items-center gap-4 z-10">
                                    <div className="relative">
                                        <UserAvatar
                                            user={member}
                                            className="w-14 h-14 rounded-2xl border-white shadow-md"
                                            style={{ backgroundColor: member.color, color: 'white' }}
                                        />
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-900 text-base leading-tight">{member.name}</p>
                                        <p className="text-xs font-semibold mt-0.5" style={{ color: member.color }}>
                                            {member.role === 'client'
                                                ? (member.customId || 'Client')
                                                : member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                                        </p>
                                        <p className="text-xs text-slate-400 font-medium mt-0.5">{member.location}</p>
                                    </div>
                                </div>

                                <div className="z-10 flex flex-col gap-2">
                                    <div className="flex justify-between text-xs font-semibold text-slate-500">
                                        <span>Task completion</span>
                                        <span className="font-black text-slate-800">{pct}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: member.color }} />
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-400 font-medium">
                                        <span>{done} completed</span>
                                        <span>{member.assignedTasks.length} total</span>
                                    </div>
                                </div>

                                <div className="z-10 flex gap-2 flex-wrap">
                                    {member.projects.slice(0, 2).map(p => (
                                        <span key={p} className="px-2.5 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-bold border border-slate-100">
                                            {p}
                                        </span>
                                    ))}
                                    {member.projects.length > 2 && (
                                        <span className="px-2.5 py-1 bg-slate-50 text-slate-400 rounded-lg text-[10px] font-bold border border-slate-100">
                                            +{member.projects.length - 2}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {filtered.length === 0 && (
                        <div className="col-span-full text-center py-20 text-slate-300 font-semibold text-lg">
                            No members match "{search}"
                        </div>
                    )}
                </div>

                {/* ── Detail Panel ── */}
                {detail && (
                    <aside className="w-80 flex-shrink-0 bg-white rounded-[28px] border border-slate-100 shadow-[0_4px_24px_rgb(0,0,0,0.05)] p-8 flex flex-col gap-6 h-fit sticky top-8">
                        <div className="flex items-start justify-between">
                            <div className="flex gap-3 items-center">
                                <UserAvatar
                                    user={detail}
                                    className="w-14 h-14 rounded-2xl shadow-md text-lg flex items-center justify-center"
                                    style={{ backgroundColor: detail.color, color: 'white' }}
                                />
                                <div>
                                    <p className="font-black text-slate-900">{detail.name}</p>
                                    <p className="text-xs font-semibold mt-0.5" style={{ color: detail.color }}>
                                        {detail.role === 'client'
                                            ? (detail.customId || 'Client')
                                            : detail.role.charAt(0).toUpperCase() + detail.role.slice(1)}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedMember(null)} className="text-slate-400 hover:text-slate-700 transition-colors p-1">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: 'Assigned', val: detail.assignedTasks.length },
                                { label: 'Completed', val: detail.assignedTasks.filter(t => t.status === 'completed').length },
                                { label: 'In Progress', val: detail.assignedTasks.filter(t => t.status === 'inProgress').length },
                                { label: 'To Do', val: detail.assignedTasks.filter(t => t.status === 'todo').length },
                            ].map(stat => (
                                <div key={stat.label} className="bg-slate-50 rounded-2xl p-4 flex flex-col gap-1">
                                    <span className="text-2xl font-black text-slate-900">{stat.val}</span>
                                    <span className="text-xs font-semibold text-slate-400">{stat.label}</span>
                                </div>
                            ))}
                        </div>

                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Projects</h4>
                            <div className="flex flex-col gap-2">
                                {detail.projects.map(p => (
                                    <div key={p} className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 rounded-xl">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: detail.color }} />
                                        <span className="text-sm font-semibold text-slate-600">{p}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Recent Tasks</h4>
                            <div className="flex flex-col gap-2">
                                {detail.assignedTasks.slice(0, 4).map(t => (
                                    <div key={t.id} className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${t.status === 'completed' ? 'bg-green-400' : t.status === 'inProgress' ? 'bg-orange-400' : 'bg-indigo-400'}`} />
                                        <span className="text-xs text-slate-600 font-medium truncate">{t.title}</span>
                                    </div>
                                ))}
                                {detail.assignedTasks.length === 0 && <p className="text-xs text-slate-400">No tasks assigned</p>}
                            </div>
                        </div>
                    </aside>
                )}
            </div>
        </div>
    );
};

export default Members;
