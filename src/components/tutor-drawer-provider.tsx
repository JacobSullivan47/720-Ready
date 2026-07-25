"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

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
  const pathname = usePathname();
  const openedOnPathname = useRef(pathname);

  const open = useCallback(
    (newFocus?: string) => {
      openedOnPathname.current = pathname;
      setFocus(newFocus ?? null);
      setIsOpen(true);
    },
    [pathname],
  );

  const close = useCallback(() => setIsOpen(false), []);

  // The drawer is scoped to whatever question/domain it was opened for, not
  // a persistent chat — close it automatically once the user navigates away
  // from that page instead of letting it silently follow them around the app.
  useEffect(() => {
    if (pathname !== openedOnPathname.current) {
      setIsOpen(false);
    }
  }, [pathname]);

  const value = useMemo(() => ({ isOpen, focus, open, close }), [isOpen, focus, open, close]);

  return <TutorDrawerContext.Provider value={value}>{children}</TutorDrawerContext.Provider>;
}

export function useTutorDrawer(): TutorDrawerState {
  const ctx = useContext(TutorDrawerContext);
  if (!ctx) throw new Error("useTutorDrawer must be used within a TutorDrawerProvider");
  return ctx;
}
