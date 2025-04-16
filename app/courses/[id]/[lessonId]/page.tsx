import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import LessonPageContent from "./LessonPageContent";
import type { Metadata } from "next";

// Generate metadata for the page
export async function generateMetadata({
  params,
}: {
  params: { id: string; lessonId: string };
}): Promise<Metadata> {
  const lesson = await prisma.lesson.findUnique({
    where: {
      id: params.lessonId,
    },
    include: {
      module: {
        include: {
          course: true,
        },
      },
    },
  });

  if (!lesson) {
    return {
      title: "Lesson Not Found",
    };
  }

  return {
    title: `${lesson.title} | ${lesson.module.course.title}`,
    description:
      lesson.description || `Learn about ${lesson.title} in this lesson.`,
  };
}

interface PageProps {
  params: { id: string; lessonId: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function LessonPage(props: PageProps) {
  const { params } = props;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect(
      `/auth/signin?callbackUrl=/courses/${params.id}/${params.lessonId}`
    );
  }

  // Get user from database to ensure we have the ID
  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email as string,
    },
  });

  if (!user) {
    redirect("/auth/signin");
  }

  const userId = user.id;

  const lesson = await prisma.lesson.findUnique({
    where: {
      id: params.lessonId,
    },
    include: {
      module: {
        include: {
          course: true,
          lessons: {
            orderBy: {
              order: "asc",
            },
          },
        },
      },
    },
  });

  if (!lesson) {
    notFound();
  }

  // Check if user has access to this course
  if (
    lesson.module.course.userId !== userId &&
    !lesson.module.course.isPublic
  ) {
    // If the course doesn't belong to the user and isn't public, redirect to dashboard
    redirect("/dashboard");
  }

  const course = lesson.module.course;
  const moduleId = lesson.moduleId;

  // Get all modules for the course
  const modules = await prisma.module.findMany({
    where: {
      courseId: course.id,
    },
    include: {
      lessons: {
        orderBy: {
          order: "asc",
        },
      },
    },
    orderBy: {
      order: "asc",
    },
  });

  // Find current lesson index and get next/previous lessons
  const currentModuleIndex = modules.findIndex((m) => m.id === moduleId);
  const currentModule = modules[currentModuleIndex];
  const currentLessonIndex = currentModule.lessons.findIndex(
    (l) => l.id === lesson.id
  );

  let nextLesson = null;
  let previousLesson = null;

  // If not the last lesson in the module
  if (currentLessonIndex < currentModule.lessons.length - 1) {
    nextLesson = currentModule.lessons[currentLessonIndex + 1];
  } else if (currentModuleIndex < modules.length - 1) {
    // If there's a next module
    nextLesson = modules[currentModuleIndex + 1].lessons[0];
  }

  // If not the first lesson in the module
  if (currentLessonIndex > 0) {
    previousLesson = currentModule.lessons[currentLessonIndex - 1];
  } else if (currentModuleIndex > 0) {
    // If there's a previous module
    const prevModule = modules[currentModuleIndex - 1];
    previousLesson = prevModule.lessons[prevModule.lessons.length - 1];
  }

  // Mark lesson as viewed/completed if user is authenticated
  if (userId) {
    await prisma.lesson.update({
      where: {
        id: lesson.id,
      },
      data: {
        completed: true,
      },
    });

    // Update user progress
    const totalLessons = modules.reduce(
      (acc, module) => acc + module.lessons.length,
      0
    );

    const completedLessons = await prisma.lesson.count({
      where: {
        module: {
          courseId: course.id,
        },
        completed: true,
      },
    });

    const progress = Math.round((completedLessons / totalLessons) * 100);

    await prisma.userProgress.upsert({
      where: {
        id: `${course.id}`,
      },
      update: {
        progress,
        lastLesson: lesson.id,
        userId,
      },
      create: {
        id: `${course.id}`,
        courseId: course.id,
        progress,
        lastLesson: lesson.id,
        userId,
      },
    });
  }

  return (
    <LessonPageContent
      lesson={lesson}
      course={course}
      currentModule={currentModule}
      currentLessonIndex={currentLessonIndex}
      nextLesson={nextLesson}
      previousLesson={previousLesson}
    />
  );
}
