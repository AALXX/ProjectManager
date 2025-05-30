import React from 'react'
import TeamDataList from '@/features/project-team-managment/Components/TeamDataList'
import type { ITeamDivisions, ITeamMember } from '@/features/project-team-managment/IProjectTeamManagement'
import { checkAccountStatus } from '@/hooks/useAccountServerSide'
import axios from 'axios'
import { notFound } from 'next/navigation'

interface ProjectData {
    TeamDivisions: ITeamDivisions[]
    TeamMembers: ITeamMember[]
}

async function getTeamData(ProjectToken: string, accessToken: string | undefined): Promise<ProjectData> {
    try {
        const response = await axios.get<ProjectData>(`${process.env.NEXT_PUBLIC_BACKEND_SERVER}/api/projects-manager/get-project-team-data/${ProjectToken}/${accessToken}`)
        return response.data
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 403) {
            throw new Error('Access Denied')
        }
        throw error
    }
}

const TeamManagementPage = async function ({ params }: { params: Promise<{ ProjectToken: string }> }) {
    const { ProjectToken } = await params
    const accountStatus = await checkAccountStatus()

    try {
        const teamData = await getTeamData(ProjectToken, accountStatus.accessToken)
        return (
            <div className="flex h-screen flex-col">
                <TeamDataList TeamData={teamData} ProjectToken={ProjectToken} userSessionToken={accountStatus.accessToken} />
            </div>
        )
    } catch (error) {
        if (error instanceof Error && error.message === 'Access Denied') {
            return (
                <div className="flex h-screen flex-col">
                    <h1 className="self-center text-white">You do not have access to this page</h1>
                </div>
            )
        }

        notFound()
    }
}

export default TeamManagementPage
