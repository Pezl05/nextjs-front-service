'use client'
import { useState, useEffect } from 'react'
import { useSession } from "../components/SessionContext";
import { get_projects, get_projects_by_user, Project } from './components/actions';
import { ExclamationTriangleIcon, CheckCircleIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import ModalAddProject from './components/ModalAddProject';
import Link from 'next/link';


export default function Project() {
  const { session } = useSession();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchName, setSearchName] = useState('');
  const [searchStatus, setSearchStatus] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addStatus, setAddStatus] = useState(false);


  async function handleSearch() {
    let data: Project[] = ([]);

    if (session?.role == 'admin') {
      data = await get_projects(searchName, searchStatus);
    } else {
      data = await get_projects_by_user(session?.user_id);
    }

    setProjects(data);
    setLoading(false);
  }

  const handleAddProject = (status: boolean) => {
    setAddStatus(status);
    setShowAddModal(false);
    handleSearch();
  };

  useEffect(() => {
    handleSearch()
  }, [searchName, searchStatus]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div
          className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"
          role="status">
          <span
            className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
          >Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-1 py-5 sm:px-2 lg:px-4">

      {addStatus && (

        <div onClick={() => setAddStatus(false)} className="cursor-pointer px-4 pb-4 pt-5 sm:p-6 sm:pb-4 bg-green-100 flex justify-start items-center border-2 border-gray-600 rounded-lg">
          <div className="flex items-center">
            <CheckCircleIcon aria-hidden="true" className="size-12 text-green-600 mr-5" />
            <div className="text-xl font-semibold text-gray-900">
              Project successfully added.
            </div>
          </div>
        </div>

      )}

      <div className="mb-3 flex flex-wrap items-center gap-4 sm:flex-nowrap">
        <div className="flex w-full flex-wrap items-center gap-4 sm:flex-nowrap sm:w-auto">

          <input
            type="text"
            placeholder="Search..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="flex-grow rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-base text-gray-700 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none sm:text-sm"
          />

          <div className="relative w-full sm:w-26">
            <select
              value={searchStatus}
              onChange={(e) => setSearchStatus(e.target.value)}
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

        </div>

        {session?.role == "admin" && (
          <button
            type="button"
            onClick={() => (setShowAddModal(true))}
            className="ml-auto rounded-md bg-green-500 px-5 py-2 text-lg font-semibold text-white ring-1 drop-shadow-lg ring-gray-300 ring-inset hover:text-green-500 hover:bg-slate-50"
          >
            Add
          </button>

        )}
      </div>

      <ul role="list" className="divide-y divide-gray-100 rounded-lg">

        {projects && projects.length === 0 && (
          <div className="p-5 ring-2 rounded-lg ring-black text-2xl flex justify-center items-center h-full">
            No Project Found
          </div>
        )}

        {projects
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((project) => {
            // const imageUrl = user.role === 'admin' ? '/admin.png' : '/user.png';
            const projectStartDate = format(new Date(project.startDate), 'MMM d, yyyy');
            const projectEndDate = format(new Date(project.endDate), 'MMM d, yyyy');
            const statusColor = (project.status == "completed" ? "bg-green-400" : (project.status == "in-progress" ? "bg-orange-400" : "bg-gray-400"))
            const projectStatus = (project.status == "completed" ? "Completed" : (project.status == "in-progress" ? "In Progress" : "Pending"))
            return (
              <Link href={`/project/${project.projectId}`}>
              <li
                key={project.projectId}
                // onClick={() => handleProjectInfo(project.projectId, project.name)}
                className="flex justify-between gap-x-6 py-5 px-1 py-1 sm:px-2 lg:px-4 rounded-lg group hover:bg-gray-800 cursor-pointer shadow"
              >
                
                <div className="flex min-w-0 gap-x-4">
                  {/* <img alt="" src={imageUrl} className="size-12 flex-none rounded-full bg-gray-50" /> */}
                  <div className={`size-12 flex-none rounded-full ring-2 ring-gray-900 ${statusColor}`}></div>
                  <div className="min-w-0 flex-auto">
                    <p className="text-sm/6 font-semibold text-gray-900 group-hover:text-white">{project.name}</p>
                    <p className="mt-1 truncate text-xs/5 text-gray-500 group-hover:text-slate-400">{project.description || "No Description"}</p>
                  </div>
                </div>
                <div className="hidden shrink-0 xs:flex xs:flex-col xs:items-end">
                  <p className="text-sm/6 text-gray-900 group-hover:text-white">{projectStatus}</p>
                  <p className="mt-1 text-xs/5 text-gray-500 group-hover:text-slate-400">
                    {project.startDate && project.endDate ? (
                      <>Timeline <time dateTime={projectStartDate}>{projectStartDate}</time> - <time dateTime={projectEndDate}>{projectEndDate}</time></>
                    ) : (
                      <div className='text-orange-600'>Timeline not set</div>
                    )}
                  </p>
                </div>
              </li>
              </Link>
            );
          })}
      </ul>

      {showAddModal && (
        <ModalAddProject
          open={showAddModal}
          onClose={handleAddProject}
        />
      )}

    </div>
  );
}
