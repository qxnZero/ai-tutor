import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    // Get the current user session
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    // Get courses for the current user
    const courses = await prisma.course.findMany({
      where: {
        OR: [
          { userId: session.user.id }, // User's own courses
          { isPublic: true }, // Public courses
        ],
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
        createdAt: "desc",
      },
    });

    // Get progress for each course
    const coursesWithProgress = await Promise.all(
      courses.map(async (course) => {
        const progress = await prisma.userProgress.findFirst({
          where: {
            courseId: course.id,
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

    return NextResponse.json(coursesWithProgress);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}
