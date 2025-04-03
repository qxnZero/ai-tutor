import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

type Lesson = {
  title: string
  summary: string
  content: string
  exercises?: Record<string, string>
}

type Module = {
  title: string
  description: string
  lessons: Lesson[]
}

type CourseData = {
  title: string
  description: string
  modules: Module[]
}

export async function generateCourseContent(
  topic: string,
  difficulty: string,
  additionalDetails?: string,
): Promise<CourseData> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    const prompt = `
      Create a comprehensive learning course on "${topic}" for ${difficulty} level students.
      ${additionalDetails ? `Additional context: ${additionalDetails}` : ""}
      
      The course should include:
      1. A descriptive title
      2. A brief course description
      3. 5-7 modules, each with:
         - A clear title
         - A brief description
         - 4-6 lessons per module
      4. For each lesson:
         - A clear title
         - Detailed content with explanations, examples, and code snippets if relevant
         - A brief summary
         - 2-3 practice exercises or activities
      
      Format the response as a JSON object with the following structure:
      {
        "title": "Course Title",
        "description": "Course description",
        "modules": [
          {
            "title": "Module Title",
            "description": "Module description",
            "lessons": [
              {
                "title": "Lesson Title",
                "content": "Detailed lesson content with HTML formatting",
                "summary": "Brief lesson summary",
                "exercises": {
                  "Exercise 1 Title": "Exercise 1 description",
                  "Exercise 2 Title": "Exercise 2 description"
                }
              }
            ]
          }
        ]
      }
      
      Make sure the content is educational, accurate, and follows a logical progression from basic to more advanced concepts.
      Include practical examples and real-world applications where appropriate.
    `

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()

    // Extract JSON from the response
    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) ||
      responseText.match(/```([\s\S]*?)```/) || [null, responseText]

    const jsonString = jsonMatch[1] || responseText

    try {
      const parsedData = JSON.parse(jsonString.trim())
      return parsedData
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError)

      // Fallback: Try to extract just the JSON part
      const startBrace = responseText.indexOf("{")
      const endBrace = responseText.lastIndexOf("}")

      if (startBrace !== -1 && endBrace !== -1) {
        const jsonSubstring = responseText.substring(startBrace, endBrace + 1)
        return JSON.parse(jsonSubstring)
      }

      throw new Error("Failed to parse course data")
    }
  } catch (error) {
    console.error("Error generating course content:", error)
    throw error
  }
}

