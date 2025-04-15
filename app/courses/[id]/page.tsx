import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import CourseDetail from "@/components/course-detail";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function CoursePage({
  params,
}: {
  params: { id: string };
}) {
  // Get the current user session
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/courses/" + params.id);
  }

  // Ensure params is not used directly without being awaited
  const { id } = params;
  const course = await prisma.course.findUnique({
    where: {
      id,
    },
    include: {
      modules: {
        include: {
          lessons: true,
        },
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  if (!course) {
    notFound();
  }

  // Check if user has access to this course
  if (course.userId !== session.user.id && !course.isPublic) {
    // If the course doesn't belong to the user and isn't public, redirect to dashboard
    redirect("/dashboard");
  }

  // Get user progress
  const userProgress = await prisma.userProgress.findFirst({
    where: {
      courseId: id,
    },
  });

  const progress = userProgress?.progress || 0;
  const lastLesson = userProgress?.lastLesson;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/" className="flex items-center">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to AI Tutor
          </Link>
        </Button>
      </div>

      <CourseDetail
        course={course}
        progress={progress}
        lastLesson={lastLesson}
      />
    </div>
  );
}
