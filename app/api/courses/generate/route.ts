import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateCourseContent } from "@/lib/gemini";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // Get the current user session
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    console.log("Starting course generation...");
    const body = await req.json();
    const { topic, difficulty, additionalDetails, details } = body;
    console.log("Request body:", {
      topic,
      difficulty,
      additionalDetails,
      details,
    });

    // Generate course content using Gemini
    console.log("Generating course content with Gemini...");
    const courseData = await generateCourseContent(
      topic,
      difficulty,
      additionalDetails ? details : undefined
    );
    console.log("Course content generated successfully:", {
      title: courseData.title,
    });

    // Create course in database
    console.log("Creating course in database...");
    const course = await prisma.course.create({
      data: {
        title: courseData.title,
        description: courseData.description,
        difficulty,
        topic,
        userId: session.user.id, // Associate course with the current user
        modules: {
          create: courseData.modules.map((module, moduleIndex) => ({
            title: module.title,
            description: module.description,
            order: moduleIndex,
            lessons: {
              create: module.lessons.map((lesson, lessonIndex) => ({
                title: lesson.title,
                description: lesson.summary,
                content: lesson.content,
                exercises: lesson.exercises || {},
                order: lessonIndex,
              })),
            },
          })),
        },
      },
    });
    console.log("Course created successfully:", { id: course.id });

    return NextResponse.json({ id: course.id });
  } catch (error) {
    console.error("Error generating course:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to generate course",
      },
      { status: 500 }
    );
  }
}
