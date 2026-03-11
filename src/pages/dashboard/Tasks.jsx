import React, { useMemo, useState } from 'react';

const STATUS_CONFIG = {
    todo: { label: 'To Do', color: '#5030E5', bg: '#5030E515' },
    inProgress: { label: 'In Progress', color: '#FFA500', bg: '#FFA50015' },
    completed: { label: 'Completed', color: '#7AC555', bg: '#7AC55515' },
    onHold: { label: 'On Hold', color: '#D87272', bg: '#D8727215' },
};

const PRIORITY_CONFIG = {
    High: { color: '#D87272', bg: '#D8727215' },
    Low: { color: '#7AC555', bg: '#7AC55515' },
    Completed: { color: '#5030E5', bg: '#5030E515' },
    Medium: { color: '#FFA500', bg: '#FFA50015' },
};

const Tasks = ({ projectTasks, projects }) => {
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('default');

    const allTasks = useMemo(() => {
        if (!projectTasks) return [];
        return Object.entries(projectTasks).flatMap(([projectId, tasks]) =>
            tasks.map(t => ({
                ...t,
                projectName: projects?.find(p => String(p.id) === String(projectId))?.name ?? `Project ${projectId}`,
            }))
        );
    }, [projectTasks, projects]);

    const filtered = useMemo(() => {
        let list = allTasks;
        if (statusFilter !== 'all') list = list.filter(t => t.status === statusFilter);
        if (priorityFilter !== 'all') list = list.filter(t => t.priority?.toLowerCase() === priorityFilter);
        if (search) list = list.filter(t => t.title.toLowerCase().includes(search.toLowerCase()) || t.projectName.toLowerCase().includes(search.toLowerCase()));
        if (sortBy === 'priority') list = [...list].sort((a, b) => { const r = { High: 0, Medium: 1, Low: 2, Completed: 3 }; return (r[a.priority] ?? 9) - (r[b.priority] ?? 9); });
        if (sortBy === 'az') list = [...list].sort((a, b) => a.title.localeCompare(b.title));
        if (sortBy === 'project') list = [...list].sort((a, b) => a.projectName.localeCompare(b.projectName));
        return list;
    }, [allTasks, statusFilter, priorityFilter, search, sortBy]);

    const counts = useMemo(() => ({
        all: allTasks.length,
        todo: allTasks.filter(t => t.status === 'todo').length,
        inProgress: allTasks.filter(t => t.status === 'inProgress').length,
        completed: allTasks.filter(t => t.status === 'completed').length,
        onHold: allTasks.filter(t => t.status === 'onHold').length,
    }), [allTasks]);

    return (
        <div className="px-6 md:px-12 py-10 flex flex-col gap-8 bg-[#FCFCFD] min-h-screen">

            {/* ── Header ── */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-wider">All Projects</span>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mt-2">Tasks</h1>
                    <p className="text-slate-500 font-medium mt-1">View and manage all tasks across every project.</p>
                </div>
            </header>

            {/* ── Status pills ── */}
            <div className="flex flex-wrap items-center gap-2">
                {[
                    { key: 'all', label: 'All', count: counts.all },
                    { key: 'todo', label: 'To Do', count: counts.todo },
                    { key: 'inProgress', label: 'In Progress', count: counts.inProgress },
                    { key: 'completed', label: 'Completed', count: counts.completed },
                    { key: 'onHold', label: 'On Hold', count: counts.onHold },
                ].map(({ key, label, count }) => {
                    const cfg = key !== 'all' ? STATUS_CONFIG[key] : null;
                    const active = statusFilter === key;
                    return (
                        <button
                            key={key}
                            onClick={() => setStatusFilter(key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all duration-200 ${active
                                ? 'text-white border-transparent shadow-md'
                                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                                }`}
                            style={active ? { backgroundColor: cfg?.color ?? '#0f172a', borderColor: cfg?.color ?? '#0f172a' } : {}}
                        >
                            {label}
                            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${active ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* ── Search + Sort bar ── */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                    </svg>
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search tasks or projects…"
                        className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-sm font-medium text-slate-700 placeholder:text-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                    />
                </div>
                <select
                    value={priorityFilter}
                    onChange={e => setPriorityFilter(e.target.value)}
                    className="px-4 py-3 rounded-2xl bg-white border border-slate-200 text-sm font-semibold text-slate-600 outline-none focus:border-indigo-400 cursor-pointer"
                >
                    <option value="all">All Priorities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>
                <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="px-4 py-3 rounded-2xl bg-white border border-slate-200 text-sm font-semibold text-slate-600 outline-none focus:border-indigo-400 cursor-pointer"
                >
                    <option value="default">Default Order</option>
                    <option value="az">Title A–Z</option>
                    <option value="priority">Priority</option>
                    <option value="project">Project</option>
                </select>
            </div>

            {/* ── Results count ── */}
            <p className="text-sm text-slate-400 font-medium -mt-4">
                Showing <span className="font-black text-slate-800">{filtered.length}</span> of {allTasks.length} tasks
                {search && <> matching "<span className="text-indigo-600">{search}</span>"</>}
            </p>

            {/* ── Task Table ── */}
            <div className="bg-white rounded-[28px] border border-slate-100 shadow-[0_4px_24px_rgb(0,0,0,0.04)] overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-6 py-4 border-b border-slate-100 bg-slate-50/30">
                    {['Task', 'Project', 'Priority', 'Status', 'Files'].map(h => (
                        <span key={h} className="text-[10px] font-black text-black uppercase tracking-wider">{h}</span>
                    ))}
                </div>

                {/* Rows */}
                <div className="divide-y divide-slate-50">
                    {filtered.map(task => {
                        const sCfg = STATUS_CONFIG[task.status] ?? STATUS_CONFIG.todo;
                        const pCfg = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.Low;
                        return (
                            <div
                                key={task.id}
                                className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-6 py-4 items-center hover:bg-slate-50/10 transition-colors duration-150 group"
                            >
                                {/* Title */}
                                <div className="flex flex-col gap-0.5 min-w-0">
                                    <p className="font-bold text-slate-800 text-sm truncate group-hover:text-indigo-600 transition-colors">{task.title}</p>
                                    <p className="text-xs text-slate-400 font-medium truncate">{task.text}</p>
                                </div>

                                {/* Project */}
                                <div className="min-w-0">
                                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg truncate block w-fit max-w-full">{task.projectName}</span>
                                </div>

                                {/* Priority */}
                                <div>
                                    <span
                                        className="text-[11px] font-black px-2.5 py-1 rounded-lg"
                                        style={{ color: pCfg.color, backgroundColor: pCfg.bg }}
                                    >
                                        {task.priority}
                                    </span>
                                </div>

                                {/* Status */}
                                <div>
                                    <span
                                        className="text-[11px] font-black px-2.5 py-1 rounded-lg"
                                        style={{ color: sCfg.color, backgroundColor: sCfg.bg }}
                                    >
                                        {sCfg.label}
                                    </span>
                                </div>

                                {/* Files */}
                                <div className="flex items-center gap-1 text-slate-400">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                                    <span className="text-xs font-bold">{task.files ?? 0}</span>
                                </div>
                            </div>
                        );
                    })}

                    {filtered.length === 0 && (
                        <div className="py-20 text-center">
                            <svg className="mx-auto mb-4 text-slate-200" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                            <p className="text-slate-400 font-semibold">No tasks found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Tasks;
