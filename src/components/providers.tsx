"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";
import { TutorDrawerProvider } from "./tutor-drawer-provider";
import { TutorDrawer } from "./tutor-drawer";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <TutorDrawerProvider>
        {children}
        <TutorDrawer />
      </TutorDrawerProvider>
    </SessionProvider>
  );
}
