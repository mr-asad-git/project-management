import React, { useMemo } from 'react';

const Home = ({ projectTasks }) => {
    // Flatten all tasks from all projects into a single array
    const allTasks = useMemo(() => {
        if (!projectTasks) return [];
        return Object.values(projectTasks).flat();
    }, [projectTasks]);

    // Calculate counts concisely
    const stats = useMemo(() => ({
        todo: allTasks.filter(t => t.status === 'todo').length,
        inProgress: allTasks.filter(t => t.status === 'inProgress').length,
        completed: allTasks.filter(t => t.status === 'completed').length,
        onHold: allTasks.filter(t => t.status === 'onHold').length
    }), [allTasks]);

    const StatCard = ({ title, count, colorVar, icon }) => (
        <div className="group p-8 rounded-[32px] bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.04)] transition-all duration-500 flex flex-col gap-6 relative overflow-hidden">
            {/* Background Accent */}
            <div
                className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full opacity-[0.1] transition-transform duration-700 group-hover:scale-150"
                style={{ backgroundColor: `var(${colorVar})` }}
            />

            <div className="flex justify-between items-start z-10">
                <div
                    className="p-4 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:rotate-12"
                    style={{ backgroundColor: `rgba(from var(${colorVar}) r g b / 0.1)` }}
                >
                    <div style={{ color: `var(${colorVar})` }}>
                        {icon}
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-4xl font-bold text-slate-900 tracking-tight">{count}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total Items</span>
                </div>
            </div>

            <div className="z-10 mt-auto">
                <h3 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h3>
                <div className="flex items-center gap-2 mt-2">
                    <div className="h-1.5 flex-1 bg-slate-50 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-1000 ease-out"
                            style={{
                                width: allTasks.length > 0 ? `${(count / allTasks.length) * 100}%` : '0%',
                                backgroundColor: `var(${colorVar})`
                            }}
                        />
                    </div>
                    <span className="text-xs font-bold text-slate-400">
                        {allTasks.length > 0 ? Math.round((count / allTasks.length) * 100) : 0}%
                    </span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="px-6 md:px-12 py-10 flex flex-col gap-12 bg-[#FCFCFD] min-h-screen">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-wider">Workspace Overview</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Dashboard</h1>
                    <p className="text-slate-500 font-medium max-w-md">Welcome back! Here's what's happening across all your projects today.</p>
                </div>

                <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                    <div className="px-4 py-2 bg-slate-50 rounded-xl">
                        <span className="text-xs font-bold text-slate-400 uppercase block">Active Tasks</span>
                        <span className="text-lg font-black text-slate-900">{allTasks.length}</span>
                    </div>
                    <div className="h-10 w-[1px] bg-slate-100" />
                    <button className="px-6 py-2 bg-[#5030E5] text-white rounded-xl font-bold text-sm hover:bg-[#3d22c4] transition-all shadow-lg shadow-indigo-200">
                        Create Task
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                <StatCard
                    title="To Do"
                    count={stats.todo}
                    colorVar="--card-todo"
                    icon={
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <path d="M9 12l2 2 4-4" />
                        </svg>
                    }
                />
                <StatCard
                    title="In Progress"
                    count={stats.inProgress}
                    colorVar="--card-inprogress"
                    icon={
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                    }
                />
                <StatCard
                    title="Completed"
                    count={stats.completed}
                    colorVar="--card-completed"
                    icon={
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                    }
                />
                <StatCard
                    title="On Hold"
                    count={stats.onHold}
                    colorVar="--card-onhold"
                    icon={
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="8" y1="12" x2="16" y2="12" />
                        </svg>
                    }
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-10 rounded-[32px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] min-h-[400px] flex flex-col justify-center items-center text-center gap-6 group">
                    <div className="w-24 h-24 bg-indigo-50 rounded-[32px] flex items-center justify-center transition-transform duration-700 group-hover:scale-110 group-hover:rotate-3">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#5030E5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-80">
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                        </svg>
                    </div>
                    <div className="max-w-xs flex flex-col gap-2">
                        <h3 className="text-2xl font-black text-slate-800">Activity Analytics</h3>
                        <p className="text-slate-400 font-medium">We're preparing your productivity charts. Check back soon for deep insights!</p>
                    </div>
                </div>

                <div className="bg-[#5030E5] p-10 rounded-[32px] shadow-2xl shadow-indigo-200 flex flex-col gap-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 -mr-32 -mt-32 rounded-full blur-3xl" />
                    <div className="z-10">
                        <h3 className="text-2xl font-black mb-2">Team Sync</h3>
                        <p className="text-indigo-100/80 font-medium text-sm leading-relaxed">Collaborate in real-time with your team members across all current projects.</p>
                    </div>
                    <div className="flex -space-x-3 z-10">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-12 w-12 rounded-2xl border-4 border-indigo-600 bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-xs">
                                U{i}
                            </div>
                        ))}
                        <div className="h-12 w-12 rounded-2xl border-4 border-indigo-600 bg-indigo-400 flex items-center justify-center font-bold text-xs">
                            +5
                        </div>
                    </div>
                    <button className="mt-auto py-4 bg-white text-[#5030E5] rounded-2xl font-black text-sm hover:bg-white/90 transition-all z-10 w-full">
                        View Team Members
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Home;
