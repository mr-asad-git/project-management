import React, { useState } from 'react'
import users from '../mui/users'
import message from '/message.svg'
import file from '/File.svg'

const TaskCard = ({ task, onDragStart }) => {
    const [isDragging, setIsDragging] = useState(false)

    return (
        <div
            draggable
            onDragStart={(e) => {
                setIsDragging(true)
                // Add a ghost image offset so the cursor sits nicely on the card
                e.dataTransfer.effectAllowed = 'move'
                onDragStart()
            }}
            onDragEnd={() => setIsDragging(false)}
            className={`
                bg-white p-4 rounded-lg shadow-sm cursor-grab active:cursor-grabbing
                select-none group/card
                transition-all duration-200
                ${isDragging
                    ? 'opacity-40 scale-95 rotate-1 shadow-lg'
                    : 'opacity-100 hover:shadow-md hover:-translate-y-0.5'
                }
            `}
        >
            {/* Drag handle hint */}
            <div className="flex justify-between items-start">
                <span className={`text-xs font-medium ${task.priority === 'Low' ? 'bg-[#DFA874]/20 text-[#D58D49] p-[5px] rounded-sm' : task.priority === 'High' ? 'bg-[#D8727D]/10 text-[#D8727D] p-[5px] rounded-sm' : 'bg-[#7AC555]/10 text-[#7AC555] p-[5px] rounded-sm'}`}>
                    {task.priority}
                </span>
                {/* dots drag handle */}
                <div className="opacity-0 group-hover/card:opacity-40 transition-opacity flex flex-col gap-[3px] mt-1">
                    <div className="flex gap-[3px]">
                        <div className="h-[3px] w-[3px] rounded-full bg-gray-400" />
                        <div className="h-[3px] w-[3px] rounded-full bg-gray-400" />
                    </div>
                    <div className="flex gap-[3px]">
                        <div className="h-[3px] w-[3px] rounded-full bg-gray-400" />
                        <div className="h-[3px] w-[3px] rounded-full bg-gray-400" />
                    </div>
                    <div className="flex gap-[3px]">
                        <div className="h-[3px] w-[3px] rounded-full bg-gray-400" />
                        <div className="h-[3px] w-[3px] rounded-full bg-gray-400" />
                    </div>
                </div>
            </div>

            <h3 className="font-semibold mt-2">{task.title}</h3>
            <p className="text-[14px] text-[var(--text-color)]">{task.text}</p>

            <div className="pt-10 flex justify-between items-center">
                <div className="users flex">
                    {users.slice(0, 3).map((user) => (
                        <img className="-mr-[10px]" key={user.id} src={user.image} alt={user.name} />
                    ))}
                </div>
                <div className="feedback flex justify-between items-center gap-6">
                    <div className="comments flex gap-2">
                        <img src={message} alt="" />
                        <p className="text-[14px]">{task.comments}</p>
                    </div>
                    <div className="files flex gap-2">
                        <img src={file} alt="" />
                        <p className="text-[14px]">{task.files}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TaskCard