import React, { useRef, useState, useCallback, useEffect } from 'react'
import Column from './Column'
import { useAuth } from '../../context/AuthContext'

const COLUMNS = [
    { title: 'To Do', status: 'todo' },
    { title: 'In Progress', status: 'inProgress' },
    { title: 'Completed', status: 'completed' },
    { title: 'On Hold', status: 'onHold' },
]

const PRIORITY_OPTIONS = ['Low', 'High']
const UNDO_SECONDS = 10

// ── Confirmation / Priority Modal ──────────────────────────────────────
const RestoreModal = ({ task, targetStatus, onConfirm, onCancel }) => {
    const needsPriority = !task.priority || task.priority === 'Completed'
    const [priority, setPriority] = useState(needsPriority ? 'Low' : task.priority)
    const targetLabel = COLUMNS.find(c => c.status === targetStatus)?.title ?? targetStatus

    return (
        <div
            className="fixed inset-0 z-[500] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
            onClick={onCancel}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-[400px] p-7 flex flex-col gap-5"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex flex-col items-center gap-3 text-center">
                    <div className="h-14 w-14 rounded-full bg-amber-100 flex items-center justify-center">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                            <line x1="12" y1="9" x2="12" y2="13" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-[18px] font-bold text-[#0D062D]">Move completed task?</h2>
                        <p className="text-[13px] text-[#787486] mt-1 leading-relaxed">
                            <span className="font-semibold text-[#0D062D]">"{task.title}"</span> is marked as completed.
                            Are you sure you want to move it back to <span className="font-semibold text-[#5030E5]">{targetLabel}</span>?
                        </p>
                    </div>
                </div>

                {needsPriority && (
                    <div className="flex flex-col gap-2">
                        <p className="text-[12px] font-bold text-[#787486] uppercase tracking-wide text-center">
                            Set a new priority for this task
                        </p>
                        <div className="flex gap-2 justify-center">
                            {PRIORITY_OPTIONS.map(p => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setPriority(p)}
                                    className={`px-5 py-2 rounded-full text-[13px] font-semibold border-2 transition-all ${priority === p ? 'text-white border-transparent' : 'border-[#DBDBDB] text-[#787486] hover:border-gray-300'}`}
                                    style={priority === p ? { background: p === 'High' ? '#D8727D' : '#D58D49' } : {}}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2.5 rounded-xl border border-[#DBDBDB] text-[14px] font-semibold text-[#787486] hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm(priority)}
                        className="flex-1 py-2.5 rounded-xl bg-[#5030E5] text-white text-[14px] font-semibold hover:bg-[#3d22c4] transition-colors shadow-lg shadow-[#5030E5]/25"
                    >
                        Yes, move it
                    </button>
                </div>
            </div>
        </div>
    )
}

// ── Undo Toast ──────────────────────────────────────────────────────
const UndoToast = ({ task, countdown, onUndo, onDismiss }) => {
    const pct = (countdown / UNDO_SECONDS) * 100
    const circumference = 2 * Math.PI * 10  // r=10

    return (
        <div style={{
            animation: 'slideInRight 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            marginBottom: '10px'
        }}>
            <style>{`
                @keyframes slideInRight {
                    from { transform: translateX(110%); opacity: 0; }
                    to   { transform: translateX(0);    opacity: 1; }
                }
            `}</style>

            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                background: 'rgba(13, 6, 45, 0.94)',
                backdropFilter: 'blur(12px)',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
                minWidth: '280px',
                maxWidth: '340px',
            }}>
                {/* Countdown ring */}
                <div style={{ position: 'relative', flexShrink: 0, width: 36, height: 36 }}>
                    <svg width="36" height="36" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="18" cy="18" r="10" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                        <circle cx="18" cy="18" r="10" fill="none" stroke="#D8727D" strokeWidth="3"
                            strokeDasharray={circumference}
                            strokeDashoffset={circumference * (1 - pct / 100)}
                            strokeLinecap="round"
                            style={{ transition: 'stroke-dashoffset 0.9s linear' }}
                        />
                    </svg>
                    <span style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '11px', fontWeight: 800, color: '#D8727D',
                    }}>
                        {countdown}
                    </span>
                </div>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginBottom: 2 }}>
                        Task deleted
                    </p>
                    <p style={{
                        fontSize: '13px', fontWeight: 700, color: 'white',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                        {task.title}
                    </p>
                </div>

                {/* Undo button */}
                <button
                    onClick={onUndo}
                    style={{
                        flexShrink: 0,
                        padding: '6px 14px',
                        borderRadius: '10px',
                        background: 'rgba(80,48,229,0.25)',
                        border: '1px solid rgba(108,78,245,0.5)',
                        color: '#a78bfa',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(80,48,229,0.45)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(80,48,229,0.25)' }}
                >
                    Undo
                </button>

                {/* Dismiss X */}
                <button
                    onClick={onDismiss}
                    style={{
                        flexShrink: 0,
                        width: 24, height: 24,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.06)',
                        border: 'none',
                        color: 'rgba(255,255,255,0.4)',
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; e.currentTarget.style.color = 'white' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
                >
                    ×
                </button>
            </div>
        </div>
    )
}

// ── Board ──────────────────────────────────────────────────────────
const Board = ({ tasks, onTaskMove, onTaskDelete, onTaskRestore, onTaskAdd, onTaskUpdate }) => {
    const { currentUser } = useAuth()
    const isClient = currentUser?.role === 'client'
    const dragTaskId = useRef(null)
    const dragStatus = useRef(null)
    const [overCol, setOverCol] = useState(null)
    const [isDragging, setIsDragging] = useState(false)
    const [overBin, setOverBin] = useState(false)
    const [restorePending, setRestorePending] = useState(null)

    // Toasts state: array of { id, task, countdown }
    const [toasts, setToasts] = useState([])

    // Countdown logic for all toasts
    useEffect(() => {
        if (toasts.length === 0) return

        const timer = setInterval(() => {
            setToasts(prev => {
                const filtered = prev.map(t => ({ ...t, countdown: t.countdown - 1 }))
                    .filter(t => t.countdown > 0)
                return filtered
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [toasts.length])

    const handleUndo = useCallback((toastId, task) => {
        if (onTaskRestore) onTaskRestore(task)
        setToasts(prev => prev.filter(t => t.id !== toastId))
    }, [onTaskRestore])

    const dismissToast = useCallback((toastId) => {
        setToasts(prev => prev.filter(t => t.id !== toastId))
    }, [])

    const handleDragStart = useCallback((taskId, taskStatus) => {
        dragTaskId.current = taskId
        dragStatus.current = taskStatus
        setIsDragging(true)
    }, [])

    const handleDragEnd = useCallback(() => {
        dragTaskId.current = null
        dragStatus.current = null
        setIsDragging(false)
        setOverCol(null)
        setOverBin(false)
    }, [])

    const handleDrop = useCallback((targetStatus) => {
        const id = dragTaskId.current
        const from = dragStatus.current
        dragTaskId.current = null
        dragStatus.current = null
        setOverCol(null)

        if (!id || targetStatus === from) return

        if (from === 'completed' && targetStatus !== 'completed') {
            const task = tasks.find(t => t.id === id)
            if (task) {
                setRestorePending({ taskId: id, task, targetStatus })
                setIsDragging(false)
                return
            }
        }

        onTaskMove(id, targetStatus)
        setIsDragging(false)
    }, [onTaskMove, tasks])

    const handleRestoreConfirm = useCallback((newPriority) => {
        if (!restorePending) return
        const { taskId, task, targetStatus } = restorePending
        onTaskMove(taskId, targetStatus)
        const shouldUpdatePriority = !task.priority || task.priority === 'Completed'
        if (shouldUpdatePriority && onTaskUpdate) {
            setTimeout(() => onTaskUpdate(taskId, { priority: newPriority }), 0)
        }
        setRestorePending(null)
    }, [restorePending, onTaskMove, onTaskUpdate])

    // ── Delete Bin handlers ──────────────────────────────────────────
    const handleBinDragOver = useCallback((e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        setOverBin(true)
    }, [])

    const handleBinDragLeave = useCallback((e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setOverBin(false)
        }
    }, [])

    const handleBinDrop = useCallback((e) => {
        e.preventDefault()
        const idStr = e.dataTransfer.getData('text/plain')
        if (idStr) {
            const taskId = Number(idStr)
            const deletedTask = tasks.find(t => t.id === taskId)
            if (deletedTask && onTaskDelete) {
                onTaskDelete(taskId)
                setToasts(prev => [
                    { id: Date.now(), task: deletedTask, countdown: UNDO_SECONDS },
                    ...prev
                ])
            }
        }
        dragTaskId.current = null
        dragStatus.current = null
        setOverBin(false)
        setIsDragging(false)
    }, [onTaskDelete, tasks])

    return (
        <div className="relative">
            <div className="grid grid-cols-4 gap-6 items-start">
                {COLUMNS.map(col => (
                    <Column
                        key={col.status}
                        title={col.title}
                        status={col.status}
                        tasks={tasks.filter(t => t.status === col.status)}
                        isOver={overCol === col.status}
                        isClient={isClient}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onDragOver={() => !overBin && setOverCol(col.status)}
                        onDragLeave={() => setOverCol(prev => prev === col.status ? null : prev)}
                        onDrop={() => !overBin && handleDrop(col.status)}
                        onTaskAdd={(taskData) => onTaskAdd && onTaskAdd(col.status, taskData)}
                        onTaskUpdate={onTaskUpdate}
                        allTasks={tasks}
                    />
                ))}
            </div>

            {/* ── Toasts Container (Right side, stacks above the theme toggle) ── */}
            <div style={{
                position: 'fixed',
                bottom: '6.5rem',
                right: '1.5rem',
                display: 'flex',
                flexDirection: 'column-reverse',
                zIndex: 2000,
                pointerEvents: 'none'
            }}>
                <div style={{ pointerEvents: 'auto' }}>
                    {toasts.map(toast => (
                        <UndoToast
                            key={toast.id}
                            task={toast.task}
                            countdown={toast.countdown}
                            onUndo={() => handleUndo(toast.id, toast.task)}
                            onDismiss={() => dismissToast(toast.id)}
                        />
                    ))}
                </div>
            </div>

            {/* ── Restore Confirmation Modal ── */}
            {restorePending && (
                <RestoreModal
                    task={restorePending.task}
                    targetStatus={restorePending.targetStatus}
                    onConfirm={handleRestoreConfirm}
                    onCancel={() => setRestorePending(null)}
                />
            )}

            {/* ── Delete Bin (hidden for clients) ── */}
            {!isClient && <div
                style={{
                    position: 'fixed',
                    bottom: '2rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 1000,
                    opacity: isDragging ? 1 : 0,
                    visibility: isDragging ? 'visible' : 'hidden',
                    transition: 'opacity 0.25s ease, visibility 0.25s ease',
                }}
                onDragOver={handleBinDragOver}
                onDragLeave={handleBinDragLeave}
                onDrop={handleBinDrop}
            >
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '16px 32px',
                    borderRadius: '16px',
                    border: `2px solid ${overBin ? '#ef4444' : 'rgba(248,113,113,0.5)'}`,
                    background: overBin ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.92)',
                    backdropFilter: 'blur(8px)',
                    boxShadow: overBin ? '0 0 40px rgba(239,68,68,0.5)' : '0 8px 32px rgba(239,68,68,0.18)',
                    transform: overBin ? 'scale(1.08)' : 'scale(1)',
                    transition: 'all 0.2s ease',
                }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                        stroke={overBin ? '#ef4444' : '#f87171'}
                        strokeWidth="2" strokeLinecap="round"
                        style={{ transition: 'all 0.2s ease', transform: overBin ? 'scale(1.2)' : 'scale(1)' }}
                    >
                        <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
                    </svg>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: overBin ? '#ef4444' : '#f87171', transition: 'color 0.2s ease', userSelect: 'none' }}>
                        {overBin ? 'Release to delete' : 'Drop to delete'}
                    </span>
                </div>
            </div>}
        </div>
    )
}

export default Board