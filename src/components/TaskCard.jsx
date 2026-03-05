import React from 'react'

const TaskCard = ({ task }) => {

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm">

            <span className="text-xs font-medium">
                {task.priority}
            </span>

            <h3 className="font-semibold mt-2">
                {task.title}
            </h3>

        </div>
    )
}

export default TaskCard