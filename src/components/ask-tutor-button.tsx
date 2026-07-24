"use client";

import type { ReactNode } from "react";
import { useTutorDrawer } from "./tutor-drawer-provider";

export function AskTutorButton({
  focus,
  className,
  children = "Ask the tutor",
}: {
  focus: string;
  className?: string;
  children?: ReactNode;
}) {
  const { open } = useTutorDrawer();
  return (
    <button type="button" onClick={() => open(focus)} className={className}>
      {children}
    </button>
  );
}
