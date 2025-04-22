import { type NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";
import { createErrorResponse, createSuccessResponse } from "@/lib/api-utils";
import { logApiRequest, logInfo, logWarning, logError } from "@/lib/logger";

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  // Log the API request
  const requestContext = logApiRequest(req);

  try {
    const body = await req.json();
    const { lessonId } = body;

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
      return createErrorResponse(
        "Lesson not found",
        404,
        `No lesson found with ID: ${lessonId}`,
        "RESOURCE_NOT_FOUND"
      );
    }

    // Create prompt for the AI
    const prompt = `
      Based on the following lesson content, generate 3-5 multiple-choice questions to test the reader's understanding.
      Each question should have 4 options with only one correct answer.

      Lesson title: "${lesson.title}"
      Lesson content:
      ${
        lesson.content || lesson.description || "No specific content available."
      }

      IMPORTANT: Your response MUST be a valid JSON array with NO markdown formatting, code blocks, or explanations outside the JSON.

      Format the response as a JSON array of question objects with the following structure:
      [
        {
          "id": "1",
          "question": "Question text here?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": 0 // Index of the correct option (0-based)
        }
      ]

      Make sure the questions cover key concepts from the lesson and vary in difficulty.

      REMEMBER: Return ONLY the JSON array with no additional text, markdown formatting, or code blocks.
    `;

    // Generate questions using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Extract JSON from the response
    console.log("Raw response length:", responseText.length);

    // Log a sample of the response for debugging
    const sampleLength = 200;
    const responseSample = responseText.substring(0, sampleLength) +
      (responseText.length > sampleLength ? "..." : "");

    logInfo("Received AI response", {
      ...requestContext,
      responseSample,
      responseLength: responseText.length
    });

    // Try multiple approaches to extract valid JSON
    try {
      // Approach 1: Try to parse the entire response as JSON directly
      try {
        const questions = JSON.parse(responseText.trim());
        return createSuccessResponse({ questions });
      } catch (e) {
        // Not valid JSON, continue to other approaches
      }

      // Approach 2: Extract JSON from markdown code blocks
      const jsonBlockMatch =
        responseText.match(/```(?:json)?\n([\s\S]*?)\n```/) ||
        responseText.match(/```([\s\S]*?)```/);

      if (jsonBlockMatch && jsonBlockMatch[1]) {
        const extractedJson = jsonBlockMatch[1].trim();
        try {
          const questions = JSON.parse(extractedJson);
          return createSuccessResponse({ questions });
        } catch (e) {
          logWarning("Could not parse JSON from code block", requestContext);
        }
      }

      // Approach 3: Find the outermost JSON array in the text
      const startBracket = responseText.indexOf("[");
      const endBracket = responseText.lastIndexOf("]");

      if (startBracket !== -1 && endBracket !== -1 && endBracket > startBracket) {
        const jsonSubstring = responseText.substring(startBracket, endBracket + 1);
        try {
          const questions = JSON.parse(jsonSubstring);
          return createSuccessResponse({ questions });
        } catch (e) {
          logWarning("Could not parse JSON using bracket extraction", requestContext);
        }
      }

      // Approach 4: Try to fix common JSON issues and parse again
      if (startBracket !== -1 && endBracket !== -1 && endBracket > startBracket) {
        let jsonSubstring = responseText.substring(startBracket, endBracket + 1);

        // Replace any unescaped newlines within string values
        jsonSubstring = jsonSubstring.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, (match) => {
          return match.replace(/\n/g, "\\n");
        });

        try {
          const questions = JSON.parse(jsonSubstring);
          return createSuccessResponse({ questions });
        } catch (e) {
          logError("Could not parse JSON even after fixing common issues", {
            ...requestContext,
            error: e instanceof Error ? e.message : String(e)
          });
        }
      }

      // If we've reached here, all parsing attempts have failed
      logError("All JSON parsing approaches failed", requestContext);
      return createErrorResponse(
        "Failed to parse questions",
        500,
        "Could not extract valid JSON from the AI response",
        "AI_RESPONSE_PARSING_ERROR"
      );
    } catch (innerError) {
      logError("Error parsing JSON", {
        ...requestContext,
        error: innerError instanceof Error ? innerError.message : String(innerError)
      });
      return createErrorResponse(
        "Failed to parse questions",
        500,
        innerError instanceof Error ? innerError.message : "Unknown parsing error",
        "JSON_PARSING_ERROR"
      );
    }
  } catch (error) {
    logError("Error generating knowledge test", {
      ...requestContext,
      error: error instanceof Error ? error.message : String(error)
    });
    return createErrorResponse(
      "Failed to generate knowledge test",
      500,
      error instanceof Error ? error.message : "Unknown error during knowledge test generation",
      "KNOWLEDGE_TEST_GENERATION_ERROR"
    );
  }
}
