"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthErrorHandler() {
  const router = useRouter();

  useEffect(() => {
    // Add a global error handler for NextAuth errors
    const handleError = (event: ErrorEvent) => {
      if (
        event.error?.message?.includes("next-auth") ||
        event.error?.stack?.includes("next-auth")
      ) {
        console.log("NextAuth error detected, redirecting to signin page");
        // Redirect to signin page on NextAuth errors
        router.push("/auth/signin");
      }
    };

    window.addEventListener("error", handleError);

    return () => {
      window.removeEventListener("error", handleError);
    };
  }, [router]);

  return null;
}
