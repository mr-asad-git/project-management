import React from 'react'

import message from "/public/headerIcons/message.svg"
import notification from "/public/headerIcons/notification.svg"
import calendar from "/public/headerIcons/calendar.svg"
import users from "../mui/users"

const Header = () => {
    return (
        <div className='h-20 w-full border-b border-[var(--dark-gray)] flex justify-between px-[5rem] items-center'>
            <div className="searchBar w-[380px] h-[40px] bg-[var(--dark-gray)]/30 rounded-md flex items-center gap-2 px-5">
                <img src="/search.svg" alt="Search" />
                <input type="text" placeholder='Search something...' className='bg-transparent outline-none text-[var(--text-color)]' />
            </div>
            <div className="actions flex justify-between gap-10 items-center">
                <div className="buttonIcons flex flex-row gap-6 ">
                    <button><img className='h-[24px] w-[24px] object-contain' src={calendar} alt="Calendar" /></button>
                    <button><img className='h-[24px] w-[24px] object-contain' src={message} alt="Message" /></button>
                    <button><img className='h-[24px] w-[24px] object-contain' src={notification} alt="Notification" /></button>
                </div>
                <div className="profile flex flex-row gap-5 items-center">
                    <div className="profile-text">
                        <p>{users[0].name}</p>
                        <p>{users[0].location}</p>
                    </div>
                    <div className="profile-image flex flex-row items-center gap-3">
                        <img className='h-[40px] w-[40px] object-contain' src={users[0].image} alt="Profile" />
                        <img src="/arrow-down.svg" alt="Arrow Down" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Header