'use client'
import { useState, useEffect, useCallback } from 'react'
import type { Session } from '@/app/components/SessionContext';
import { format } from 'date-fns';
import { get_tasks, delete_task } from '../../components/actions';
import type { Task, TaskSearch } from '../../components/actions';
import { ChevronDownIcon, CheckCircleIcon, PencilIcon, TrashIcon, InformationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import ModalAddTask from './ModalAddTask';
import ModalEditTask from './ModalEditTask';
import ModalDelete from '@/app/components/ModalDelete';

export default function ProjectTask({ project_id, session }: { project_id: number, session: Session  | null }) {

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isEdit, setIsEdit] = useState(false);
    const [tasksSearch, setTasksSearch] = useState<TaskSearch>({ project_id: [project_id] });

    const [showAddModal, setShowAddModal] = useState(false);
    const [addStatus, setAddStatus] = useState("");

    const [taskEdit, setTaskEdit] = useState<Task | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editStatus, setEditStatus] = useState({ status: false, message: "" });

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [msgDelete, setMsgDelete] = useState("");
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const handleSearchChange = (key: keyof TaskSearch, value: string | number | Date | boolean | undefined) => {
        setTasksSearch(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const getProjectTasks = useCallback(async () => {
        try {
            const data: Task[] = await get_tasks(tasksSearch);
            setTasks(data)
            setLoading(false)
        } catch (error) {
            console.error('Error fetching project data:', error);
            return null;
        }
    }, [tasksSearch]);

    const handleAddTask = (status: string) => {
        setAddStatus(status);
        setShowAddModal(false);
        getProjectTasks();
    };

    const setEdit = (isEdit: boolean, task: Task) => {
        setIsEdit(isEdit)
        setTaskEdit(task)
        setShowEditModal(true)
    };

    const handleEdit = (status: boolean, msg: string) => {
        setTaskEdit(null)
        setEditStatus({ status: status, message: msg })
        setIsEdit(false)
        setShowEditModal(false)
        getProjectTasks()
    };

    const setDelete = (msg: string, task_id: number) => {
        setMsgDelete(msg)
        setDeleteId(task_id)
        setShowDeleteModal(true);
    };

    async function handleDelete(confirm: boolean) {

        if (!confirm) {
            setShowDeleteModal(false);
            return
        }

        if (deleteId) {
            try {
                const result = await delete_task(deleteId)
                if (!result.success) {
                    setError(result.message || "Failed to delete task. Please try again.")
                    setShowDeleteModal(false);
                } else {
                    setDeleteId(null)
                    setEditStatus({ status: true, message: `Task ${msgDelete} successfully deleted.` })
                    setShowDeleteModal(false);
                    getProjectTasks()
                }
            } catch (error) {
                console.log("Error: ", error)
                setError("Failed to delete task. Please try again.")
            }
        }
    };

    useEffect(() => {
        getProjectTasks()
    }, [getProjectTasks]);

    return (

        <div className="sm:col-span-8 rounded-md border border-gray-300 bg-white p-5 text-base text-gray-700 ">
            <div className="flex justify-between mb-5 pt-2 px-5 items-stretch">
                <div className='flex flex-wrap items-center'>
                    <div className='text-xl text-2xl font-semibold'>Tasks</div>
                </div>

                {session?.role == "admin" && (
                    <button
                        type="button"
                        onClick={() => setShowAddModal(true)}
                        className="self-center rounded-md bg-green-500 px-5 py-1 text-md font-semibold text-white hover:text-green-500 hover:bg-slate-50 h-10"
                    >
                        Add
                    </button>
                )}
            </div>
            <div className="mb-5 pt-2 px-5 flex flex-wrap items-center gap-4 sm:flex-nowrap">
                <div className="flex w-full flex-wrap items-center gap-4 sm:flex-nowrap sm:w-auto">

                    <div className="w-full sm:w-72 flex items-center gap-2 border border-gray-300 py-2 px-3 bg-white rounded-md focus:border-blue-500 hover:ring-2 hover:ring-blue-500 hover:outline-none sm:text-sm">
                        <input
                            id="today"
                            type="checkbox"
                            checked={tasksSearch?.today || false}
                            onChange={(e) => handleSearchChange("today", e.target.checked)}
                            className="size-5 rounded border-gray-300 text-blue-500 accent-blue-500"
                        />
                        <label htmlFor="today" className="text-gray-700 text-sm">
                            To Day
                        </label>
                    </div>

                    <input
                        type="text"
                        placeholder="Search..."
                        value={tasksSearch?.title || ""}
                        onChange={(e) => handleSearchChange("title", e.target.value)}
                        className="flex-grow rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-base text-gray-700 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none sm:text-sm"
                    />

                    <div className="relative w-full">
                        <select
                            value={tasksSearch?.status || ""}
                            onChange={(e) => handleSearchChange("status", e.target.value)}
                            className="w-full appearance-none rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-base text-gray-700 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none sm:text-sm"
                        >
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>
                        <ChevronDownIcon
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-y-0 right-3 size-5 self-center text-gray-400"
                        />
                    </div>
                    <div className="relative w-full">
                        <select
                            value={tasksSearch?.phase || ""}
                            onChange={(e) => handleSearchChange("phase", e.target.value)}
                            className="w-full appearance-none rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-base text-gray-700 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none sm:text-sm"
                        >
                            <option value="">All Phase</option>
                            <option value="implement">Implement</option>
                            <option value="maintanence">Maintanence</option>
                        </select>
                        <ChevronDownIcon
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-y-0 right-3 size-5 self-center text-gray-400"
                        />
                    </div>
                </div>
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

            {addStatus && (

                <div onClick={() => setAddStatus("")} className="cursor-pointer m-5 px-4 pb-4 pt-5 sm:p-6 sm:pb-4 bg-green-100 flex justify-start items-center border-2 border-gray-600 rounded-lg">
                    <div className="flex items-center">
                        <CheckCircleIcon aria-hidden="true" className="size-12 text-green-600 mr-5" />
                        <div className="text-xl font-semibold text-gray-900">
                            {addStatus}
                        </div>
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


            <div className="mb-5 pt-2 px-5">
                <table className="min-w-full table-auto border-collapse border border-gray-300 shadow-sm">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">No.</th>
                            <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">Title</th>
                            <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
                            <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">Phase</th>
                            <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">Start Date</th>
                            <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">Due Date</th>
                            <th className="border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.length > 0 ? (
                            tasks.map((task, index) => (
                                <tr key={task.task_id} className="hover:bg-gray-100">
                                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">{index + 1}</td>
                                    <td
                                        className="border border-gray-300 px-4 py-2 text-sm text-gray-700"
                                        title={task.description || "No description available"}
                                    >
                                        {task.title}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">{task.status.charAt(0).toUpperCase() + task.status.slice(1)}</td>
                                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">{task.phase.charAt(0).toUpperCase() + task.phase.slice(1)}</td>
                                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">
                                        {task.start_date ? format(new Date(task.start_date?.toString()), 'MMM d, yyyy') : ""}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">
                                        {task.due_date ? format(new Date(task.due_date?.toString()), 'MMM d, yyyy') : ""}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700 flex justify-center space-x-2">
                                        <button
                                            className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2"
                                            onClick={() => setEdit(false, task)}
                                        >
                                            <InformationCircleIcon className="h-5 w-5" />
                                        </button>

                                        {session?.role === 'admin' && (
                                            <>
                                                <button
                                                    className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-full p-2"
                                                    onClick={() => setEdit(true, task)}
                                                >
                                                    <PencilIcon className="h-5 w-5" />
                                                </button>
                                                <button
                                                    className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2"
                                                    onClick={() => setDelete(task.title, task.task_id)}
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={7}
                                    className="border border-gray-300 px-4 py-2 text-center text-sm text-gray-500"
                                >
                                    No tasks found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>


            {showAddModal && (
                <ModalAddTask
                    project_id={project_id}
                    create_by={session?.user_id || 0}
                    open={showAddModal}
                    onClose={handleAddTask}
                />
            )}

            {showDeleteModal && (
                <ModalDelete
                    message={msgDelete}
                    open={showDeleteModal}
                    onClose={handleDelete}
                />
            )}

            {showEditModal && (
                <ModalEditTask
                    isEdit={isEdit}
                    task={taskEdit}
                    open={showEditModal}
                    onClose={handleEdit}
                />
            )}

        </div>

    )
}