import React from 'react'
import { useNavigate } from 'react-router-dom'

const Error = () => {
    const navigate = useNavigate()
    return (
        <div className='flex flex-col gap-3 items-center justify-center h-screen'>
            <div className="popup flex flex-col gap-3 items-center justify-center w-full max-w-md bg-white rounded-xl shadow-lg p-10">
                <h1 className='text-4xl font-bold'>404 - Not Found</h1>
                <p>Invalid <span className='text-[#0089ED]'>URL</span> added</p>
                <button onClick={() => navigate('/')} className='mt-4 px-4 py-2 cursor-pointer bg-[#0089ED] text-white rounded-lg'>Go to Home</button>
            </div>
        </div>
    )
}

export default Error