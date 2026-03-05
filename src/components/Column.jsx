import React from 'react'
import TaskCard from '../components/TaskCard'

const ACCENT = {
    'To Do': '#5030E5',
    'In Progress': '#FFA500',
    'Completed': '#7AC555',
}

const Column = ({ title, tasks, isOver, onDragStart, onDragOver, onDragLeave, onDrop }) => {
    const accent = ACCENT[title] ?? '#D87272'

    return (
        <div
            className={`rounded-xl p-4 transition-all duration-200 ${isOver ? 'ring-2 ring-offset-2 scale-[1.01]' : 'ring-0'}`}
            style={{
                background: isOver ? `${accent}08` : '#f3f4f6',
                ringColor: accent,
            }}
            onDragOver={e => { e.preventDefault(); onDragOver(); }}
            onDragLeave={onDragLeave}
            onDrop={e => { e.preventDefault(); onDrop(); }}
        >
            {/* Column header */}
            <h2 className="font-semibold text-lg mb-3 flex flex-row items-center gap-2">
                <div
                    className="h-[8px] w-[8px] rounded-full flex-shrink-0"
                    style={{ background: accent }}
                />
                {title}
                <div className="h-8 w-8 bg-[#DBDBDB]/50 rounded-full flex justify-center items-center text-[#787486] text-[12px]">
                    {tasks.length}
                </div>
            </h2>

            {/* Colour bar */}
            <div className="relative w-full h-1 rounded-sm flex-shrink-0 mb-4" style={{ background: accent }} />

            {/* Drop hint when hovering over an empty column */}
            {isOver && tasks.length === 0 && (
                <div
                    className="w-full h-20 rounded-lg border-2 border-dashed flex items-center justify-center text-sm font-medium opacity-60 mb-2 transition-all duration-200"
                    style={{ borderColor: accent, color: accent }}
                >
                    Drop here
                </div>
            )}

            {/* Cards */}
            <div className="flex flex-col gap-4 overflow-y-auto max-h-[700px] scrollbar-hide">
                {tasks.map(task => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        onDragStart={() => onDragStart(task.id, task.status)}
                    />
                ))}
            </div>
        </div>
    )
}

export default Column