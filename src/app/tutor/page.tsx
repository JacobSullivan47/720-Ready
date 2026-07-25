"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { TutorChat } from "@/components/tutor-chat";
import { useTutorDrawer } from "@/components/tutor-drawer-provider";

function TutorPageInner() {
  const searchParams = useSearchParams();
  const focusParam = searchParams.get("focus");
  const { isOpen, close } = useTutorDrawer();

  // A plain visit to this page (no explicit focus, e.g. via the nav bar)
  // should read as a clear new chat, not a resumed one — generate a
  // one-off id that can never match a past conversation's stored focus, so
  // the API starts a fresh conversation and shows an empty thread. It stays
  // stable for this page visit so follow-up messages keep landing in that
  // same new conversation instead of spawning another one per message.
  const [freshSessionFocus] = useState(() => `session:${crypto.randomUUID()}`);
  const focus = focusParam ?? freshSessionFocus;

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
