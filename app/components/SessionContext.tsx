'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';

interface Session {
  user_id: number;
  role: string;
  username: string;
  full_name: string;
  email: string;
  exp: number;
}

interface SessionContextType {
  session: Session | null;
  setSession: React.Dispatch<React.SetStateAction<Session | null>>; 
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({ session, children }: { session: Session | null; children: ReactNode }) => {
  const [currentSession, setCurrentSession] = useState<Session | null>(session);

  useEffect(() => {
    setCurrentSession(session);
  }, [session]);

  return (
    <SessionContext.Provider value={{ session: currentSession, setSession: setCurrentSession }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = (): SessionContextType => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
