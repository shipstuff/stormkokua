"use client";

import { useEffect } from "react";

export function FamilyRedirect({ id }: { id: string }) {
  useEffect(() => {
    // Navigate to homepage with family ID — HomePage will open the modal
    // and converge the URL back to /family/{id} via replaceState.
    // Crawlers never run JS, so they see the static OG meta instead.
    window.location.replace(`/?family=${id}`);
  }, [id]);

  return null;
}
