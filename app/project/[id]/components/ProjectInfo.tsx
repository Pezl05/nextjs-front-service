'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { get_project, edit_projects } from '../../components/actions';
import type { Project } from '../../components/actions';
import type { Session } from '@/app/components/SessionContext';
import { format } from 'date-fns';
import { CheckCircleIcon, ChevronDownIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { redirect } from 'next/navigation';

export default function ProjectInfo({ project_id, session }: { project_id: number, session: Session | null }) {

    const [loading, setLoading] = useState(true);
    const [canEdit, setCanEdit] = useState(false);
    const [editStatus, setEditStatus] = useState({ status: false, message: "" });

    const [formError, setFormError] = useState({ name: false, status: false });
    const [error, setError] = useState("");

    const [projectName, setProjectName] = useState("");
    const [projectDescribe, setProjectDescribe] = useState<string>("");

    const [projectStatus, setProjectStatus] = useState('pending');
    const statusRef = useRef<HTMLSelectElement | null>(null);

    const [startDate, setStartDate] = useState<string>("");
    const startDateRef = useRef<HTMLInputElement>(null!);

    const [endDate, setEndDate] = useState<string>("");
    const endDateRef = useRef<HTMLInputElement>(null!);

    const [updateDate, setUpdateDate] = useState<string>("");

    const getProject = useCallback(async () => {
        try {
            const data: Project = await get_project(project_id);
            setProjectName(data.name)
            setProjectStatus(data.status)
            setProjectDescribe(data.description)
            if (data.startDate && data.endDate) {
                setStartDate(data.startDate.toString())
                setEndDate(data.endDate.toString())
            }
            if (data.updatedAt)
                setUpdateDate(data.updatedAt.toString())

            setLoading(false)
        } catch (error) {
            console.error('Error fetching project data:', error);
            redirect('/404');
        }
    }, [project_id]);


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


    async function handleEditProject(formData: FormData) {
        const errorState = { name: !formData.get('name'), status: !formData.get('status') };
        setFormError(errorState);
        if (errorState.name || errorState.status) {
            return;
        }

        try {
            const result = await edit_projects(project_id, formData)
            if (!result.success) {
                setError(result.message || "Failed to edit project. Please try again.")
                return;
            }

            setEditStatus({ status: true, message: result.message })
            setLoading(true)
            getProject()
        } catch (error) {
            console.log("Error: ", error)
            setError("Failed to edit project. Please try again.")
        }
    }

    const handleCancle = () => {
        setCanEdit(false)
        setFormError({ name: false, status: false })
        setLoading(true)
        getProject()
    };

    useEffect(() => {
        getProject()
    }, [getProject]);

    return (


        <div className="sm:col-span-5 rounded-md border border-gray-300 bg-white p-5 text-base text-gray-700 ">

            <div className="flex justify-between mb-5 pt-2 px-5 items-stretch">
                <div className='flex flex-wrap items-center'>
                    <div className='text-xl text-2xl font-semibold'>Information</div>
                    <span className='text-[10px] xs:pt-2 xs:px-2 text-gray-300 font-light'> Updated at : {updateDate ? format((new Date(updateDate)), "MMM dd, yyyy 'at' hh:mm a") : "-"} </span>
                </div>

                {session?.role == "admin" && (
                    <button
                        type="button"
                        onClick={() => setCanEdit(true)}
                        className="self-center rounded-md bg-yellow-500 px-5 py-1 text-md font-semibold text-white hover:text-yellow-500 hover:bg-slate-50 h-10"
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

            {editStatus.status && (

                <div onClick={() => setEditStatus({ status: false, message: "" })} className="cursor-pointer m-5 px-4 pb-4 pt-5 sm:p-6 sm:pb-4 bg-green-100 flex justify-start items-center border-2 border-gray-600 rounded-lg">
                    <div className="flex items-center">
                        <CheckCircleIcon aria-hidden="true" className="size-12 text-green-600 mr-5" />
                        <div className="text-xl font-semibold text-gray-900">
                            {editStatus.message}
                        </div>
                    </div>
                </div>

            )}

            {error && (
                <div onClick={() => setError("")} className="m-5 px-4 pb-4 pt-5 sm:p-6 sm:pb-4 bg-red-100 border-2 border-gray-600 rounded-lg">
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
                    handleEditProject(formData)
                }} >
                <div className="bg-white px-5 pb-2">
                    <div className="grid gap-x-6 gap-y-4  grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-4">
                        <div className="sm:col-span-3">
                            <label htmlFor="name" className="block text-sm/6 font-medium text-gray-900">
                                Project Name {canEdit && (<span className='text-red-500'> * </span>)}
                            </label>
                            <div className="mt-2">
                                <input
                                    id="name"
                                    name="name"
                                    disabled={!canEdit}
                                    type="text"
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
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
                                Status {canEdit && (<span className='text-red-500'> * </span>)}
                            </label>
                            <div className="mt-2 relative w-full sm:w-26">
                                <select
                                    id="status"
                                    name="status"
                                    disabled={!canEdit}
                                    ref={statusRef}
                                    value={projectStatus}
                                    onChange={(e) => setProjectStatus(e.target.value)}
                                    className="w-full appearance-none rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-base text-gray-700 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                                {canEdit && (
                                    <ChevronDownIcon
                                        aria-hidden="true"
                                        className="pointer-events-none absolute inset-y-0 right-3 size-5 self-center text-gray-400"
                                    />
                                )}
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
                                    disabled={!canEdit}
                                    rows={3}
                                    value={projectDescribe || ""}
                                    onChange={(e) => setProjectDescribe(e.target.value)}
                                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
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
                                    disabled={!canEdit}
                                    onClick={() => handleDateClick(startDateRef)}
                                    className="relative z-10 block w-full h-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                >
                                    {startDate ? format(new Date(startDate), 'MMM d, yyyy') : ''}
                                </button>

                                <input
                                    id="start_date"
                                    name="start_date"
                                    disabled={!canEdit}
                                    type="date"
                                    value={startDate}
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
                                    disabled={!canEdit}
                                    className="relative z-10 block w-full h-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                >
                                    {endDate ? format(new Date(endDate), 'MMM d, yyyy') : ''}
                                </button>

                                <input
                                    id="end_date"
                                    name="end_date"
                                    disabled={!canEdit}
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
                {canEdit && (
                    <div className="px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                        <button
                            id='confirm'
                            name='confirm'
                            type="submit"
                            className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-green-500 sm:ml-3 sm:w-20"
                        >
                            Confirm
                        </button>
                        <button
                            id='cancel'
                            name='cancel'
                            type="button"
                            data-autofocus
                            onClick={handleCancle}
                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-20"
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </form>
        </div>


    )
}