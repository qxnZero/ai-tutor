import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { prisma } from "@/lib/prisma"

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { lessonId } = body

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
    })

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 })
    }

    // Create prompt for the AI
    const prompt = `
      Based on the following lesson content, generate 3-5 multiple-choice questions to test the reader's understanding.
      Each question should have 4 options with only one correct answer.
      
      Lesson title: "${lesson.title}"
      Lesson content: 
      ${lesson.content || lesson.description || "No specific content available."}
      
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
    `

    // Generate questions using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
    const result = await model.generateContent(prompt)
    const responseText = result.response.text()

    // Extract JSON from the response
    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) ||
      responseText.match(/```([\s\S]*?)```/) || [null, responseText]

    const jsonString = jsonMatch[1] || responseText

    try {
      const questions = JSON.parse(jsonString.trim())
      return NextResponse.json({ questions })
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError)

      // Fallback: Try to extract just the JSON part
      const startBracket = responseText.indexOf("[")
      const endBracket = responseText.lastIndexOf("]")

      if (startBracket !== -1 && endBracket !== -1) {
        const jsonSubstring = responseText.substring(startBracket, endBracket + 1)
        return NextResponse.json({ questions: JSON.parse(jsonSubstring) })
      }

      return NextResponse.json({ error: "Failed to parse questions" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error generating knowledge test:", error)
    return NextResponse.json({ error: "Failed to generate knowledge test" }, { status: 500 })
  }
}

