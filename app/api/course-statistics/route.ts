import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (courseId) {
      // Get statistics for a specific course
      
      // Check if course exists and user has access
      const course = await prisma.course.findFirst({
        where: {
          id: courseId,
          OR: [
            { userId: user.id },
            { isPublic: true },
          ],
        },
      });

      if (!course) {
        return NextResponse.json(
          { error: "Course not found or access denied" },
          { status: 404 }
        );
      }

      // Get total number of lessons
      const totalLessons = await prisma.lesson.count({
        where: {
          module: {
            courseId,
          },
        },
      });

      // Get number of completed lessons
      const completedLessons = await prisma.lesson.count({
        where: {
          module: {
            courseId,
          },
          completed: true,
        },
      });

      // Get average progress across all users
      const progressStats = await prisma.userProgress.aggregate({
        where: { courseId },
        _avg: { progress: true },
        _count: { userId: true },
      });

      // Get bookmark count for this course
      const bookmarkCount = await prisma.bookmark.count({
        where: {
          lesson: {
            module: {
              courseId,
            },
          },
        },
      });

      const response = {
        courseId,
        title: course.title,
        totalLessons,
        completedLessons,
        averageProgress: Math.round(progressStats._avg.progress || 0),
        userCount: progressStats._count.userId,
        bookmarkCount,
      };

      return NextResponse.json({ statistics: response });
    } else {
      // Get overall statistics for the user
      
      // Get total courses created by user
      const courseCount = await prisma.course.count({
        where: { userId: user.id },
      });

      // Get average progress across all user's courses
      const progressStats = await prisma.userProgress.aggregate({
        where: { userId: user.id },
        _avg: { progress: true },
      });

      // Get total bookmarks
      const bookmarkCount = await prisma.bookmark.count({
        where: { userId: user.id },
      });

      // Get total notes
      const noteCount = await prisma.note.count({
        where: { userId: user.id },
      });

      // Get courses with highest progress
      const topCourses = await prisma.userProgress.findMany({
        where: { userId: user.id },
        include: {
          course: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: { progress: "desc" },
        take: 5,
      });

      const formattedTopCourses = topCourses.map((progress) => ({
        courseId: progress.courseId,
        title: progress.course?.title || "Unknown Course",
        progress: progress.progress,
      }));

      const response = {
        courseCount,
        averageProgress: Math.round(progressStats._avg.progress || 0),
        bookmarkCount,
        noteCount,
        topCourses: formattedTopCourses,
      };

      return NextResponse.json({ statistics: response });
    }
  } catch (error) {
    console.error("Error fetching course statistics:", error);
    return NextResponse.json(
      { error: "Failed to fetch course statistics" },
      { status: 500 }
    );
  }
}
