'use client'
import { useState, useEffect, useCallback } from 'react'
import { get_user, reset_password, delete_users } from './actions';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { edit_users } from './actions'
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';


interface EditUserProps {
    user_id: number;
    open: boolean;
    onClose: (status: boolean, message: string) => void;
}

export default function ModalEditUser({ user_id, open, onClose }: EditUserProps) {

    const [loading, setLoading] = useState(true);
    const [formError, setFormError] = useState({ username: false, first_name: false, last_name: false });
    const [rePass, setRePass] = useState(false);
    const [error, setError] = useState("");
    const [username, setUsername] = useState("");
    const [first_name, setFirstName] = useState("");
    const [last_name, setLastName] = useState("");
    const [role, setRole] = useState("member");


    const getUser = useCallback(async () => {
        const data = await get_user(user_id);
        setUsername(data?.username || "")
        setFirstName(data?.full_name?.split(" ")[0] || "")
        setLastName(data?.full_name?.split(" ").slice(1).join(" ") || "")
        setRole(data?.role || "member")
        setLoading(false)
    }, [user_id]);

    async function handleEditUser(formData: FormData) {
        const errorState = { username: !formData.get('username'), first_name: !formData.get('first_name'), last_name: !formData.get('last_name') };
        setFormError(errorState);
        if (errorState.username || errorState.first_name || errorState.last_name) {
            console.log(errorState)
            return;
        }

        try {
            const result = await edit_users(user_id, formData)
            console.log(result)
            if (!result.success) {
                setError(result.message || "Failed to edit user. Please try again.")
                return;
            }

            onClose(true, "User successfully updated.");
        } catch (error) {
            console.log("Error: ", error)
            setError("Failed to edit user. Please try again.")
        }

    }

    async function handleDeleteUser() {
        try {
            const result = await delete_users(user_id)
            console.log(result)
            if (!result.success) {
                setError(result.message || "Failed to delete user. Please try again.")
                return;
            }

            onClose(true, `User ${username} successfully deleted.`);
        } catch (error) {
            console.log("Error: ", error)
            setError("Failed to delete user. Please try again.")
        }

    }

    async function handleRePass() {
        try {
            const result = await reset_password(user_id)
            console.log(result)
            if (!result.success) {
                setError(result.message || "Failed to reset passowrd. Please try again.")
                return;
            }

            setRePass(true)
        } catch (error) {
            console.log("Error: ", error)
            setError("Failed to reset passowrd. Please try again.")
        }

    }

    useEffect(() => {
        getUser()
    }, [getUser]);

    return (
        <Dialog open={open} onClose={() => onClose(false, "")} className="relative z-10">
            <DialogBackdrop
                transition
                className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
            />

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-0 items-end justify-center p-4 text-center sm:items-center sm:p-0 md:min-h-full">
                    <DialogPanel
                        transition
                        className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 w-full sm:max-w-4xl data-closed:sm:translate-y-0 data-closed:sm:scale-95"
                    >
                        <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row sm:px-6">
                            <DialogTitle as="h3" className="text-2xl font-semibold text-gray-800">
                                Edit User {user_id}
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
                                    <ExclamationTriangleIcon aria-hidden="true" className="size-6 text-red-600 mr-5" />
                                    <div className="text-base font-semibold text-gray-900">
                                        {error.split("\n").map((line, index) => (
                                            <div key={index}>
                                                {line}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                        )}

                        {rePass && (

                            <div onClick={() => setRePass(false)} className="cursor-pointer m-5 px-4 pb-4 pt-5 sm:p-6 sm:pb-4 bg-green-100 border-2 border-gray-600 rounded-lg">
                                <div className="flex">
                                    <CheckCircleIcon aria-hidden="true" className="size-6 text-green-600 mr-5" />
                                    <div className="text-base font-semibold text-gray-900">
                                        Reset Password successfully.
                                    </div>
                                </div>
                            </div>

                        )}

                        <form className="space-y-6"
                            onSubmit={(e) => {
                                e.preventDefault()
                                const formData = new FormData(e.target as HTMLFormElement)
                                handleEditUser(formData)
                            }} >
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="grid gap-x-6 gap-y-4  grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-4">
                                    <div className="sm:col-span-2">
                                        <label htmlFor="username" className="block text-sm/6 font-medium text-gray-900">
                                            Username <span className='text-red-500'> * </span>
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                id="username"
                                                name="username"
                                                type="text"
                                                autoComplete="username"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                className={`block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6
                                                    ${formError.username ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                                            />
                                        </div>
                                    </div>
                                    <div className="sm:col-span-1">
                                        <label className="block text-sm/6 font-medium text-gray-900">
                                            Actions
                                        </label>
                                        <div className="mt-2 grid grid-cols-2 gap-12 place-content-between">
                                            <button
                                                type="button"
                                                data-autofocus
                                                onClick={() => handleRePass()}
                                                className="inline-flex w-full justify-center rounded-md bg-blue-400 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 sm:w-28"
                                            >
                                                Re-Password
                                            </button>
                                            <button
                                                type="button"
                                                data-autofocus
                                                onClick={() => handleDeleteUser()}
                                                className="inline-flex w-full justify-center rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-red-700 sm:w-18"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-5 sm:mt-0 sm:col-span-1">
                                        <div className="appearance-none forced-colors:appearance-auto grid gap-1 grid-cols-2 justify-center items-center">

                                            <label className="flex flex-col items-center justify-center">
                                                <input
                                                    className="sr-only"
                                                    type="radio"
                                                    name="role"
                                                    value="member"
                                                    checked={role == 'member'}
                                                    onChange={(e) => setRole(e.target.value)}
                                                />
                                                <img
                                                    alt="member"
                                                    src='/user.png'
                                                    className={`size-20 rounded-full border-4 ${role === 'member' ? 'border-indigo-500' : 'grayscale'
                                                        }`}
                                                />
                                                <span className={`mt-2 text-sm font-medium ${role === 'member' ? 'text-indigo-500' : 'grayscale'}`}>
                                                    Member
                                                </span>
                                            </label>
                                            <label className="flex flex-col items-center justify-center">
                                                <input
                                                    className="sr-only"
                                                    type="radio"
                                                    name="role"
                                                    value="admin"
                                                    checked={role == 'admin'}
                                                    onChange={(e) => setRole(e.target.value)}
                                                />
                                                <img
                                                    alt="admin"
                                                    src='/admin.png'
                                                    className={`size-20 rounded-full border-4 ${role === 'admin' ? 'border-indigo-500' : 'grayscale'
                                                        }`}
                                                />
                                                <span className={`mt-2 text-sm font-medium ${role === 'admin' ? 'text-indigo-500' : 'grayscale'}`}>
                                                    Admin
                                                </span>
                                            </label>

                                        </div>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label htmlFor="first_name" className="block text-sm/6 font-medium text-gray-900">
                                            First name <span className='text-red-500'> * </span>
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                id="first_name"
                                                name="first_name"
                                                type="text"
                                                autoComplete="given-name"
                                                value={first_name}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                className={`block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6
                                                    ${formError.first_name ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                                            />
                                        </div>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label htmlFor="last_name" className="block text-sm/6 font-medium text-gray-900">
                                            Last name <span className='text-red-500'> * </span>
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                id="last_name"
                                                name="last_name"
                                                type="text"
                                                autoComplete="family-name"
                                                value={last_name}
                                                onChange={(e) => setLastName(e.target.value)}
                                                className={`block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6
                                                    ${formError.last_name ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                <button
                                    type="submit"
                                    className="inline-flex w-full justify-center rounded-md bg-yellow-500 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-orange-500 sm:ml-3 sm:w-20"
                                >
                                    Edit
                                </button>
                                <button
                                    type="button"
                                    data-autofocus
                                    onClick={() => onClose(false, "")}
                                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-20"
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