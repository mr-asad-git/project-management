import React, { useMemo, useState } from 'react';


// ── Simple pure-SVG bar chart (no external libs) ─────────────────────────────
const BarChart = ({ data }) => {
    const W = 600, H = 220, PAD = { top: 20, right: 20, bottom: 40, left: 40 };
    const innerW = W - PAD.left - PAD.right;
    const innerH = H - PAD.top - PAD.bottom;
    const maxVal = Math.max(...data.map(d => d.value), 1);
    const barW = Math.floor(innerW / data.length) - 14;

    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            {/* Y-axis grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
                const y = PAD.top + innerH - pct * innerH;
                return (
                    <g key={pct}>
                        <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="#f1f5f9" strokeWidth="1" />
                        <text x={PAD.left - 6} y={y + 4} fontSize="10" fill="#94a3b8" textAnchor="end">
                            {Math.round(pct * maxVal)}
                        </text>
                    </g>
                );
            })}
            {/* Bars */}
            {data.map((d, i) => {
                const barH = (d.value / maxVal) * innerH;
                const x = PAD.left + i * (innerW / data.length) + 6;
                const y = PAD.top + innerH - barH;
                return (
                    <g key={d.label}>
                        {/* Shadow bar */}
                        <rect x={x + 2} y={y + 4} width={barW} height={barH} rx="8" fill={d.color} opacity="0.12" />
                        {/* Real bar */}
                        <rect x={x} y={y} width={barW} height={barH} rx="8" fill={d.color} opacity="0.85" />
                        {/* Value label */}
                        {d.value > 0 && (
                            <text x={x + barW / 2} y={y - 6} fontSize="11" fill={d.color} textAnchor="middle" fontWeight="700">
                                {d.value}
                            </text>
                        )}
                        {/* X-axis label */}
                        <text x={x + barW / 2} y={H - 10} fontSize="10" fill="#64748b" textAnchor="middle">
                            {d.label}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
};

// ── Donut chart ──────────────────────────────────────────────────────────────
const DonutChart = ({ segments, size = 120 }) => {
    const r = 44, cx = size / 2, cy = size / 2, strokeW = 14;
    const circumference = 2 * Math.PI * r;
    let offset = 0;
    const actualTotal = segments.reduce((s, seg) => s + seg.value, 0);
    const mathTotal = actualTotal || 1;

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={strokeW} />
            {segments.map((seg, i) => {
                const dash = (seg.value / mathTotal) * circumference;
                const el = (
                    <circle
                        key={i}
                        cx={cx} cy={cy} r={r}
                        fill="none"
                        stroke={seg.color}
                        strokeWidth={strokeW}
                        strokeDasharray={`${dash} ${circumference - dash}`}
                        strokeDashoffset={-offset}
                        strokeLinecap="round"
                        transform={`rotate(-90 ${cx} ${cy})`}
                        style={{ transition: 'stroke-dasharray 0.6s ease' }}
                    />
                );
                offset += dash;
                return el;
            })}
            <text x={cx} y={cy + 5} textAnchor="middle" fontSize="16" fontWeight="800" fill="currentColor" className="text-[#0D062D]">
                {actualTotal}
            </text>
            <text x={cx} y={cy + 18} textAnchor="middle" fontSize="8" fill="#94a3b8" fontWeight="600" letterSpacing="1">
                TOTAL
            </text>
        </svg>
    );
};

// ── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ title, count, colorVar, percentage, icon }) => (
    <div className="group p-7 rounded-[28px] bg-white border border-slate-100 shadow-[0_4px_24px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgb(0,0,0,0.06)] transition-all duration-500 flex flex-col gap-5 relative overflow-hidden">
        <div
            className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full opacity-[0.1] transition-transform duration-700 group-hover:scale-150"
            style={{ backgroundColor: `var(${colorVar})` }}
        />
        <div className="flex justify-between items-start z-10">
            <div
                className="p-3.5 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:rotate-12"
                style={{ backgroundColor: `var(${colorVar})20` }}
            >
                <div style={{ color: `var(${colorVar})` }}>{icon}</div>
            </div>
            <div className="flex flex-col items-end">
                <span className="text-4xl font-black text-slate-900 tracking-tight">{count}</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Tasks</span>
            </div>
        </div>
        <div className="z-10">
            <h3 className="text-base font-bold text-slate-800">{title}</h3>
            <div className="flex items-center gap-2 mt-2.5">
                <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${percentage}%`, backgroundColor: `var(${colorVar})` }}
                    />
                </div>
                <span className="text-xs font-bold text-slate-400">{percentage}%</span>
            </div>
        </div>
    </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const Home = ({ projectTasks, projects }) => {
    const [chartView, setChartView] = useState('status'); // 'status' | 'project'

    const allTasks = useMemo(() => {
        if (!projectTasks) return [];
        return Object.values(projectTasks).flat();
    }, [projectTasks]);

    const total = allTasks.length;

    const stats = useMemo(() => ({
        todo: { count: allTasks.filter(t => t.status === 'todo').length },
        inProgress: { count: allTasks.filter(t => t.status === 'inProgress').length },
        completed: { count: allTasks.filter(t => t.status === 'completed').length },
        onHold: { count: allTasks.filter(t => t.status === 'onHold').length },
    }), [allTasks]);

    const pct = (n) => total === 0 ? 0 : Math.round((n / total) * 100);

    // Bar-chart data
    const statusBars = [
        { label: 'To Do', value: stats.todo.count, color: '#5030E5' },
        { label: 'In Progress', value: stats.inProgress.count, color: '#FFA500' },
        { label: 'Completed', value: stats.completed.count, color: '#7AC555' },
        { label: 'On Hold', value: stats.onHold.count, color: '#D87272' },
    ];

    const projectBars = (projects || []).map((p, i) => ({
        label: p.name.length > 8 ? p.name.slice(0, 8) + '…' : p.name,
        value: (projectTasks?.[p.id] ?? []).length,
        color: ['#5030E5', '#FFA500', '#7AC555', '#D87272', '#60a5fa'][i % 5],
    }));

    const donutSegments = [
        { color: '#5030E5', value: stats.todo.count },
        { color: '#FFA500', value: stats.inProgress.count },
        { color: '#7AC555', value: stats.completed.count },
        { color: '#D87272', value: stats.onHold.count },
    ];

    const chartData = chartView === 'status' ? statusBars : projectBars;

    const cardIcons = {
        todo: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 12l2 2 4-4" /></svg>,
        inProgress: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
        completed: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>,
        onHold: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="8" y1="12" x2="16" y2="12" /></svg>,
    };

    return (
        <div className="px-6 md:px-12 py-10 flex flex-col gap-10 bg-[#FCFCFD] min-h-screen">

            {/* ── Header ── */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex flex-col gap-2">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-wider w-fit">
                        Workspace Overview
                    </span>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Dashboard</h1>
                    <p className="text-slate-500 font-medium">Welcome back! Here's what's happening across all your projects today.</p>
                </div>
                <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                    <div className="px-4 py-2 bg-slate-50 rounded-xl">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Total Tasks</span>
                        <span className="text-xl font-black text-slate-900">{allTasks.length}</span>
                    </div>
                    <div className="h-10 w-px bg-slate-100" />
                    <div className="px-4 py-2 bg-slate-50 rounded-xl">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Projects</span>
                        <span className="text-xl font-black text-slate-900">{(projects || []).length}</span>
                    </div>
                </div>
            </header>

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatCard title="To Do" count={stats.todo.count} colorVar="--card-todo" percentage={pct(stats.todo.count)} icon={cardIcons.todo} />
                <StatCard title="In Progress" count={stats.inProgress.count} colorVar="--card-inprogress" percentage={pct(stats.inProgress.count)} icon={cardIcons.inProgress} />
                <StatCard title="Completed" count={stats.completed.count} colorVar="--card-completed" percentage={pct(stats.completed.count)} icon={cardIcons.completed} />
                <StatCard title="On Hold" count={stats.onHold.count} colorVar="--card-onhold" percentage={pct(stats.onHold.count)} icon={cardIcons.onHold} />
            </div>

            {/* ── Charts section ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Bar Chart */}
                <div className="lg:col-span-2 bg-white rounded-[28px] border border-slate-100 shadow-[0_4px_24px_rgb(0,0,0,0.04)] p-8 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-black text-slate-900">Task Analytics</h3>
                            <p className="text-sm text-slate-400 font-medium mt-0.5">Breakdown across all projects</p>
                        </div>
                        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                            {['status', 'project'].map(v => (
                                <button
                                    key={v}
                                    onClick={() => setChartView(v)}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all duration-200 ${chartView === v ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    {v === 'status' ? 'By Status' : 'By Project'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="h-56">
                        {chartData.every(d => d.value === 0)
                            ? <div className="h-full flex items-center justify-center text-slate-300 text-sm font-semibold">No task data yet</div>
                            : <BarChart data={chartData} />
                        }
                    </div>
                    {/* Legend */}
                    <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-50">
                        {chartData.map(d => (
                            <div key={d.label} className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                                <span className="text-xs text-slate-500 font-medium">{d.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Donut + distribution */}
                <div className="bg-white rounded-[28px] border border-slate-100 shadow-[0_4px_24px_rgb(0,0,0,0.04)] p-8 flex flex-col gap-6">
                    <div>
                        <h3 className="text-lg font-black text-slate-900">Distribution</h3>
                        <p className="text-sm text-slate-400 font-medium mt-0.5">Task status breakdown</p>
                    </div>
                    <div className="flex justify-center">
                        <DonutChart segments={donutSegments} size={140} />
                    </div>
                    <div className="flex flex-col gap-3">
                        {[
                            { label: 'To Do', val: stats.todo.count, color: '#5030E5', cvar: '--card-todo' },
                            { label: 'In Progress', val: stats.inProgress.count, color: '#FFA500', cvar: '--card-inprogress' },
                            { label: 'Completed', val: stats.completed.count, color: '#7AC555', cvar: '--card-completed' },
                            { label: 'On Hold', val: stats.onHold.count, color: '#D87272', cvar: '--card-onhold' },
                        ].map(item => (
                            <div key={item.label} className="flex items-center gap-3">
                                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                                <span className="text-sm text-slate-600 font-medium flex-1">{item.label}</span>
                                <span className="text-sm font-black text-[#0D062D]">{item.val}</span>
                                <span className="text-xs text-slate-400 w-9 text-right">{pct(item.val)}%</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Home;
