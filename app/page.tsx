'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSession } from "./components/SessionContext";
import HomeTask from './components/HomeTask';

export default function Home() {
  const { session } = useSession();
  const [loading, setLoading] = useState(true);

  const getProjects = useCallback(async () => {
    setLoading(false);
  }, []);

  useEffect(() => {
    getProjects();
  }, [getProjects]);

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
      <HomeTask session={session}/>
    </div>
  );
}
