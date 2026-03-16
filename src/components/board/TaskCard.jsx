import React, { useState } from 'react'
import users from '../../data/users'
import UserAvatar from '../ui/UserAvatar'
import message from '/message.svg'
import file from '/File.svg'

const STATUS_LABELS = {
    todo: 'To Do',
    inProgress: 'In Progress',
    completed: 'Completed',
    onHold: 'On Hold'
}

const TaskCard = ({ task, isClient, onDragStart, onDragEnd, onEdit }) => {
    const [isDragging, setIsDragging] = useState(false)
    const [imgError, setImgError] = useState(false)
    const [showLogInfo, setShowLogInfo] = useState(false)

    return (
        <>
            <div
                draggable={!isClient}
                onDragStart={(e) => {
                    if (isClient) { e.preventDefault(); return; }
                    setIsDragging(true)
                    e.dataTransfer.effectAllowed = 'move'
                    e.dataTransfer.setData('text/plain', String(task.id))
                    onDragStart()
                }}
                onDragEnd={() => {
                    setIsDragging(false)
                    if (onDragEnd) onDragEnd()
                }}
                className={`
                bg-white rounded-xl shadow-sm ${!isClient ? 'cursor-grab active:cursor-grabbing' : ''}
                select-none group/card overflow-hidden
                transition-all duration-200
                ${isDragging
                        ? 'opacity-40 scale-95 rotate-1 shadow-lg ring-2 ring-[#5030E5]/20'
                        : 'opacity-100 hover:shadow-md hover:-translate-y-0.5'
                    }
            `}
            >

                <div className="p-4">
                    {/* Priority + drag handle */}
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                            <span className={`text-[11px] font-semibold px-2 py-1 rounded-md ${task.priority === 'Low'
                                ? 'bg-[#DFA874]/15 text-[#D58D49]'
                                : task.priority === 'High'
                                    ? 'bg-[#D8727D]/10 text-[#D8727D]'
                                    : 'bg-[#7AC555]/10 text-[#7AC555]'
                                }`}>
                                {task.priority}
                            </span>
                            {/* Edit Button */}
                            {!isClient && (
                                <button
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(); }}
                                    className="opacity-0 group-hover/card:opacity-60 hover:!opacity-100 transition-opacity p-1 rounded-md hover:bg-gray-100"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#787486" strokeWidth="2.5" strokeLinecap="round">
                                        <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
                                    </svg>
                                </button>
                            )}

                            {/* Task Log Button */}
                            {task.stateLogs && task.stateLogs.length > 0 && (
                                <button
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowLogInfo(true); }}
                                    className="opacity-0 group-hover/card:opacity-100 transition-opacity p-1 rounded-md bg-blue-50 text-[#5030E5] hover:bg-[#5030E5] hover:text-white flex items-center gap-1"
                                    title="Task Activity Logs"
                                >
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="12 8 12 12 14 14" /><circle cx="12" cy="12" r="10" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {/* Drag dots handle */}
                        {!isClient && (
                            <div className="opacity-0 group-hover/card:opacity-40 transition-opacity flex flex-col gap-[3px] mt-0.5 pointer-events-none">
                                {[0, 1, 2].map(i => (
                                    <div key={i} className="flex gap-[3px]">
                                        <div className="h-[3px] w-[3px] rounded-full bg-gray-400" />
                                        <div className="h-[3px] w-[3px] rounded-full bg-gray-400" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <h3 className="font-semibold text-[14px] text-[#0D062D] mt-2 leading-snug">{task.title}</h3>

                    {task.text && (
                        <p className="text-[12px] text-[#787486] mt-1 leading-relaxed line-clamp-2">{task.text}</p>
                    )}

                    {/* Task image — shown at the top if present */}
                    {task.image && !imgError && (
                        <div className="w-full h-[130px] overflow-hidden bg-gray-100">
                            <img
                                src={task.image}
                                alt={task.title}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover/card:scale-105"
                                onError={() => setImgError(true)}
                            />
                        </div>
                    )}

                    {/* Footer: Avatars + stats */}
                    <div className="pt-4 mt-2 border-t border-[#F3F4F6] flex justify-between items-center">

                        <div className="flex -space-x-2">
                            {users.slice(0, 3).map((user) => (
                                <UserAvatar
                                    key={user.id}
                                    user={user}
                                    className="h-6 w-6 rounded-full ring-2 ring-white"
                                />
                            ))}
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-[#787486]">
                                <img src={message} alt="comments" className="h-3.5 w-3.5 opacity-60" />
                                <span className="text-[12px] font-medium">{task.comments}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[#787486]">
                                <img src={file} alt="files" className="h-3.5 w-3.5 opacity-60" />
                                <span className="text-[12px] font-medium">{task.files}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Task Log Information Modal */}
            {showLogInfo && (
                <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4" onClick={() => setShowLogInfo(false)}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-[420px] p-6 flex flex-col gap-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-[#5030E5]/10 flex items-center justify-center">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5030E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="12 8 12 12 14 14" /><circle cx="12" cy="12" r="10" />
                                    </svg>
                                </div>
                                <h3 className="font-bold text-[#0D062D] text-lg">Activity History</h3>
                            </div>
                            <button onClick={() => setShowLogInfo(false)} className="text-slate-400 hover:text-slate-600">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            </button>
                        </div>

                        <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2">
                            {task.stateLogs && task.stateLogs.length > 0 ? (
                                task.stateLogs.map((log, i) => (
                                    <div key={i} className="flex gap-3 text-[13px] items-start relative">
                                        {i !== task.stateLogs.length - 1 && (
                                            <div className="absolute left-[11.5px] top-6 bottom-[-16px] w-[2px] bg-slate-100" />
                                        )}
                                        <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0 z-10">
                                            <div className="w-2.5 h-2.5 rounded-full bg-[#5030E5]" />
                                        </div>
                                        <div className="flex flex-col flex-1 pb-3">
                                            <span className="text-slate-700">
                                                <span className="font-bold text-[#0D062D]">{log.by}</span> changed state to <span className="font-bold text-[#5030E5]">{STATUS_LABELS[log.status] || log.status}</span>
                                            </span>
                                            <span className="text-[11px] text-slate-400 font-medium mt-0.5">
                                                {new Date(log.date).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-slate-400 italic text-center py-4">No activity recorded.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default TaskCard