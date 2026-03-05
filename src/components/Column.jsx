import React from 'react'
import TaskCard from '../components/TaskCard'

const Column = ({ title, tasks }) => {

    return (
        <div className="bg-gray-100 p-4 rounded-lg">

            <h2 className="font-semibold text-lg mb-4">
                {title} ({tasks.length})
            </h2>

            <div className="flex flex-col gap-4">

                {tasks.map(task => (
                    <TaskCard key={task.id} task={task} />
                ))}

            </div>

        </div>
    )
}

export default Column