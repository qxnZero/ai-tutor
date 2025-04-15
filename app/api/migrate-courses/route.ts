import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// This is a one-time migration route to assign existing courses to the current user
export async function POST() {
  try {
    // Get the current user session
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }
    
    // Find all courses without a userId
    const coursesWithoutUser = await prisma.course.findMany({
      where: {
        userId: null,
      },
    });
    
    // Update all courses to belong to the current user
    const updatePromises = coursesWithoutUser.map((course) =>
      prisma.course.update({
        where: {
          id: course.id,
        },
        data: {
          userId: session.user.id,
        },
      })
    );
    
    // Execute all updates
    await Promise.all(updatePromises);
    
    return NextResponse.json({
      message: `Successfully migrated ${coursesWithoutUser.length} courses to user ${session.user.id}`,
      count: coursesWithoutUser.length,
    });
  } catch (error) {
    console.error("Error migrating courses:", error);
    return NextResponse.json(
      { error: "Failed to migrate courses" },
      { status: 500 }
    );
  }
}
