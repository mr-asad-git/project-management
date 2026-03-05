import React from 'react'
import Column from './Column'

const Board = ({ tasks }) => {

    const todoTasks = tasks.filter(task => task.status === "todo")
    const progressTasks = tasks.filter(task => task.status === "inProgress")
    const completedTasks = tasks.filter(task => task.status === "completed")

    return (
        <div className="grid grid-cols-3 gap-8">

            <Column title="To Do" tasks={todoTasks} />

            <Column title="In Progress" tasks={progressTasks} />

            <Column title="Completed" tasks={completedTasks} />

        </div>
    )
}

export default Board