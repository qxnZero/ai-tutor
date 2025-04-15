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

    // Create context for the AI
    const context = `
      You are an AI instructor for the course "${lesson.module.course.title}".
      You are currently helping with the lesson "${lessonName}" in the module "${moduleName}".

      The lesson content is about:
      ${
        lesson.content || lesson.description || "No specific content available."
      }

      Answer the student's question based on this context. If you don't know the answer, suggest resources or approaches to find the information.
      Be helpful, concise, and educational in your response.
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
    console.error("Error generating AI instructor response:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
