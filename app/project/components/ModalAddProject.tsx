'use client'
import { useState, useRef } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { add_projects } from './actions'
import { ChevronDownIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';


interface AddProjectProps {
    open: boolean;
    onClose: (status: boolean) => void;
}

export default function ModalAddProject({ open, onClose }: AddProjectProps) {

    const [formError, setFormError] = useState({ name: false, status: false });
    const [error, setError] = useState("");

    const [projectStatus, setProjectStatus] = useState('pending');
    const statusRef = useRef<HTMLSelectElement | null>(null);

    const [startDate, setStartDate] = useState<string>();
    const startDateRef = useRef<HTMLInputElement>(null!);

    const [endDate, setEndDate] = useState<string>();
    const endDateRef = useRef<HTMLInputElement>(null!);

    const handleDateClick = (ref: React.RefObject<HTMLInputElement>) => {
        if (ref.current) {
            if (typeof ref.current.showPicker === 'function') {
                ref.current.showPicker();
            } else {
                ref.current.focus();
            }
        }
    };

    const handleDate = (date: string, type: 'start' | 'end') => {
        if (type === 'start') {
            setStartDate(date);
            if (!endDate || new Date(endDate) < new Date(date)) {
                setEndDate(date);
            }
        } else if (type === 'end') {
            setEndDate(date);
        }
    };

    async function handleAddProject(formData: FormData) {
        const errorState = { name: !formData.get('name'), status: !formData.get('status') };
        setFormError(errorState);
        if (errorState.name || errorState.status) {
            console.log(errorState)
            return;
        }

        try {
            const result = await add_projects(formData)
            console.log(result)
            if (!result.success) {
                setError(result.message || "Failed to add project. Please try again.")
                return;
            }

            onClose(true);
        } catch (error) {
            console.log("Error: ", error)
            setError("Failed to add project. Please try again.")
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
                                Add New Project
                            </DialogTitle>
                        </div>

                        {error && (

                            <div onClick={() => setError("")} className="cursor-pointer m-5 px-4 pb-4 pt-5 sm:p-6 sm:pb-4 bg-red-100 border-2 border-gray-600 rounded-lg">
                                <div className="flex">
                                    <ExclamationTriangleIcon aria-hidden="true" className="size-6 text-red-600 mr-5" />
                                    <div className="text-base font-semibold text-gray-900">
                                        {error}
                                    </div>
                                </div>
                            </div>

                        )}

                        <form className="space-y-6"
                            onSubmit={(e) => {
                                e.preventDefault()
                                const formData = new FormData(e.target as HTMLFormElement)
                                handleAddProject(formData)
                            }} >
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="grid gap-x-6 gap-y-4  grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-4">
                                    <div className="sm:col-span-3">
                                        <label htmlFor="name" className="block text-sm/6 font-medium text-gray-900">
                                            Project Name <span className='text-red-500'> * </span>
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                id="name"
                                                name="name"
                                                type="text"
                                                autoComplete="name"
                                                className={`block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6
                                                    ${formError.name ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                                            />
                                        </div>
                                    </div>

                                    <div className="sm:col-span-1">
                                        <label
                                            htmlFor="status"
                                            className="block text-sm/6 font-medium text-gray-900"
                                            onClick={() => statusRef.current?.click()}
                                        >
                                            Status <span className='text-red-500'> * </span>
                                        </label>
                                        <div className="mt-2 relative w-full sm:w-26">
                                            <select
                                                id="status"
                                                name="status"
                                                ref={statusRef}
                                                value={projectStatus}
                                                onChange={(e) => setProjectStatus(e.target.value)}
                                                className="w-full appearance-none rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-base text-gray-700 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="in-progress">In Progress</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                            <ChevronDownIcon
                                                aria-hidden="true"
                                                className="pointer-events-none absolute inset-y-0 right-3 size-5 self-center text-gray-400"
                                            />
                                        </div>
                                    </div>

                                    <div className="col-span-full">
                                        <label htmlFor="description" className="block text-sm/6 font-medium text-gray-900">
                                            Description
                                        </label>
                                        <div className="mt-2">
                                            <textarea
                                                id="description"
                                                name="description"
                                                rows={3}
                                                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                                defaultValue={''}
                                            />
                                        </div>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label
                                            htmlFor="bt_start_date"
                                            className="block text-sm/6 font-medium text-gray-900"
                                        >
                                            Start Date
                                        </label>

                                        <div className="relative mt-2 h-10">
                                            <button
                                                id="bt_start_date"
                                                type="button"
                                                onClick={() => handleDateClick(startDateRef)}
                                                className="relative z-10 block w-full h-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                            >
                                                {startDate ? format(new Date(startDate), 'MMM d, yyyy') : ''}
                                            </button>

                                            <input
                                                id="start_date"
                                                name="start_date"
                                                type="date"
                                                value={endDate}
                                                ref={startDateRef}
                                                onChange={(e) => handleDate(e.target.value, 'start')}
                                                className="absolute inset-0 z-0 w-full h-full opacity-0 pointer-events-none"
                                            />
                                        </div>
                                    </div>


                                    <div className="sm:col-span-2">
                                        <label
                                            htmlFor="bt_end_date"
                                            className="block text-sm/6 font-medium text-gray-900"
                                        >
                                            End Date
                                        </label>

                                        <div className="relative mt-2 h-10">
                                            <button
                                                id="bt_end_date"
                                                type="button"
                                                onClick={() => handleDateClick(endDateRef)}
                                                className="relative z-10 block w-full h-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                            >
                                                {endDate ? format(new Date(endDate), 'MMM d, yyyy') : ''}
                                            </button>

                                            <input
                                                id="end_date"
                                                name="end_date"
                                                type="date"
                                                min={startDate}
                                                value={endDate}
                                                ref={endDateRef}
                                                onChange={(e) => handleDate(e.target.value, 'end')}
                                                className="absolute inset-0 z-0 w-full h-full opacity-0 pointer-events-none"
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