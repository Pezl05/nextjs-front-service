'use client'
import { useSession } from "./components/SessionContext";

export default function Home() {
  const session = useSession();
    return (
      <div>
        Home Page
        <pre>{JSON.stringify(session,null,2)}</pre>
      </div>
    );
}
