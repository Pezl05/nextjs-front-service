'use client'
import { useState, useEffect, useRef } from 'react'
import { useSession } from "./components/SessionContext";
import { ChevronDownIcon } from '@heroicons/react/24/outline';


export default function Home() {
  const { session } = useSession();
  const [loading, setLoading] = useState(true);

  async function getProjects() {
    setLoading(false);
  }

  useEffect(() => {
    getProjects();
  }, []);

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
    <div>
      Home Page
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </div>
  );
}
