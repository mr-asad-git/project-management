import React from 'react'

const Sidebar = ({ sidebar, setSideBar, toggleSidebar }) => {

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
        <aside className={`Sidebar h-screen sticky top-0 left-0 ${sidebar ? "w-[270px]" : "w-[100px]"} transition-all duration-300 ease-in-out border-r border-[#DBDBDB] bg-white flex flex-col overflow-x-hidden overflow-y-auto scrollbar-hide select-none z-50`}>
            <div className="flex flex-col h-full w-full"> {/* Ensure it takes full width of the parent aside */}
                {/* Header */}
                <div className={`Header flex items-center ${sidebar ? "justify-between px-6" : "justify-center"} h-20 border-b border-[#DBDBDB]/50`}>
                    <div className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ${sidebar ? "opacity-100 w-auto" : "opacity-0 w-0 hidden"}`}>
                        <img src="/logo.svg" className='h-[24px] w-[24px] object-contain flex-shrink-0' alt="Logo" />
                        <h1 className={`font-bold text-[18px] tracking-tight text-[#0D062D] whitespace-nowrap`}>
                            Project M.
                        </h1>
                    </div>
                    <div className="flex justify-center items-center h-20">
                        <button
                            onClick={toggleSidebar}
                            className="p-1.5 hover:bg-gray-100 cursor-pointer rounded-lg p-2 transition-all duration-200 active:scale-90 flex-shrink-0"
                        >
                            <img
                                src={sidebar ? "/dashboardclose.svg" : "/dashboardopen.svg"}
                                className='h-[20px] w-[20px] object-contain'
                                alt="Toggle"
                            />
                        </button>
                    </div>
                </div>


                {/* Nav Links */}
                <nav className="Navigations flex flex-col gap-1 py-6 px-4">
                    {[
                        { icon: "/navIcons/category.svg", label: "Home" },
                        { icon: "/navIcons/message.svg", label: "Messages" },
                        { icon: "/navIcons/task-square.svg", label: "Tasks" },
                        { icon: "/navIcons/users.svg", label: "Members" },
                        { icon: "/navIcons/settings.svg", label: "Settings" },
                    ].map((item, index) => (
                        <div
                            key={index}
                            className={`flex items-center ${sidebar ? "px-3 py-3 gap-4" : "justify-center w-12 h-12 self-center"} rounded-xl transition-all duration-200 cursor-pointer group hover:bg-[#5030E5]/5`}
                        >
                            <img src={item.icon} className='h-[24px] w-[24px] object-contain flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity' alt={item.label} />
                            <span className={`text-[16px] font-medium text-[#787486] group-hover:text-[#5030E5] transition-all duration-300 ${sidebar ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none absolute"} whitespace-nowrap`}>
                                {item.label}
                            </span>
                        </div>
                    ))}
                </nav>

                <div className="px-6">
                    <div className="h-[1px] w-full bg-[#DBDBDB]/50"></div>
                </div>

                {/* Projects Section */}
                <div className="flex-1 flex flex-col py-4 overflow-hidden">
                    <div className={`ProjectsHeader flex items-center ${sidebar ? "justify-between px-7" : "justify-center px-0"} mb-4`}>
                        <span className={`font-bold text-[12px] tracking-wider text-[#787486] uppercase transition-all duration-300 ${sidebar ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 absolute pointer-events-none"}`}>
                            MY PROJECTS
                        </span>
                        <button className={`hover:bg-gray-100 p-1 rounded-md transition-colors flex-shrink-0 ${!sidebar && "hidden"}`}>
                            <img src="/add-task.svg" className='h-[16px] w-[16px] object-contain opacity-40 hover:opacity-100' alt="Add" />
                        </button>
                    </div>

                    <div className="flex flex-col gap-1 px-4 overflow-y-auto scrollbar-hide">
                        {Projects.map((project) => (
                            <div
                                key={project.id}
                                className={`group flex items-center ${sidebar ? "justify-between px-3 py-2.5" : "justify-center w-12 h-12 self-center"} rounded-xl hover:bg-[#5030E5]/5 transition-all duration-200 cursor-pointer`}
                            >
                                <div className="flex items-center gap-4 overflow-hidden">
                                    <div className={`h-[8px] w-[8px] rounded-full flex-shrink-0 ${project.status === "Completed" ? "bg-[#7AC555]" :
                                        project.status === "OnProgress" ? "bg-[#FFA500]" :
                                            project.status === "OnHold" ? "bg-[#D87272]" :
                                                "bg-[#5030E5]"
                                        }`}></div>
                                    <span className={`text-[16px] font-medium text-[#787486] transition-all duration-300 group-hover:text-[#0D062D] ${sidebar ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none absolute"} whitespace-nowrap`}>
                                        {project.name}
                                    </span>
                                </div>
                                <img src="/setting.svg" className={`h-[16px] w-[16px] object-contain opacity-0 group-hover:opacity-40 transition-opacity ${sidebar ? "block" : "hidden"}`} alt="Settings" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Premium Help Card */}
                <div className={`px-6 py-6 transition-all duration-500 ease-in-out ${sidebar ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"}`}>
                    <div className="bg-[#F5F5F5] p-5 rounded-3xl relative flex flex-col items-center text-center gap-3 shadow-sm border border-white">
                        <div className="absolute -top-6 w-12 h-12 bg-[#F5F5F5] rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                            <div className="w-8 h-8 bg-yellow-400/20 rounded-full flex items-center justify-center text-yellow-600">
                                <span className="text-[18px]">💡</span>
                            </div>
                        </div>
                        <h4 className="text-[14px] font-bold mt-4 text-[#0D062D]">Thoughts Time</h4>
                        <p className="text-[12px] text-[#787486] leading-relaxed">We don't have any notice for now, till then share your thoughts.</p>
                        <button className="w-full py-2.5 bg-white text-[#0D062D] text-[12px] font-bold rounded-lg hover:bg-black hover:text-white transition-all duration-300 shadow-sm border border-[#DBDBDB]/50">
                            Write a message
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    )
}

export default Sidebar