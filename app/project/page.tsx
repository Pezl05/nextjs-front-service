'use client'

import { useSession } from "../components/SessionContext";

export default function Project() {
    const session = useSession();
    return (
      <div>
        Project Page
        <pre>{JSON.stringify(session,null,2)}</pre>
      </div>
    );
}