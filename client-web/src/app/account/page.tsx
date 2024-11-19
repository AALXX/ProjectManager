import React from 'react'
import { redirect } from 'next/navigation'
import UserProfile from '@/components/Account/UserProfile'
import { auth } from '@/auth'

const Account = async () => {
    const session = await auth()

    if (!session || !session.user) {
        // redirect('/api/auth/signin')
        redirect('/account/login-register')
    }

    return (
        <div className="flex h-full flex-col">
            <div className="flex h-[30vh] w-full flex-grow-0 flex-col">
                <div className="flex h-full w-[90%] flex-col self-center sm:flex-row lg:flex-row">
                    <UserProfile name={session.user.name as string} email={session.user.email as string} image={session.user.image as string} />
                </div>
            </div>
            <h1 className="ml-5 font-bold text-white">My banks:</h1>
            <div className=""></div>
        </div>
    )
}

export default Account