'use client'
import { useState } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { add_users } from './actions'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';


interface AddUserProps {
    open: boolean;
    onClose: (status: boolean) => void;
}

export default function ModalAddUser({ open, onClose }: AddUserProps) {

    const [formError, setFormError] = useState({ username: false, first_name: false, last_name: false });
    const [error, setError] = useState("");
    const [role, setRole] = useState('member');

    async function handleAddUser(formData: FormData) {
        const errorState = { username: !formData.get('username'), first_name: !formData.get('first_name'), last_name: !formData.get('last_name') };
        setFormError(errorState);
        if (errorState.username || errorState.first_name || errorState.last_name) {
            console.log(errorState)
            return;
        }

        try {
            const result = await add_users(formData)
            console.log(result)
            if (!result.success) {
                setError(result.message || "Failed to add user. Please try again.")
                return;
            }

            onClose(true);
        } catch (error) {
            console.log("Error: ", error)
            setError("Failed to add user. Please try again.")
        }

    }

    return (
        <Dialog open={open} onClose={onClose} className="relative z-10">
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
                                Add New User
                            </DialogTitle>
                        </div>

                        {error && (

                            <div onClick={() => setError("")} className="cursor-pointer m-5 px-4 pb-4 pt-5 sm:p-6 sm:pb-4 bg-red-100 border-2 border-gray-600 rounded-lg">
                                <div className="flex">
                                    <ExclamationTriangleIcon aria-hidden="true" className="size-6 text-red-600 mr-5" />
                                    <div className="text-base font-semibold text-gray-900">
                                        { error }
                                    </div>
                                </div>
                            </div>

                        )}

                        <form className="space-y-6"
                            onSubmit={(e) => {
                                e.preventDefault()
                                const formData = new FormData(e.target as HTMLFormElement)
                                handleAddUser(formData)
                            }} >
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="grid gap-x-6 gap-y-4  grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-4">
                                    <div className="sm:col-span-3">
                                        <label htmlFor="username" className="block text-sm/6 font-medium text-gray-900">
                                            Username <span className='text-red-500'> * </span>
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                id="username"
                                                name="username"
                                                type="text"
                                                autoComplete="username"
                                                className={`block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6
                                                    ${formError.username ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                                            />
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
                                                    checked={role === 'member'}
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
                                                    checked={role === 'admin'}
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
                                    className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-green-500 sm:ml-3 sm:w-20"
                                >
                                    Add
                                </button>
                                <button
                                    type="button"
                                    data-autofocus
                                    onClick={() => onClose(false)}
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