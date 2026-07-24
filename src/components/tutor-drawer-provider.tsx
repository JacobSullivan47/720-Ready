"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

interface TutorDrawerState {
  isOpen: boolean;
  focus: string | null;
  open: (focus?: string) => void;
  close: () => void;
}

const TutorDrawerContext = createContext<TutorDrawerState | null>(null);

export function TutorDrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [focus, setFocus] = useState<string | null>(null);

  const open = useCallback((newFocus?: string) => {
    setFocus(newFocus ?? null);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo(() => ({ isOpen, focus, open, close }), [isOpen, focus, open, close]);

  return <TutorDrawerContext.Provider value={value}>{children}</TutorDrawerContext.Provider>;
}

export function useTutorDrawer(): TutorDrawerState {
  const ctx = useContext(TutorDrawerContext);
  if (!ctx) throw new Error("useTutorDrawer must be used within a TutorDrawerProvider");
  return ctx;
}
