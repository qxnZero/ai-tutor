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

    // Get recent activity for the user
    const activities = await prisma.userActivity.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ activities });
  } catch (error) {
    console.error("Error fetching user activity:", error);
    return NextResponse.json(
      { error: "Failed to fetch user activity" },
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
    const { activityType, resourceId, resourceType } = body;

    if (!activityType) {
      return NextResponse.json(
        { error: "Activity type is required" },
        { status: 400 }
      );
    }

    // Validate activity type
    const validActivityTypes = [
      "view_course",
      "view_lesson", 
      "complete_lesson",
      "create_note",
      "create_bookmark",
      "search",
      "generate_course",
      "take_quiz",
    ];

    if (!validActivityTypes.includes(activityType)) {
      return NextResponse.json(
        { error: "Invalid activity type" },
        { status: 400 }
      );
    }

    // Validate resource type if provided
    if (resourceType) {
      const validResourceTypes = ["course", "lesson", "note", "bookmark", "quiz"];
      if (!validResourceTypes.includes(resourceType)) {
        return NextResponse.json(
          { error: "Invalid resource type" },
          { status: 400 }
        );
      }
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

    // Record the activity
    const activity = await prisma.userActivity.create({
      data: {
        userId: user.id,
        activityType,
        resourceId: resourceId || null,
        resourceType: resourceType || null,
      },
    });

    return NextResponse.json(
      {
        message: "Activity recorded",
        activity,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error recording user activity:", error);
    return NextResponse.json(
      { error: "Failed to record user activity" },
      { status: 500 }
    );
  }
}
