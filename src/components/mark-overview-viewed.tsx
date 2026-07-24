"use client";

import { useEffect } from "react";
import { useProgress } from "@/hooks/use-progress";

/**
 * Fire-and-forget: marks a domain/scenario overview as "read" once, on
 * mount. Renders nothing — mount this inside the corresponding server-
 * rendered overview detail page.
 */
export function MarkOverviewViewed({ itemType, itemKey }: { itemType: "DOMAIN" | "SCENARIO"; itemKey: string }) {
  const { client } = useProgress();

  useEffect(() => {
    client.markOverviewViewed(itemType, itemKey).catch(() => {
      // best-effort — a failed "mark as read" ping shouldn't disrupt reading
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemType, itemKey]);

  return null;
}
