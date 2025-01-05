'use client'
import { useSession } from '@/app/components/SessionContext'
import ProjectInfo from './components/ProjectInfo'
import ProjectMembers from './components/ProjectMember'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation';
import ProjectTask from './components/ProjectTask'
import ModalDelete from '@/app/components/ModalDelete'
import { delete_project } from '../components/actions'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export default function ProjectPage({
  params,
}: {
  params: Promise<{ id: number }>
}) {

  const router = useRouter();
  const { session } = useSession();
  const [projectId, setProjectId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  async function handleDelete(confirm: boolean) {

    if (!confirm) {
      setShowDeleteModal(false);
      return
    }

    if (projectId) {
      try {
        const result = await delete_project(projectId)
        if (!result.success) {
          setError(result.message || "Failed to delete project. Please try again.")
          setShowDeleteModal(false)
        }
        router.push("/project");
      } catch (err) {
        setShowDeleteModal(false)
        setError(`Failed to delete task. Please try again. ${err}`)
      }
    }
  };

  useEffect(() => {
    const fetchProjectData = async () => {
      const id = (await params).id;
      setProjectId(id);
    };

    fetchProjectData();
  }, [params]);


  return (
    <div className="mx-auto px-1 py-5 sm:px-2 lg:px-4">

      {error && (

        <div onClick={() => setError("")} className="cursor-pointer my-5 px-4 pb-4 pt-5 sm:p-6 sm:pb-4 bg-red-100 border-2 border-gray-600 rounded-lg">
          <div className="flex">
            <ExclamationTriangleIcon aria-hidden="true" className="size-6 text-red-600 mr-5" />
            <div className="text-base font-semibold text-gray-900">
              {error}
            </div>
          </div>
        </div>

      )}

      <div className="flex justify-end mb-5">
        {session?.role == "admin" && (
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
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

      {showDeleteModal && (
        <ModalDelete
          message={"Project"}
          open={showDeleteModal}
          onClose={handleDelete}
        />
      )}

    </div>
  )
}