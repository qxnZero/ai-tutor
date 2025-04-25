import { type NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";
import { createErrorResponse, createSuccessResponse } from "@/lib/api-utils";
import { logApiRequest, logInfo, logWarning, logError } from "@/lib/logger";

// Initialize the Gemini API
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is not defined in environment variables");
}
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || "");

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

    // Create prompt for the AI with improved instructions
    const prompt = `
      You are a question generator for an educational platform. Your task is to create multiple-choice questions based on lesson content.

      INSTRUCTIONS:
      1. Generate 3-5 multiple-choice questions based on the lesson content below
      2. Each question must have 4 options with exactly one correct answer
      3. Return ONLY a valid JSON array with NO markdown formatting, NO code blocks, and NO explanations
      4. Do not include any text outside the JSON array
      5. Make sure questions test understanding, not just recall

      LESSON TITLE: "${lesson.title}"

      LESSON CONTENT:
      ${
        lesson.content || lesson.description || "No specific content available."
      }

      REQUIRED JSON FORMAT:
      [
        {
          "id": "1",
          "question": "Question text here?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": 0
        }
      ]

      CRITICAL: Your entire response must be ONLY the JSON array. Do not include any explanations, markdown formatting, or code blocks.
    `;

    // Check if API key is available
    if (!GEMINI_API_KEY) {
      logError("Missing Gemini API key", requestContext);
      return createErrorResponse(
        "Configuration error",
        500,
        "Gemini API key is not configured",
        "MISSING_API_KEY"
      );
    }

    // Generate questions using Gemini
    try {
      console.log("Initializing Gemini model...");
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      console.log("Sending prompt to Gemini API...");
      const result = await model.generateContent(prompt);

      console.log("Received response from Gemini API");
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
        // Log the raw response for debugging
        console.log("Raw response:", responseText);

        // Approach 1: Try to parse the entire response as JSON directly
        try {
          const questions = JSON.parse(responseText.trim());

          // Validate the questions format
          if (Array.isArray(questions) && questions.length > 0) {
            // Check if each question has the required fields
            const validQuestions = questions.filter(q =>
              q.id && q.question && Array.isArray(q.options) &&
              q.options.length === 4 && typeof q.correctAnswer === 'number'
            );

            if (validQuestions.length > 0) {
              return createSuccessResponse({ questions: validQuestions });
            }
          }

          console.log("Direct parsing succeeded but invalid format, trying other approaches");
        } catch (e) {
          // Not valid JSON, continue to other approaches
          console.log("Direct JSON parsing failed, trying other approaches");
        }

        // Approach 2: Extract JSON from markdown code blocks
        const jsonBlockMatch =
          responseText.match(/```(?:json)?\n([\s\S]*?)\n```/) ||
          responseText.match(/```([\s\S]*?)```/);

        if (jsonBlockMatch && jsonBlockMatch[1]) {
          const extractedJson = jsonBlockMatch[1].trim();
          try {
            const questions = JSON.parse(extractedJson);

            // Validate the questions format
            if (Array.isArray(questions) && questions.length > 0) {
              return createSuccessResponse({ questions });
            }
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

            // Validate the questions format
            if (Array.isArray(questions) && questions.length > 0) {
              return createSuccessResponse({ questions });
            }
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

          // Fix common JSON syntax errors
          jsonSubstring = jsonSubstring
            .replace(/,\s*]/g, ']') // Remove trailing commas in arrays
            .replace(/,\s*}/g, '}') // Remove trailing commas in objects
            .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?\s*:/g, '"$2":') // Ensure property names are quoted
            .replace(/:\s*'/g, ':"') // Replace single quotes with double quotes for values
            .replace(/'\s*,/g, '",') // Replace single quotes with double quotes for values
            .replace(/'\s*}/g, '"}') // Replace single quotes with double quotes for values
            .replace(/'\s*]/g, '"]'); // Replace single quotes with double quotes for values

          try {
            const questions = JSON.parse(jsonSubstring);

            // Validate the questions format
            if (Array.isArray(questions) && questions.length > 0) {
              return createSuccessResponse({ questions });
            }
          } catch (e) {
            logError("Could not parse JSON even after fixing common issues", {
              ...requestContext,
              error: e instanceof Error ? e.message : String(e)
            });
          }
        }

        // If we've reached here, all parsing attempts have failed
        // Generate fallback questions based on the lesson title
        logWarning("All parsing attempts failed, using fallback questions", requestContext);

        const fallbackQuestions = [
          {
            id: "fallback-1",
            question: `What is the main topic of "${lesson.title}"?`,
            options: [
              "Understanding core concepts",
              "Practical applications",
              "Historical background",
              "Advanced techniques"
            ],
            correctAnswer: 0
          },
          {
            id: "fallback-2",
            question: "Why is this topic important to learn?",
            options: [
              "It's fundamental to understanding the subject",
              "It's required for certification exams",
              "It's a popular interview question",
              "It's used in many real-world applications"
            ],
            correctAnswer: 3
          },
          {
            id: "fallback-3",
            question: "What would be a good next step after learning this material?",
            options: [
              "Practice with exercises",
              "Read more advanced material",
              "Apply concepts in a project",
              "All of the above"
            ],
            correctAnswer: 3
          }
        ];

        return createSuccessResponse({
          questions: fallbackQuestions,
          note: "Using fallback questions due to parsing issues"
        });
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
    } catch (geminiError) {
      logError("Error calling Gemini API", {
        ...requestContext,
        error: geminiError instanceof Error ? geminiError.message : String(geminiError)
      });
      return createErrorResponse(
        "Failed to generate questions",
        500,
        geminiError instanceof Error ? geminiError.message : "Error communicating with Gemini API",
        "GEMINI_API_ERROR"
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
