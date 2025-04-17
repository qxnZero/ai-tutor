import { type NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, courseId, lessonId, moduleName, lessonName } = body;

    // Get the lesson content
    const lesson = await prisma.lesson.findUnique({
      where: {
        id: lessonId,
      },
      include: {
        module: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Get course information for better context
    const course = lesson.module.course;
    
    // Get other lessons in the same module for broader context
    const moduleWithLessons = await prisma.module.findUnique({
      where: {
        id: lesson.moduleId,
      },
      include: {
        lessons: {
          select: {
            title: true,
            description: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    // Create enhanced context for the AI
    const context = `
      You are a Teaching Assistant (TA) for the course "${course.title}" (${course.difficulty} level).
      You are currently helping with the lesson "${lessonName}" in the module "${moduleName}".
      
      The course is about: ${course.description}
      
      The current module covers: ${lesson.module.description || "Various topics related to " + moduleName}
      
      The current lesson content is:
      ${lesson.content || lesson.description || "No specific content available."}
      
      Other lessons in this module include:
      ${moduleWithLessons?.lessons.map(l => `- ${l.title}: ${l.description || "No description"}`).join("\\n") || "No other lessons available."}
      
      As a Teaching Assistant, your role is to:
      1. Provide clear, detailed explanations of concepts
      2. Offer examples that illustrate the concepts
      3. Answer questions with academic rigor but in an approachable way
      4. Make connections between this lesson and other parts of the course
      5. Suggest additional resources or exercises when appropriate
      
      If the student seems confused, break down complex ideas into simpler components.
      If you don't know the answer, acknowledge this and suggest how the student might find the information.
      Be encouraging, supportive, and focus on helping the student develop a deep understanding of the material.
      
      Format your responses with appropriate spacing and structure for readability.
      Use markdown formatting when it helps clarify your explanation (e.g., for code blocks, lists, or emphasis).
    `;

    // Generate response using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent([
      context,
      `Student question: ${message}`,
    ]);

    const response = result.response.text();

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Error generating Teaching Assistant response:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
