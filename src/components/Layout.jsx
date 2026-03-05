import React from 'react'
import users from '../mui/users'
import edit from '/edit.svg'
import link from '/link.svg'
import share from '/share.svg'
import category from '/category.svg'
import Board from '../components/Board'

const Layout = ({ selectedProject }) => {
    return (
        <div className='p-15 flex flex-col gap-[2rem]'>
            <div className="header flex justify-between items-center">

                <div className="heading flex flex-row gap-[2rem] items-center">
                    <h1 className='text-[40px] text-[Inter, sans-serif] font-[600] text-[#0D062D]'>{selectedProject.name}</h1>
                    <div className="heading-actions flex flex-row gap-[1rem]">
                        <div className="action-item px-[8px] py-[4px]  bg-[var(--button-color)]/20 rounded-[8px] flex justify-center items-center"><img src={edit} alt="" /></div>
                        <div className="action-item px-[8px] py-[4px] bg-[var(--button-color)]/20 rounded-[8px] flex justify-center items-center"><img src={link} alt="" /></div>
                    </div>
                </div>

                <div className="userInvites flex flex-row gap-[20px]">
                    <div className="">
                        <div className="action-item px-[10px] py-[6px]  bg-[var(--button-color)]/20 rounded-[8px] flex justify-center items-center"><p className='text-[10px] scale-200'>+</p></div>
                    </div>
                    <p className='text-lg font-[600] text-[#5030E5]'>Invite</p>
                    <div className="userImage flex">
                        {users.map((user) => (
                            <img key={user.id} src={user.image} alt={user.name} className='-mr-[10px]' />
                        ))}
                    </div>
                </div>
            </div>

            <div className="filteration flex justify-between">
                <div className="filter-actions flex flex-row gap-5">
                    <div className="border px-3 flex justify-center items-center">
                        <select name="Filter" id="filter" className='px-7 py-2 rounded-sm'>
                            <option value="1">Filter</option>
                            <option value="2">Filter</option>
                            <option value="3">Filter</option>
                        </select>
                    </div>
                    <div className="border px-3 flex justify-center items-center">
                        <select name="Sort" id="sort" className='px-7 py-2 rounded-sm'>
                            <option value="1">Sort</option>
                            <option value="2">Sort</option>
                            <option value="3">Sort</option>
                        </select>
                    </div>
                </div>
                <div className="share-actions flex flex-row gap-5 items-center">
                    <div className="share-button h-[40px] w-[110px] flex justify-center items-center rounded-md border gap-2"><img src={share} alt="" /><p className='text-[16px] font-[600] text-[var(--text-color)]'>Share</p></div>
                    <div className="px-[1rem] flex justify-center items-center border-l-[1px] border-[#DBDBDB] h-[40px]">
                        <div className="h-[50px] w-[50px] bg-[var(--button-color)] flex justify-center items-center rounded-md">
                            <div className="flex flex-col gap-[5px] flex justify-center items-center">
                                <div className="h-[8px] w-[25px] bg-white rounded-[2px]"></div>
                                <div className="h-[8px] w-[25px] bg-white rounded-[2px]"></div>
                            </div>
                        </div>
                    </div>
                    <img className='h-6 w-6' src={category} alt="" />
                </div>
            </div>

            <Board tasks={selectedProject.tasks} />
        </div>
    )
}

export default Layout