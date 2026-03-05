import React from 'react'
import users from '../mui/users'

import message from '/message.svg'
import file from '/File.svg'

const TaskCard = ({ task }) => {

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm">

            <span className={`text-xs font-medium ${task.priority === "Low" ? "bg-[#DFA874]/20 text-[#D58D49] p-[5px] rounded-sm" : task.priority === "High" ? "bg-[#D8727D]/10 text-[#D8727D] p-[5px] rounded-sm" : "bg-[#7AC555]/10 text-[#7AC555] p-[5px] rounded-sm"}`}>
                {task.priority}
            </span>

            <h3 className="font-semibold mt-2">
                {task.title}
            </h3>
            <p className='text-[14px] text-[var(--text-color)]'>
                {task.text}
            </p>
            <div className="pt-10 flex justify-between items-center">
                <div className="users flex ">
                    {users.slice(0, 3).map((user) => (
                        <img className='-mr-[10px]' key={user.id} src={user.image} alt={user.name} />
                    ))}
                </div>
                <div className="feedback flex justify-between items-center gap-10">
                    <div className="comments flex gap-2">
                        <img src={message} alt="" />
                        <p className='text-[14px]'>{task.comments} Comments</p>
                    </div>
                    <div className="files flex gap-2">
                        <img src={file} alt="" />
                        <p className='text-[14px]'>{task.files} Files</p>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default TaskCard