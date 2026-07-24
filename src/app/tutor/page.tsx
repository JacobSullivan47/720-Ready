"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { TutorChat } from "@/components/tutor-chat";
import { useTutorDrawer } from "@/components/tutor-drawer-provider";

function TutorPageInner() {
  const searchParams = useSearchParams();
  const focus = searchParams.get("focus");
  const { isOpen, close } = useTutorDrawer();

  // Avoid showing the same conversation twice at once if the drawer
  // happened to be open when the user navigated to the full page.
  useEffect(() => {
    if (isOpen) close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <TutorChat focus={focus} variant="page" />;
}

export default function TutorPage() {
  return (
    <Suspense>
      <TutorPageInner />
    </Suspense>
  );
}
