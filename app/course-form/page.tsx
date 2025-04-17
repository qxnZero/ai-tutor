"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CourseFormPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new AI Tutor page
    router.push("/ai-tutor");
  }, [router]);

  return null; // No UI needed as we're redirecting
}
