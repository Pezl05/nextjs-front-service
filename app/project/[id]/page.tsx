'use client'
import { useSession } from '@/app/components/SessionContext'
import ProjectInfo from './components/ProjectInfo'
import ProjectMembers from './components/ProjectMember'
import { useState, useEffect } from 'react'
import ProjectTask from './components/ProjectTask'


export default function ProjectPage({
  params,
}: {
  params: Promise<{ id: number }>
}) {

  const { session } = useSession();
  const [projectId, setProjectId] = useState<number | null>(null);

  useEffect(() => {
    const fetchProjectData = async () => {
      const id = (await params).id;
      setProjectId(id);
    };

    fetchProjectData();
  }, [params]);


  return (
    <div className="mx-auto px-1 py-5 sm:px-2 lg:px-4">

      <div className="flex justify-end mb-5">
        {session?.role == "admin" && (
          <button
            type="button"
            className="rounded-md bg-red-500 px-5 py-2 text-lg font-semibold text-white hover:text-red-500 hover:bg-slate-50"
          >
            Delete
          </button>
        )}
      </div>


      <div className="grid grid-cols-1 gap-4 sm:grid-cols-8">

        {projectId && (
          <>
            <ProjectInfo project_id={projectId} session={session} />
            <ProjectMembers project_id={projectId} session={session} />
            <ProjectTask project_id={projectId} session={session} />
          </>
        )}


      </div>

    </div>
  )
}