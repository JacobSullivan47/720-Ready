"use client";

import { TutorChat } from "./tutor-chat";
import { useTutorDrawer } from "./tutor-drawer-provider";

export function TutorDrawer() {
  const { isOpen, focus, close } = useTutorDrawer();

  if (!isOpen) return null;

  return (
    <div
      role="complementary"
      aria-label="AI Study Tutor"
      className="fixed inset-x-0 top-16 bottom-0 z-40 w-full border-l border-border bg-surface shadow-xl sm:inset-x-auto sm:right-0 sm:w-[420px]"
    >
      <TutorChat focus={focus} variant="drawer" onClose={close} />
    </div>
  );
}
