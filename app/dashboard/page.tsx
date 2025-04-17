import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BookOpen, Clock, Award, BookMarked } from "lucide-react";

// Loading component for dashboard sections
function DashboardLoading() {
  return (
    <div className="flex justify-center items-center h-40">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2 text-lg">Loading dashboard...</span>
    </div>
  );
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/dashboard");
  }

  // Get user from database to ensure we have the ID
  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email as string,
    },
  });

  if (!user) {
    console.log("Dashboard - User not found in database");
    redirect("/auth/signin");
  }

  console.log("Dashboard - User found:", { id: user.id, email: user.email });

  // Get user's courses
  const courses = await prisma.course.findMany({
    where: {
      userId: user.id,
    },
    include: {
      _count: {
        select: {
          modules: true,
        },
      },
      modules: {
        include: {
          _count: {
            select: {
              lessons: true,
            },
          },
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 3,
  });

  // Get progress for each course
  const coursesWithProgress = await Promise.all(
    courses.map(async (course) => {
      const progress = await prisma.userProgress.findFirst({
        where: {
          courseId: course.id,
          userId: user.id,
        },
      });

      // Count total lessons
      const totalLessons = course.modules.reduce(
        (acc, module) => acc + module._count.lessons,
        0
      );

      return {
        ...course,
        _count: {
          ...course._count,
          lessons: totalLessons,
        },
        progress: progress?.progress || 0,
      };
    })
  );

  // Get user's bookmarks
  const bookmarks = await prisma.bookmark.findMany({
    where: {
      userId: user.id,
    },
    include: {
      lesson: {
        include: {
          module: {
            include: {
              course: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  // Get user's notes
  const notes = await prisma.note.findMany({
    where: {
      userId: user.id,
    },
    include: {
      lesson: {
        include: {
          module: {
            include: {
              course: true,
            },
          },
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 3,
  });

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link href="/ai-tutor">AI Tutor</Link>
        </Button>
      </div>

      <Suspense fallback={<DashboardLoading />}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Courses
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{courses.length}</div>
              <p className="text-xs text-muted-foreground">
                {courses.length === 0
                  ? "No courses yet"
                  : `${courses.length} courses created`}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Learning Time
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {coursesWithProgress
                  .reduce((acc, course) => {
                    // Estimate 30 minutes per lesson with progress
                    return (
                      acc + course._count.lessons * 30 * (course.progress / 100)
                    );
                  }, 0)
                  .toFixed(0)}{" "}
                min
              </div>
              <p className="text-xs text-muted-foreground">
                Total learning time
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Completion Rate
              </CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {coursesWithProgress.length > 0
                  ? `${(
                      coursesWithProgress.reduce(
                        (acc, course) => acc + course.progress,
                        0
                      ) / coursesWithProgress.length
                    ).toFixed(0)}%`
                  : "0%"}
              </div>
              <p className="text-xs text-muted-foreground">
                Average course completion
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <div>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-bold">Recent Courses</h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/courses">View all</Link>
                </Button>
              </div>
              {coursesWithProgress.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground mb-4">
                      You haven&apos;t created any courses yet.
                    </p>
                    <Button asChild>
                      <Link href="/ai-tutor">
                        Try AI Tutor
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {coursesWithProgress.map((course) => (
                    <Card key={course.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold">{course.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {course._count.lessons} lessons •{" "}
                              {course.progress}% complete
                            </p>
                          </div>
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/courses/${course.id}`}>Continue</Link>
                          </Button>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-bold">Recent Notes</h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/notes">View all</Link>
                </Button>
              </div>
              {notes.length === 0 ? (
                <Card>
                  <CardContent className="py-6 text-center">
                    <p className="text-muted-foreground">
                      You haven&apos;t created any notes yet.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {notes.map((note) => (
                    <Card key={note.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold">
                              {note.lesson.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {note.lesson.module.course.title}
                            </p>
                          </div>
                          <Button size="sm" variant="outline" asChild>
                            <Link
                              href={`/courses/${note.lesson.module.courseId}/${note.lessonId}`}
                            >
                              View
                            </Link>
                          </Button>
                        </div>
                        <p className="text-sm mt-2 line-clamp-2">
                          {note.content}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="mb-4">
              <h2 className="text-xl font-bold mb-3">Bookmarks</h2>
              {bookmarks.length === 0 ? (
                <Card>
                  <CardContent className="py-6 text-center">
                    <p className="text-muted-foreground">
                      You haven&apos;t bookmarked any lessons yet.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Bookmarked Lessons</CardTitle>
                    <CardDescription>
                      Quick access to your saved lessons
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {bookmarks.map((bookmark) => (
                        <div
                          key={bookmark.id}
                          className="p-4 hover:bg-muted/50"
                        >
                          <Link
                            href={`/courses/${bookmark.lesson.module.courseId}/${bookmark.lessonId}`}
                            className="block"
                          >
                            <div className="flex items-start gap-2">
                              <BookMarked className="h-4 w-4 mt-0.5 text-primary" />
                              <div>
                                <h4 className="font-medium">
                                  {bookmark.lesson.title}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {bookmark.lesson.module.course.title}
                                </p>
                              </div>
                            </div>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
}
