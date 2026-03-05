import React from 'react'
import TaskCard from '../components/TaskCard'

const Column = ({ title, tasks }) => {

    return (
        <div className="bg-gray-100 p-4 rounded-lg">

            <h2 className="font-semibold text-lg mb-4 flex flex-row items-center gap-2">
                <div className={`h-[8px] w-[8px] rounded-full flex-shrink-0 ${title === "To Do" ? "bg-[#5030E5]" : title === "In Progress" ? "bg-[#FFA500]" : title === "Completed" ? "bg-[#7AC555]" : "bg-[#D87272]"}`}></div> {title} <div className="h-8 w-8 bg-[#DBDBDB]/50 rounded-full flex justify-center items-center text-[#787486] text-[12px]">{tasks.length}</div>
            </h2>

            <div className="flex flex-col gap-4">
                <div className={`relative w-full h-1 rounded-sm ${title === "To Do" ? "bg-[#5030E5]" : title === "In Progress" ? "bg-[#FFA500]" : title === "Completed" ? "bg-[#7AC555]" : "bg-[#D87272]"}`}></div>
                {tasks.map(task => (
                    <TaskCard key={task.id} task={task} />
                ))}

            </div>

        </div>
    )
}

export default Column