import React from 'react'
import logo from '/logo.svg'

const SignUp = () => {
    return (
        <div className='w-full h-full'>
            <div className="absolute p-12 font-bold w-full h-full">
                <img src={logo} className='w-10' alt="" />
                <div className="signupText">
                    <div className="Text">
                        <h1>Sign in to</h1>
                        <h1>TaskFlow</h1>
                    </div>
                    <div className="image"></div>
                </div>
            </div>
            <div className="half h-[50vh] w-full bg-[var(--bg-signup)]/40">
            </div>



        </div>
    )
}

export default SignUp