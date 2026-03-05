import React, { useRef, useState } from 'react'
import Column from './Column'

const COLUMNS = [
    { title: 'To Do', status: 'todo' },
    { title: 'In Progress', status: 'inProgress' },
    { title: 'Completed', status: 'completed' },
]

const Board = ({ tasks, onTaskMove }) => {
    const dragTaskId = useRef(null)   // which task is being dragged
    const dragStatus = useRef(null)   // its original status
    const [overCol, setOverCol] = useState(null) // column being hovered

    const handleDragStart = (taskId, taskStatus) => {
        dragTaskId.current = taskId
        dragStatus.current = taskStatus
    }

    const handleDrop = (targetStatus) => {
        if (dragTaskId.current && targetStatus !== dragStatus.current) {
            onTaskMove(dragTaskId.current, targetStatus)
        }
        dragTaskId.current = null
        dragStatus.current = null
        setOverCol(null)
    }

    return (
        <div className="grid grid-cols-3 gap-8">
            {COLUMNS.map(col => (
                <Column
                    key={col.status}
                    title={col.title}
                    status={col.status}
                    tasks={tasks.filter(t => t.status === col.status)}
                    isOver={overCol === col.status}
                    onDragStart={handleDragStart}
                    onDragOver={() => setOverCol(col.status)}
                    onDragLeave={() => setOverCol(prev => prev === col.status ? null : prev)}
                    onDrop={() => handleDrop(col.status)}
                />
            ))}
        </div>
    )
}

export default Board