// app/components/SessionContext.tsx

'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';

// สร้าง type สำหรับ Session
interface Session {
  user_id: number;
  role: string;
  username: string;
  full_name: string;
  email: string;
  exp: number;
}

// สร้าง context
interface SessionContextType {
  session: Session | null;
  setSession: React.Dispatch<React.SetStateAction<Session | null>>;  // เพิ่ม type สำหรับ setSession
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

// สร้าง SessionProvider
export const SessionProvider = ({ session, children }: { session: Session | null; children: ReactNode }) => {
  const [currentSession, setCurrentSession] = useState<Session | null>(session);

  useEffect(() => {
    // ตั้งค่า session ใหม่ตาม session ที่ได้จาก props
    setCurrentSession(session);
  }, [session]);

  return (
    <SessionContext.Provider value={{ session: currentSession, setSession: setCurrentSession }}>
      {children}
    </SessionContext.Provider>
  );
};

// สร้าง hook useSession สำหรับดึงข้อมูล session
export const useSession = (): SessionContextType => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
