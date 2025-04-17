"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import CourseForm from "@/components/course-form";

export default function CourseFormPage() {
  const router = useRouter();

  // Check if user is authenticated (client-side)
  useEffect(() => {
    // This is a simple client-side check
    // The API will do a more thorough check
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/session");
        const session = await response.json();

        if (!session || !session.user) {
          router.push("/auth/signin?callbackUrl=/course-form");
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard" className="flex items-center">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="flex flex-col items-center justify-center text-center mb-5">
        <h1 className="text-2xl font-bold tracking-tight mb-2">
          Create a New Course
        </h1>
        <p className="text-base text-muted-foreground max-w-2xl">
          Enter a topic and our AI will generate a comprehensive course tailored to your learning needs.
        </p>
      </div>

      <CourseForm />
    </div>
  );
}
