
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    console.log("GET /api/courses - Starting request");
    // Get the current user session
    const session = await getServerSession(authOptions);
    console.log("GET /api/courses - Session:", JSON.stringify(session));

    if (!session?.user) {
      console.log("GET /api/courses - No user in session");
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    // Get user from database to ensure we have the ID
    console.log(
      "GET /api/courses - Looking up user with email:",
      session.user.email
    );
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email as string,
      },
    });
    console.log(
      "GET /api/courses - User lookup result:",
      user ? `Found user with ID ${user.id}` : "User not found"
    );

    if (!user) {
      console.log("GET /api/courses - User not found in database");
      return NextResponse.json({ error: "User not found." }, { status: 401 });
    }

    // Get courses for the current user
    const courses = await prisma.course.findMany({
      where: {
        OR: [
          { userId: user.id }, // User's own courses
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
            lessons: true, // Include lessons to count them properly
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

    console.log(
      "GET /api/courses - Successfully fetched courses:",
      coursesWithProgress.length
    );
    return NextResponse.json(coursesWithProgress);
  } catch (error) {
    console.error("Error fetching courses:", error);
    // Log more detailed error information
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    // Check if it's a Prisma error
    const isPrismaError =
      error instanceof Error &&
      (error.name === "PrismaClientKnownRequestError" ||
        error.name === "PrismaClientUnknownRequestError" ||
        error.name === "PrismaClientRustPanicError" ||
        error.name === "PrismaClientInitializationError" ||
        error.name === "PrismaClientValidationError");

    if (isPrismaError) {
      console.error("Prisma error detected");
    }

    return NextResponse.json(
      {
        error: "Failed to fetch courses",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
