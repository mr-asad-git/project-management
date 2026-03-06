import React, { useState } from 'react'
import users from '../mui/users'
import message from '/message.svg'
import file from '/File.svg'

const TaskCard = ({ task, onDragStart, onDragEnd, onEdit }) => {
    const [isDragging, setIsDragging] = useState(false)
    const [imgError, setImgError] = useState(false)

    return (
        <div
            draggable
            onDragStart={(e) => {
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
                bg-white rounded-xl shadow-sm cursor-grab active:cursor-grabbing
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
                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(); }}
                            className="opacity-0 group-hover/card:opacity-60 hover:!opacity-100 transition-opacity p-1 rounded-md hover:bg-gray-100"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#787486" strokeWidth="2.5" strokeLinecap="round">
                                <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
                            </svg>
                        </button>
                    </div>

                    {/* Drag dots handle */}
                    <div className="opacity-0 group-hover/card:opacity-40 transition-opacity flex flex-col gap-[3px] mt-0.5 pointer-events-none">
                        {[0, 1, 2].map(i => (
                            <div key={i} className="flex gap-[3px]">
                                <div className="h-[3px] w-[3px] rounded-full bg-gray-400" />
                                <div className="h-[3px] w-[3px] rounded-full bg-gray-400" />
                            </div>
                        ))}
                    </div>
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
                            <img
                                key={user.id}
                                src={user.image}
                                alt={user.name}
                                title={user.name}
                                className="h-6 w-6 rounded-full ring-2 ring-white object-cover"
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
    )
}

export default TaskCard