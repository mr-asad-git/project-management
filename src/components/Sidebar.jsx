import React from 'react'

const Sidebar = () => {

    const Projects = [
        {
            id: 1,
            name: "Mobile App",
            status: "Completed",
        },

        {
            id: 2,
            name: "Typescript",
            status: "Completed",
        },

        {
            id: 3,
            name: "Design System",
            status: "OnProgress",
        },

        {
            id: 4,
            name: "Wireframes",
            status: "OnHold",
        },
        {
            id: 5,
            name: "Web Redesign App",
            status: "Todo",
        },
    ]
    return (
        <div className='Sidebar h-screen w-[270px] border border-r-[var(--dark-gray)]'>
            <div className='flex flex-col h-full'>
                <div className='Header flex items-center justify-between gap-2 h-24 px-5 border-b w-full border-b-[var(--dark-gray)]'>
                    <div className="logoText flex items-center gap-2">
                        <img src="/logo.svg" className='h-[20px] w-[20px] object-contain' alt="" />
                        <span className='font-[Inter] font-[600] text-[18px]'>Project M.</span>
                    </div>
                    <img src="/dashboardclose.svg" className='h-[20px] w-[20px] object-contain' alt="" />
                </div>
                <div className="Navigations flex flex-col gap-[10px] py-[1rem] mx-5 leading-[40px] border-b border-[var(--dark-gray)]">
                    <div className="Navigation flex items-center gap-2">
                        <img src="/navIcons/category.svg" className='h-[24px] w-[24px] object-contain' alt="" />
                        <span className='text-[16px] font-[400] font-[Inter] text-[var(--text-color)]'>Home</span>
                    </div>
                    <div className="Navigation flex items-center gap-2">
                        <img src="/navIcons/message.svg" className='h-[24px] w-[24px] object-contain' alt="" />
                        <span className='text-[16px] font-[400] font-[Inter] text-[var(--text-color)]'>Messages</span>
                    </div>
                    <div className="Navigation flex items-center gap-2">
                        <img src="/navIcons/task-square.svg" className='h-[24px] w-[24px] object-contain' alt="" />
                        <span className='text-[16px] font-[400] font-[Inter] text-[var(--text-color)]'>Tasks</span>
                    </div>
                    <div className="Navigation flex items-center gap-2">
                        <img src="/navIcons/users.svg" className='h-[24px] w-[24px] object-contain' alt="" />
                        <span className='text-[16px] font-[400] font-[Inter] text-[var(--text-color)]'>Members</span>
                    </div>
                    <div className="Navigation flex items-center gap-2">
                        <img src="/navIcons/settings.svg" className='h-[24px] w-[24px] object-contain' alt="" />
                        <span className='text-[16px] font-[400] font-[Inter] text-[var(--text-color)]'>Settings</span>
                    </div>
                </div>
                <div className="Projects flex flex-col py-[1rem] gap-[10px]">
                    <div className="ProjectsHeader flex items-center justify-between h-8 px-5 w-full">
                        <span className='font-[Inter] font-[600] text-[14px] text-[var(--text-color)]'>MY PROJECTS</span>
                        <img src="/add-task.svg" className='h-[16px] w-[16px] object-contain' alt="" />
                    </div>
                    {
                        Projects.map((project) => (
                            <div className="Project flex flex-col gap-[10px] justify-between px-3 w-full ">
                                <div className="project-text w-full py-[10px] transition-all duration-200 hover:bg-[var(--button-color)]/8 cursor-pointer rounded-md flex justify-between items-center px-3">
                                    <div className="project-title flex items-center gap-4">
                                        {project.status === "Completed" ? (
                                            <div className="rounded-green h-[8px] w-[8px] rounded-full bg-green-500"></div>
                                        ) : project.status === "OnProgress" ? (
                                            <div className="rounded-green h-[8px] w-[8px] rounded-full bg-yellow-500"></div>
                                        ) : project.status === "OnHold" ? (
                                            <div className="rounded-green h-[8px] w-[8px] rounded-full bg-red-500"></div>
                                        ) : project.status === "Todo" ? (
                                            <div className="rounded-green h-[8px] w-[8px] rounded-full bg-blue-500"></div>
                                        ) : (
                                            <div className="rounded-green h-[8px] w-[8px] rounded-full bg-gray-500"></div>
                                        )}
                                        <span className='font-[Inter] font-[400] text-[16px] text-[var(--text-color)]'>{project.name}</span>
                                    </div>
                                    <img src="/setting.svg" className='h-[16px] w-[16px] object-contain' alt="" />
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    )
}

export default Sidebar