'use client'

import React, { useEffect } from 'react'
import axios from 'axios'
import { ILeftPanel } from './ILeftPanel'
import DirectoryTree from './components/DirectoryTree'
import { stripReposPath } from '../utils'
import { useSession } from 'next-auth/react'
import { generateUniqueFileName } from './util/utils'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { setFileTree, setIsLoading, createFile, deleteFile, addFile } from '@/features/code-enviroment/lib/fileTreeSlice'

const LeftPanel: React.FC<ILeftPanel> = props => {
    const dispatch = useAppDispatch()
    const { fileTree, isLoading } = useAppSelector(state => state.files)

    const session = useSession()

    useEffect(() => {
        const fetchFileTree = async () => {
            dispatch(setIsLoading(true))
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_PROJECTS_SERVER}/api/projects/repo-tree`, {
                    params: { projectToken: props.ProjectToken }
                })
                console.log(response.data)
                dispatch(setFileTree(response.data))
            } catch (error) {
                console.error('Error fetching file tree:', error)
            } finally {
                dispatch(setIsLoading(false))
            }
        }

        fetchFileTree()
    }, [props.ProjectToken, dispatch])

    const handleFileClick = async (filePath: string) => {
        props.onFileSelect(filePath)
    }

    const handleCreateFile = async (filePath: string) => {
        const newFileName = generateUniqueFileName(fileTree, filePath, 'New File')
        dispatch(createFile({ filePath, fileName: newFileName }))
    }

    const handleAddFile = async (fileId: string, filename: string) => {
        if (dispatch(addFile({ fileId, filename, userSessionToken: session.data?.accessToken!, projectToken: props.ProjectToken }))) {
            // window.alert('File added successfully')
        } else {
            window.alert('Error adding file')
        }

   
    }

    const handleDeleteFile = async (filePath: string) => {
        const strippedPath = stripReposPath(filePath)
        console.log(strippedPath)
        console.log(session.data?.accessToken)
        dispatch(deleteFile(filePath))
    }

    return (
        <div className="flex h-full w-full flex-col overflow-hidden border-r border-[#333333] bg-[#1e1e1e] md:w-80 lg:w-[30rem]">
            <div className="flex-shrink-0 p-4">
                <h2 className="text-xl font-semibold text-white">File Tree</h2>
            </div>
            <div className="h-[38rem] flex-grow-0 overflow-auto p-4 3xl:h-[52rem]">
                {isLoading ? (
                    <div className="flex h-full items-center justify-center">
                        <div className="text-white">Loading...</div>
                    </div>
                ) : fileTree.length > 0 ? (
                    fileTree.map(node => <DirectoryTree key={node.path} node={node} onFileClick={handleFileClick} onFileAdd={handleAddFile} onFileDelete={handleDeleteFile} onFileCreate={handleCreateFile} />)
                ) : (
                    <div className="text-white">No files found</div>
                )}
            </div>
        </div>
    )
}

export default LeftPanel
