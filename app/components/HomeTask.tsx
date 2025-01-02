'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { format } from 'date-fns';
import { get_tasks, delete_task, get_projects, get_projects_by_user } from '../project/components/actions';
import { ChevronDownIcon, CheckCircleIcon, PencilIcon, TrashIcon, InformationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import type { Project, Task, TaskSearch }from '../project/components/actions';
import type { Session } from './SessionContext';
import ModalEditTask from '../project/[id]/components/ModalEditTask';
import ModalDelete from './ModalDelete';
import React from 'react';

export default function HomeTask({ session }: { session: Session | null }) {

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isEdit, setIsEdit] = useState(false);
    const [tasksSearch, setTasksSearch] = useState<TaskSearch>({ start_date: format(new Date(), 'yyyy-MM-dd'), due_date: format(new Date(), 'yyyy-MM-dd') });

    const startDateRef = useRef<HTMLInputElement>(null!);

    const [projects, setProjects] = useState<Project[]>([]);

    const [taskEdit, setTaskEdit] = useState<Task | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editStatus, setEditStatus] = useState({ status: false, message: "" });

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [msgDelete, setMsgDelete] = useState("");
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const handleSearchChange = (key: keyof TaskSearch, value: string | number | number[] | Date | boolean | undefined) => {
        setTasksSearch(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const getProjects = useCallback(async () => {
        try {
            let data: Project[] = ([]);

            if (session?.role == 'admin') {
                data = await get_projects();
            } else {
                data = await get_projects_by_user(session?.user_id);
            }

            const projectIds = data.map(project => project.projectId);
            handleSearchChange("project_id", projectIds);
            setProjects(data);
        } catch (error) {
            console.error('Error fetching project data:', error);
            return null;
        }
    }, [session]);

    const getTasks = useCallback(async () => {
        try {
            const data = await get_tasks(tasksSearch);
            setTasks(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    }, [tasksSearch]);

    const handleDateClick = (ref: React.RefObject<HTMLInputElement>) => {
        if (ref.current) {
            if (typeof ref.current.showPicker === 'function') {
                ref.current.showPicker();
            } else {
                ref.current.focus();
            }
        }
    };

    const handleDate = (date: string) => {
        handleSearchChange("start_date", date);
        handleSearchChange("due_date", date);
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
        getTasks()
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
                    getTasks()
                }
            } catch (error) {
                console.log("Error: ", error)
                setError("Failed to delete task. Please try again.")
            }
        }
    };

    useEffect(() => {
        getProjects();
    }, [getProjects]);

    useEffect(() => {
        getTasks();
    }, [getTasks]);

    return (

        <>
            <div className="mb-5 pt-2 px-5 flex flex-wrap items-center gap-4 sm:flex-nowrap w-full">
                <div className="flex w-full flex-wrap items-center gap-4 sm:flex-nowrap sm:w-auto">

                    <input
                        type="text"
                        placeholder="Project Search..."
                        value={tasksSearch?.project_name || ""}
                        onChange={(e) => handleSearchChange("project_name", e.target.value)}
                        className="w-full sm:w-52 rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-base text-gray-700 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none sm:text-sm"
                    />

                    <input
                        type="text"
                        placeholder="Task Search..."
                        value={tasksSearch?.title || ""}
                        onChange={(e) => handleSearchChange("title", e.target.value)}
                        className="w-full sm:w-52 rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-base text-gray-700 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none sm:text-sm"
                    />

                    <div className="relative w-full sm:w-52">
                        <button
                            id="bt_start_date"
                            type="button"
                            onClick={() => handleDateClick(startDateRef)}
                            className="relative z-10 block w-full h-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        >
                            Date : {format((tasksSearch.start_date ? new Date(tasksSearch.start_date) : new Date()), 'MMM d, yyyy')}
                        </button>

                        <input
                            id="start_date"
                            name="start_date"
                            type="date"
                            value={tasksSearch.start_date}
                            ref={startDateRef}
                            onChange={(e) => handleDate(e.target.value)}
                            className="absolute inset-0 z-0 w-full h-full opacity-0 pointer-events-none"
                        />
                    </div>

                    <div className="relative w-full sm:w-52">
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

                    <div className="relative w-full sm:w-52">
                        <select
                            value={tasksSearch?.phase || ""}
                            onChange={(e) => handleSearchChange("phase", e.target.value)}
                            className="w-full appearance-none rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-base text-gray-700 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none sm:text-sm"
                        >
                            <option value="">All Phase</option>
                            <option value="implement">Implement</option>
                            <option value="maintanence">Maintenance</option>
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
                        {projects.length > 0 ? (
                            projects
                                .filter(project =>
                                    project.name.toLowerCase().includes(tasksSearch.project_name?.toLowerCase() || "")
                                )
                                .map((project) => {
                                    const projectTasks = tasks.filter(task => task.project_id === project.projectId);

                                    return projectTasks.length > 0 ? (
                                        <React.Fragment key={project.projectId}>
                                            <tr className="bg-gray-300">
                                                <td colSpan={7} className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">
                                                    {project.name}
                                                </td>
                                            </tr>

                                            {projectTasks.map((task, index) => (
                                                <tr key={task.task_id} className="hover:bg-gray-100">
                                                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">{index + 1}</td>
                                                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700" title={task.description || "No description available"}>{task.title}</td>
                                                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">{task.status.charAt(0).toUpperCase() + task.status.slice(1)}</td>
                                                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">{task.phase.charAt(0).toUpperCase() + task.phase.slice(1)}</td>
                                                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">{task.start_date ? format(new Date(task.start_date?.toString()), 'MMM d, yyyy') : ""}</td>
                                                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">{task.due_date ? format(new Date(task.due_date?.toString()), 'MMM d, yyyy') : ""}</td>
                                                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700 flex justify-center space-x-2">
                                                        <button className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2" onClick={() => setEdit(false, task)}>
                                                            <InformationCircleIcon className="h-5 w-5" />
                                                        </button>

                                                        {session?.role === 'admin' && (
                                                            <>
                                                                <button className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-full p-2" onClick={() => setEdit(true, task)}>
                                                                    <PencilIcon className="h-5 w-5" />
                                                                </button>
                                                                <button className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2" onClick={() => setDelete(task.title, task.task_id)}>
                                                                    <TrashIcon className="h-5 w-5" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    ) : null;
                                })
                        ) : (
                            <tr>
                                <td colSpan={7} className="border border-gray-300 px-4 py-2 text-center text-sm text-gray-500">No projects found</td>
                            </tr>
                        )}

                        {projects.length > 0 ? (
                            projects
                                .map((project) => {
                                    const projectTasks = tasks.filter(task => task.project_id === project.projectId);

                                    return projectTasks.length === 0 ? (
                                        <React.Fragment key={project.projectId}>
                                            <tr className="bg-gray-300">
                                                <td colSpan={7} className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">
                                                    {project.name}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td colSpan={7} className="border border-gray-300 px-4 py-2 text-center text-sm text-gray-500">No tasks available</td>
                                            </tr>
                                        </React.Fragment>
                                    ) : null;
                                })
                        ) : null}
                    </tbody>
                </table>
            </div>



            {showEditModal && (
                <ModalEditTask
                    isEdit={isEdit}
                    task={taskEdit}
                    open={showEditModal}
                    onClose={handleEdit}
                />
            )}

            {showDeleteModal && (
                <ModalDelete
                    message={msgDelete}
                    open={showDeleteModal}
                    onClose={handleDelete}
                />
            )}

        </>

    )
}