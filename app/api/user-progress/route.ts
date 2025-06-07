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

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

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

    // Get user progress for the course
    let progress = await prisma.userProgress.findFirst({
      where: {
        courseId,
        userId: user.id,
      },
    });

    // If no progress found, return default progress
    if (!progress) {
      progress = {
        id: "",
        courseId,
        userId: user.id,
        progress: 0,
        lastLesson: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return NextResponse.json({ progress });
  } catch (error) {
    console.error("Error fetching user progress:", error);
    return NextResponse.json(
      { error: "Failed to fetch user progress" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { courseId, progress, lastLesson } = body;

    if (!courseId || progress === undefined) {
      return NextResponse.json(
        { error: "Course ID and progress are required" },
        { status: 400 }
      );
    }

    // Validate progress is a number between 0 and 100
    if (typeof progress !== "number" || progress < 0 || progress > 100) {
      return NextResponse.json(
        { error: "Progress must be a number between 0 and 100" },
        { status: 400 }
      );
    }

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

    // Verify course exists and user has access
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

    // Check if progress already exists
    const existingProgress = await prisma.userProgress.findFirst({
      where: {
        courseId,
        userId: user.id,
      },
    });

    let updatedProgress;

    if (existingProgress) {
      // Update existing progress
      updatedProgress = await prisma.userProgress.update({
        where: { id: existingProgress.id },
        data: {
          progress,
          lastLesson,
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        message: "Progress updated",
        progress: updatedProgress,
      });
    } else {
      // Create new progress record
      updatedProgress = await prisma.userProgress.create({
        data: {
          courseId,
          userId: user.id,
          progress,
          lastLesson,
        },
      });

      return NextResponse.json(
        {
          message: "Progress created",
          progress: updatedProgress,
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Error updating user progress:", error);
    return NextResponse.json(
      { error: "Failed to update user progress" },
      { status: 500 }
    );
  }
}
