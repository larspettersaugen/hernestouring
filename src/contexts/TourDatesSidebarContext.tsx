'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type TourDatesSidebarContextValue = {
  rightSidebarCollapsed: boolean;
  setRightSidebarCollapsed: (collapsed: boolean) => void;
} | null;

const TourDatesSidebarContext = createContext<TourDatesSidebarContextValue>(null);

export function TourDatesSidebarProvider({ children }: { children: ReactNode }) {
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);
  return (
    <TourDatesSidebarContext.Provider value={{ rightSidebarCollapsed, setRightSidebarCollapsed }}>
      {children}
    </TourDatesSidebarContext.Provider>
  );
}

export function useTourDatesSidebar() {
  return useContext(TourDatesSidebarContext);
}
