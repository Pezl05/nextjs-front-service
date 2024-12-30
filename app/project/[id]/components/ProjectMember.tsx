'use client'
import { useState, useEffect } from 'react'
import { ProjectMember, get_project_member } from '../../components/actions'
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import ModalEditMember from '../components/ModalEditMember'


export default function ProjectMembers({ project_id, session }: { project_id: number, session: any }) {

    const [loading, setLoading] = useState(true);
    const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);

    const [showMemberModal, setShowMemberModal] = useState(false);
    const [error, setError] = useState("");
    const [editStatus, setEditStatus] = useState("");


    async function getProjectMembers() {
        try {
            const data: ProjectMember[] = await get_project_member({ project_id: project_id });
            setProjectMembers(data)
            setLoading(false)
        } catch (error) {
            console.error('Error fetching project data:', error);
            return null;
        }
    }

    const handleEditMember = (edit_startus: string) => {
        setShowMemberModal(false);
        setEditStatus(edit_startus)
        getProjectMembers();
    };

    useEffect(() => {
        getProjectMembers()
    }, []);

    return (
        <div className="sm:col-span-3 rounded-md border border-gray-300 bg-white p-5 text-base text-gray-700">

            <div className="flex justify-between mb-5 pt-2 px-5">
                <div className='self-end text-2xl font-semibold p-2'> Members </div>

                {session?.role == "admin" && (
                    <button
                        type="button"
                        onClick={() => setShowMemberModal(true)}
                        className="rounded-md bg-yellow-500 px-5 py-1 text-md font-semibold text-white hover:text-yellow-500 hover:bg-slate-50 h-10"
                    >
                        Edit
                    </button>
                )}

            </div>

            {loading && (
                <div className="flex justify-center items-center my-5">
                    <div
                        className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"
                        role="status">
                        <span
                            className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
                        >Loading...</span>
                    </div>
                </div>
            )}

            {error && (

                <div onClick={() => setError("")} className="cursor-pointer m-5 px-4 pb-4 pt-5 sm:p-6 sm:pb-4 bg-red-100 border-2 border-gray-600 rounded-lg">
                    <div className="flex">
                        <ExclamationTriangleIcon aria-hidden="true" className="size-12 text-red-600 mr-5" />
                        <div className="text-base font-semibold text-gray-900">
                            {error}
                        </div>
                    </div>
                </div>

            )}

            {editStatus && (

                <div onClick={() => setEditStatus("")} className="cursor-pointer m-5 px-4 pb-4 pt-5 sm:p-6 sm:pb-4 bg-green-100 border-2 border-gray-600 rounded-lg">
                    <div className="flex">
                        <CheckCircleIcon aria-hidden="true" className="size-12 text-green-600 mr-5" />
                        <div className="text-base font-semibold text-gray-900">
                            {editStatus.split("\n").map((line, index) => (
                                <div key={index}>
                                    {line}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            )}

            <ul role="list" className="divide-y divide-gray-100 rounded-lg px-5 overflow-auto p-2 max-h-80">
                {projectMembers.map((member) => {
                    return (
                        <li
                            key={member.userId.userId}
                            // onClick={() => openEditUser(member.user.userId)}
                            className="flex justify-between gap-x-6 py-5 px-4 rounded-lg group shadow"
                        >
                            <div className="flex min-w-0 gap-x-4">
                                <div className="min-w-0 flex-auto">
                                    <p className="text-sm/6 font-semibold text-gray-900">{member.userId.fullName}</p>
                                    <p className="mt-1 truncate text-xs/5 text-gray-500">{member.userId.username}</p>
                                </div>
                            </div>
                            <div className="shrink-0 xs:flex xs:flex-col xs:items-end">
                                <img
                                    alt={member.role}
                                    src={`/${member.role}_project.png`}
                                    className="size-12 rounded-full border-4 border-indigo-500"
                                />
                            </div>
                        </li>
                    );
                })}
            </ul>

            {/* <pre>{JSON.stringify(projectMembers, null, 2)}</pre> */}

            {showMemberModal && (
                <ModalEditMember
                    project_id={project_id}
                    project_members={projectMembers}
                    session={session}
                    open={showMemberModal}
                    onClose={handleEditMember}
                />
            )}

        </div>

    )
}