'use client'
import { useState, useEffect } from 'react'
import { User, get_users } from '@/app/user/components/actions'
import { add_project_member, delete_project_members } from '../../components/actions'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { ProjectMember } from '../../components/actions'
import { ExclamationTriangleIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";


interface EditMemberProps {
    project_id: number;
    project_members: ProjectMember[];
    session: any;
    open: boolean;
    onClose: (edit_startus: string) => void;
}

export default function ModalEditMember({ project_id, project_members, session, open, onClose }: EditMemberProps) {

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [users, setUsers] = useState<User[]>([]);
    const [members, setMembers] = useState<number[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

    async function getUsers() {
        try {
            const data = await get_users();
            setUsers(data);

            const memberIds = project_members.map((member: ProjectMember) => member.userId.userId);
            setMembers(memberIds)

            const selectedUserIds = memberIds.map((user_id: number) => user_id);
            setSelectedUsers(selectedUserIds);

            setLoading(false);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    }

    async function handleEdirMember() {
        try {

            let failed: string[] = [];
            let success: string[] = [];

            const deleteMembers = members.filter((id) => !selectedUsers.includes(id));
            for (const user_id of deleteMembers) {
                const user = users.find((user: User) => user.user_id === user_id);
                const project_member = project_members.find((project_members: ProjectMember) => project_members.userId.userId === user_id);

                if (user && project_member) {
                    const res = await delete_project_members(project_member?.projectMemberId);

                    if (!res.success) {
                        failed.push(`Deleted : ${user.full_name}`);
                    } else {
                        success.push(`Deleted : ${user.full_name}`);
                    }

                } else {
                    failed.push(`Deleted: ${user_id} Not Found.`);
                }
            }

            const addMembers = selectedUsers.filter((id) => !members.includes(id));
            for (const user_id of addMembers) {
                const user = users.find((user: User) => user.user_id === user_id);

                if (user) {
                    const res = await add_project_member(project_id, user_id);
                    console.log(res)
                    if (!res.success) {
                        failed.push(`Added : ${user.full_name}`);
                    } else {
                        success.push(`Added : ${user.full_name}`);
                    }

                } else {
                    failed.push(`Added: ${user_id} Not Found.`);
                }
            }

            if (failed.length > 0) {
                setError(`Failed to edit members in project.\n- ${failed.join("\n- ")}`);
                return;
            }

            onClose(`${success.length > 0 ? `Successfully to edit members in project.\n- ${success.join("\n- ")}` : ""}`)

        } catch (error) {
            setError("Failed to edit members in project.");
        }
    }

    const toggleSelection = (user_id: number) => {
        setSelectedUsers((prev) =>
            prev.includes(user_id)
                ? prev.filter((id) => id !== user_id) // Remove if already selected
                : [user_id, ...prev] // Add new user at the front
        );
    };

    const isSelected = (user_id: number) => selectedUsers.includes(user_id);

    const renderUser = (user: User) => {
        const selected = isSelected(user.user_id);
        const isSessionUser = user.user_id === session?.user_id;

        return (
            <li
                key={user.user_id}
                className={`flex justify-between gap-x-6 py-5 px-1 py-1 sm:px-2 lg:px-4 rounded-lg group`}
            >
                <div className="min-w-0 flex-auto">
                    <p className={`text-sm font-semibold text-gray-900`}>{user.full_name}</p>
                    <p className={`mt-1 truncate text-xs text-gray-500`}>{user.email}</p>
                </div>
                <div className="flex items-center">
                    {!isSessionUser && !selected && (
                        <button
                            onClick={() => toggleSelection(user.user_id)}
                            className="bg-green-500 hover:bg-green-700 text-white rounded-full p-2 ml-2"
                        >
                            <PlusIcon className="h-5 w-5" />
                        </button>
                    )}
                    {!isSessionUser && selected && (
                        <button
                            onClick={() => toggleSelection(user.user_id)}
                            className="bg-red-500 hover:bg-red-700 text-white rounded-full p-2 ml-2"
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    )}
                </div>
            </li>
        );
    };

    useEffect(() => {
        getUsers()
    }, []);

    return (
        <Dialog open={open} onClose={() => onClose("")} className="relative z-10">
            <DialogBackdrop
                transition
                className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
            />

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto ">
                <div className="flex min-h-0 items-end justify-center p-4 text-center sm:items-center sm:p-0 md:min-h-full">
                    <DialogPanel
                        transition
                        className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 w-full sm:max-w-4xl data-closed:sm:translate-y-0 data-closed:sm:scale-95"
                    >
                        <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row sm:px-6">
                            <DialogTitle as="h3" className="text-2xl font-semibold text-gray-800">
                                Edit Member
                            </DialogTitle>
                        </div>

                        {loading && (
                            <div className="flex justify-center items-center mt-5">
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

                        <form className="space-y-6"
                            onSubmit={(e) => {
                                e.preventDefault()
                                handleEdirMember()
                            }} >
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 h-full">
                                <div className="flex">
                                    {/* Left side: Not selected users */}
                                    <div className="w-1/2 p-5 border-r-2">
                                        <h2 className="text-lg font-semibold mb-2">Available Users</h2>
                                        <ul role="list" className="divide-y divide-gray-100 rounded-lg max-h-80 overflow-y-auto">
                                            {users
                                                .filter((user) => !isSelected(user.user_id) && user.user_id !== session?.user_id) // Exclude selected users and session user
                                                .sort((a, b) => a.user_id === session?.user_id ? -1 : b.user_id === session?.user_id ? 1 : 0) // Sort to keep session?.user_id at the top
                                                .map((user) => renderUser(user))}
                                        </ul>
                                    </div>

                                    {/* Right side: Selected users */}
                                    <div className="w-1/2 p-5 border-l-2">
                                        <h2 className="text-lg font-semibold mb-2">Members</h2>
                                        <ul role="list" className="divide-y divide-gray-100 rounded-lg max-h-80 overflow-y-auto">
                                            {selectedUsers
                                                .map((userId) => users.find((user) => user.user_id === userId)) // Find the user by user_id
                                                .filter((user) => user !== undefined) // Filter out undefined users
                                                .map((user) => renderUser(user!)) // Force type to User
                                            }
                                        </ul>
                                    </div>
                                </div>

                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                <button
                                    type="submit"
                                    className="inline-flex w-full justify-center rounded-md bg-green-500 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-green-700 sm:ml-3 sm:w-20"
                                >
                                    Confirm
                                </button>
                                <button
                                    type="button"
                                    data-autofocus
                                    onClick={() => onClose("")}
                                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-100 sm:mt-0 sm:w-20"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    );
}