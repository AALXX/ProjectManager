'use client'

import type React from 'react'
import { useState } from 'react'
import { signOut } from 'next-auth/react'
import Image from 'next/image'
import { User, Lock, Bell, Shield, Trash2, Upload } from 'lucide-react'
import axios from 'axios'

interface AccountSettingsPopupProps {
    name: string
    email: string
    image: string
    userSessionToken: string
}

const AccountSettingsPopup: React.FC<AccountSettingsPopupProps> = ({ name, email, image, userSessionToken }) => {
    const [activeTab, setActiveTab] = useState('profile')
    const [formData, setFormData] = useState({
        userName: name || '',
        userEmail: email || '',
        userDescription: '',
        userSessionToken: userSessionToken
    })

    const [notifications, setNotifications] = useState({
        emailNotifications: true,
        pushNotifications: false,
        projectUpdates: true,
        securityAlerts: true
    })

    const [isLoading, setIsLoading] = useState(false)

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleNotificationChange = (field: string) => {
        setNotifications(prev => ({
            ...prev,
            [field]: !prev[field as keyof typeof prev]
        }))
    }

    const handleSaveProfile = async () => {
        setIsLoading(true)
        try {
            console.log('Saving profile:', formData)
            const resp = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_SERVER}/api/user-account-manager/change-user-data`, formData)
            console.log(resp.data)
        } catch (error) {
            console.error('Error updating profile:', error)
            alert('Failed to update profile. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleGetEmailChangeLink = async () => {
        try {
            const resp = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_SERVER}/api/user-account-manager/get-change-email-link`, {
                userSessionToken: userSessionToken
            })

            if (resp.data.error) {
                return
            }
        } catch (error) {
            console.error('Error getting email change link:', error)
        }
    }

    const handleGetPasswordChangeLink = async () => {
        try {
            const resp = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_SERVER}/api/user-account-manager/get-change-password-link`, {
                userSessionToken: userSessionToken
            })
            console.log(resp.data)
        } catch (error) {
            console.error('Error getting password change link:', error)
        }
    }

    // const handleChangePassword = async () => {
    //     if (formData.newPassword !== formData.confirmPassword) {
    //         alert('New passwords do not match!')
    //         return
    //     }

    //     if (formData.newPassword.length < 8) {
    //         alert('Password must be at least 8 characters long!')
    //         return
    //     }

    //     setIsLoading(true)
    //     try {
    //         // Implement your API call here
    //         console.log('Changing password')
    //         // await changePassword(formData.currentPassword, formData.newPassword)

    //         setFormData(prev => ({
    //             ...prev,
    //             currentPassword: '',
    //             newPassword: '',
    //             confirmPassword: ''
    //         }))

    //         alert('Password changed successfully!')
    //     } catch (error) {
    //         console.error('Error changing password:', error)
    //         alert('Failed to change password. Please try again.')
    //     } finally {
    //         setIsLoading(false)
    //     }
    // }

    const handleSignOut = async () => {
        try {
            const resp = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_SERVER}/api/user-account-manager/logout`, {
                userSessionToken
            })

            if (resp.data.error) {
                console.error('Error during sign out:', resp.data.error)
                return
            }

            await signOut({ callbackUrl: '/account/login-register' })
        } catch (error) {
            console.error('Error during sign out:', error)
        }
    }

    const handleDeleteAccount = async () => {
        if (confirm('Are you absolutely sure? This action cannot be undone. This will permanently delete your account and remove all your data from our servers.')) {
            try {
                console.log('Deleting account')
                // await deleteAccount()

                await signOut({ callbackUrl: '/account/login-register' })
            } catch (error) {
                console.error('Error deleting account:', error)
                alert('Failed to delete account. Please try again.')
            }
        }
    }

    return (
        <div className="h-full w-full">
            <div className="h-full text-white">
                <div className="pb-4">
                    <div className="flex items-center gap-2 text-2xl font-bold text-white">
                        <User className="h-6 w-6" />
                        Account Settings
                    </div>
                    <p className="text-gray-300">Manage your account preferences and security settings</p>
                </div>

                <div className="mt-6">
                    <div className="mb-6 grid w-full grid-cols-4 rounded-md bg-[#353535]">
                        {['profile', 'security', 'notifications', 'account'].map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-center transition-colors ${activeTab === tab ? 'bg-[#1A1A1A] text-white' : 'text-gray-300 hover:bg-[#1A1A1A]/50'} ${tab === 'profile' ? 'rounded-l-md' : ''} ${tab === 'account' ? 'rounded-r-md' : ''}`}>
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'profile' && (
                        <div className="h-full space-y-6">
                            <div className="flex items-center space-x-4">
                                <div className="relative h-20 w-20">
                                    <Image src={image || '/placeholder.svg'} alt="Profile picture" className="rounded-full object-cover" width={80} height={80} />
                                </div>
                                <div className="space-y-2">
                                    <button className="flex items-center rounded-md border border-white px-4 py-2 text-white transition-colors hover:bg-[#ffffff1a]">
                                        <Upload className="mr-2 h-4 w-4" />
                                        Change Photo
                                    </button>
                                    <p className="text-sm text-gray-400">JPG, PNG or GIF. Max size 2MB.</p>
                                </div>
                            </div>

                            <div className="my-4 h-px w-full bg-white" />

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="block text-white">
                                        Full Name
                                    </label>
                                    <input id="name" value={formData.userName} onChange={e => handleInputChange('userName', e.target.value)} className="w-full rounded-md bg-[#353535] px-3 py-2 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-gray-500 focus:outline-none" placeholder="Enter your full name" />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="email" className="block text-white">
                                        Email Address
                                    </label>
                                    <h1 className="w-full rounded-md bg-[#353535] px-3 py-2 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-gray-500 focus:outline-none">{formData.userEmail}</h1>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="bio" className="block text-white">
                                    Bio
                                </label>
                                <textarea
                                    id="bio"
                                    value={formData.userDescription}
                                    onChange={e => handleInputChange('userDescription', e.target.value)}
                                    className="min-h-[100px] w-full rounded-md bg-[#353535] px-3 py-2 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-gray-500 focus:outline-none"
                                    placeholder="Tell us about yourself..."
                                />
                            </div>

                            <button onClick={handleSaveProfile} disabled={isLoading} className={`mt-auto rounded-md border p-2 text-white transition-colors hover:bg-blue-700 ${isLoading ? 'cursor-not-allowed opacity-70' : ''}`}>
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-6">
                            <div className="mt-4 space-y-4">
                                <div className="mb-4 flex items-center gap-2">
                                    <Lock className="h-5 w-5 text-white" />
                                    <h3 className="text-lg font-semibold text-white">Change Password</h3>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="relative">
                                            <button type="button" className="w-full cursor-pointer rounded-md bg-[#353535] px-3 py-2 text-white placeholder:text-gray-400 hover:bg-[#272727]" onClick={handleGetPasswordChangeLink}>
                                                Change Password
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="my-4 h-px w-full bg-white" />

                                <div className="mb-4 flex items-center gap-2">
                                    <Lock className="h-5 w-5 text-white" />
                                    <h3 className="text-lg font-semibold text-white">Change Email</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="relative">
                                            <button type="button" className="w-full cursor-pointer rounded-md bg-[#353535] px-3 py-2 text-white placeholder:text-gray-400 hover:bg-[#272727]" onClick={handleGetEmailChangeLink}>
                                                Change Email
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="my-4 h-px w-full bg-white" />

                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-5 w-5 text-white" />
                                        <h3 className="text-lg font-semibold text-white">Security Status</h3>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-white">Two-Factor Authentication</span>
                                            <span className="rounded-full border border-red-500 px-2 py-1 text-xs text-red-400">Disabled</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-white">Last Password Change</span>
                                            <span className="text-gray-400">30 days ago</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-white">Active Sessions</span>
                                            <span className="text-gray-400">2 devices</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <div className="mb-4 flex items-center gap-2">
                                    <Bell className="h-5 w-5 text-white" />
                                    <h3 className="text-lg font-semibold text-white">Notification Preferences</h3>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <label className="block text-white">Email Notifications</label>
                                            <p className="text-sm text-gray-400">Receive notifications via email</p>
                                        </div>
                                        <div className={`h-6 w-12 cursor-pointer rounded-full p-1 transition-colors ${notifications.emailNotifications ? 'bg-blue-600' : 'bg-gray-700'}`} onClick={() => handleNotificationChange('emailNotifications')}>
                                            <div className={`h-4 w-4 transform rounded-full bg-white transition-transform ${notifications.emailNotifications ? 'translate-x-6' : ''}`} />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <label className="block text-white">Push Notifications</label>
                                            <p className="text-sm text-gray-400">Receive push notifications in browser</p>
                                        </div>
                                        <div className={`h-6 w-12 cursor-pointer rounded-full p-1 transition-colors ${notifications.pushNotifications ? 'bg-blue-600' : 'bg-gray-700'}`} onClick={() => handleNotificationChange('pushNotifications')}>
                                            <div className={`h-4 w-4 transform rounded-full bg-white transition-transform ${notifications.pushNotifications ? 'translate-x-6' : ''}`} />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <label className="block text-white">Project Updates</label>
                                            <p className="text-sm text-gray-400">Get notified about project changes</p>
                                        </div>
                                        <div className={`h-6 w-12 cursor-pointer rounded-full p-1 transition-colors ${notifications.projectUpdates ? 'bg-blue-600' : 'bg-gray-700'}`} onClick={() => handleNotificationChange('projectUpdates')}>
                                            <div className={`h-4 w-4 transform rounded-full bg-white transition-transform ${notifications.projectUpdates ? 'translate-x-6' : ''}`} />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <label className="block text-white">Security Alerts</label>
                                            <p className="text-sm text-gray-400">Important security notifications</p>
                                        </div>
                                        <div className={`h-6 w-12 cursor-pointer rounded-full p-1 transition-colors ${notifications.securityAlerts ? 'bg-blue-600' : 'bg-gray-700'}`} onClick={() => handleNotificationChange('securityAlerts')}>
                                            <div className={`h-4 w-4 transform rounded-full bg-white transition-transform ${notifications.securityAlerts ? 'translate-x-6' : ''}`} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'account' && (
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-white">Session Management</h3>
                                <div className="rounded-lg bg-[#353535] p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-white">Sign Out</p>
                                            <p className="text-sm text-gray-400">Sign out from your current session</p>
                                        </div>
                                        <button onClick={handleSignOut} className="rounded-md bg-[#353535] px-4 py-2 text-white transition-colors hover:bg-[#3f3f3f]">
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="my-4 h-px w-full bg-gray-600" />

                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-red-400">Danger Zone</h3>
                                <div className="rounded-lg border border-red-800 bg-red-950/20 p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-white">Delete Account</p>
                                            <p className="text-sm text-gray-400">Permanently delete your account and all associated data. This action cannot be undone.</p>
                                        </div>
                                        <button onClick={handleDeleteAccount} className="flex items-center rounded-md bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete Account
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AccountSettingsPopup
