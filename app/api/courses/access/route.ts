import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasFullCourseAccess, hasModuleAccess } from "@/lib/razorpay";

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
    const moduleId = searchParams.get("moduleId");

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    // Get user with subscription info
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        subscriptionStatus: true,
        subscriptionExpiresAt: true,
        freeCoursesUsed: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if subscription has expired
    if (
      user.subscriptionStatus === "premium" &&
      user.subscriptionExpiresAt &&
      new Date(user.subscriptionExpiresAt) < new Date()
    ) {
      // Update user to free tier if subscription has expired
      await prisma.user.update({
        where: {
          id: session.user.id,
        },
        data: {
          subscriptionStatus: "free",
          subscriptionExpiresAt: null,
        },
      });
      
      user.subscriptionStatus = "free";
      user.subscriptionExpiresAt = null;
    }

    // If checking module access
    if (moduleId) {
      const module = await prisma.module.findUnique({
        where: {
          id: moduleId,
        },
        select: {
          id: true,
          order: true,
          courseId: true,
        },
      });

      if (!module) {
        return NextResponse.json(
          { error: "Module not found" },
          { status: 404 }
        );
      }

      const hasAccess = hasModuleAccess(user, courseId, module.order);

      return NextResponse.json({
        hasAccess,
        subscriptionStatus: user.subscriptionStatus,
        moduleOrder: module.order,
      });
    }

    // If checking course access
    const hasAccess = hasFullCourseAccess(user, courseId);

    // If this is the user's first course and they're accessing it fully,
    // update their freeCoursesUsed count
    if (hasAccess && user.subscriptionStatus === "free" && user.freeCoursesUsed === 0) {
      await prisma.user.update({
        where: {
          id: session.user.id,
        },
        data: {
          freeCoursesUsed: 1,
        },
      });
    }

    return NextResponse.json({
      hasAccess,
      subscriptionStatus: user.subscriptionStatus,
      freeCoursesUsed: user.freeCoursesUsed,
    });
  } catch (error) {
    console.error("Error checking access:", error);
    return NextResponse.json(
      { error: "Failed to check access" },
      { status: 500 }
    );
  }
}
