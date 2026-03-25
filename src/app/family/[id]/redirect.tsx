"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function FamilyRedirect({ id }: { id: string }) {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/?family=${id}`);
  }, [id, router]);

  return null;
}
