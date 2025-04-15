import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import AIInstructor from "@/components/ai-instructor";
import LessonKnowledgeTest from "@/components/lesson-knowledge-test";
import LessonNotes from "@/components/lesson-notes";
import LessonBookmark from "@/components/lesson-bookmark";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function LessonPage({
  params,
}: {
  params: { id: string; lessonId: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect(
      `/auth/signin?callbackUrl=/courses/${params.id}/${params.lessonId}`
    );
  }

  const userId = session.user.id;

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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/courses/${course.id}`} className="flex items-center">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Outline
          </Link>
        </Button>
        <LessonBookmark lessonId={lesson.id} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <div className="mb-2 text-sm text-muted-foreground">
            Lesson {currentLessonIndex + 1} of {currentModule.lessons.length}
          </div>
          <h1 className="text-3xl font-bold mb-6">{lesson.title}</h1>

          <div className="prose prose-slate max-w-none">
            {lesson.content ? (
              <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
            ) : (
              <p>No content available for this lesson.</p>
            )}
          </div>

          {lesson.exercises && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-4">Practice Activities</h2>
              <div className="space-y-6">
                {Object.entries(lesson.exercises as Record<string, string>).map(
                  ([key, value], index) => (
                    <div key={index} className="space-y-2">
                      <h3 className="text-lg font-medium">
                        {index + 1}. {key}
                      </h3>
                      <p>{value}</p>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4">Summary</h2>
            <p className="text-muted-foreground">
              {lesson.description || "No summary available for this lesson."}
            </p>
          </div>

          <LessonKnowledgeTest lessonId={lesson.id} />

          <div className="mt-8 pt-8 border-t flex justify-between">
            {previousLesson ? (
              <Button variant="outline" asChild>
                <Link href={`/courses/${course.id}/${previousLesson.id}`}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous Lesson
                </Link>
              </Button>
            ) : (
              <div></div>
            )}
            {nextLesson ? (
              <Button asChild>
                <Link href={`/courses/${course.id}/${nextLesson.id}`}>
                  Next Lesson
                </Link>
              </Button>
            ) : (
              <Button asChild>
                <Link href={`/courses/${course.id}`}>Complete Course</Link>
              </Button>
            )}
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <AIInstructor
            courseId={course.id}
            lessonId={lesson.id}
            moduleName={currentModule.title}
            lessonName={lesson.title}
          />
          <LessonNotes lessonId={lesson.id} />
        </div>
      </div>
    </div>
  );
}
