import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

type Lesson = {
  title: string;
  summary: string;
  content: string;
  exercises?: Record<string, string>;
};

type Module = {
  title: string;
  description: string;
  lessons: Lesson[];
};

type CourseData = {
  title: string;
  description: string;
  modules: Module[];
};

export async function generateCourseContent(
  topic: string,
  difficulty: string,
  additionalDetails?: string
): Promise<CourseData> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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

      IMPORTANT: Your response MUST be a valid JSON object with NO markdown formatting, code blocks, or explanations outside the JSON.

      The JSON structure should be exactly as follows:
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

      REMEMBER: Return ONLY the JSON object with no additional text, markdown formatting, or code blocks.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Extract JSON from the response
    console.log("Raw response length:", responseText.length);

    // Log a sample of the response for debugging
    const sampleLength = 200;
    console.log(
      "Response sample (first 200 chars):",
      responseText.substring(0, sampleLength) +
        (responseText.length > sampleLength ? "..." : "")
    );
    console.log(
      "Response sample (last 200 chars):",
      (responseText.length > sampleLength ? "..." : "") +
        responseText.substring(Math.max(0, responseText.length - sampleLength))
    );

    // Try multiple approaches to extract valid JSON
    try {
      // Approach 1: Try to parse the entire response as JSON directly
      try {
        return JSON.parse(responseText.trim());
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
          return JSON.parse(extractedJson);
        } catch (e) {
          console.log("Could not parse JSON from code block");
        }
      }

      // Approach 3: Find the outermost JSON object in the text
      const startBrace = responseText.indexOf("{");
      const endBrace = responseText.lastIndexOf("}");

      if (startBrace !== -1 && endBrace !== -1 && endBrace > startBrace) {
        const jsonSubstring = responseText.substring(startBrace, endBrace + 1);
        try {
          return JSON.parse(jsonSubstring);
        } catch (e) {
          console.log("Could not parse JSON using brace extraction");
        }
      }

      // Approach 4: Try to fix common JSON issues and parse again
      // This handles cases where there might be unescaped quotes or newlines in strings
      if (startBrace !== -1 && endBrace !== -1 && endBrace > startBrace) {
        let jsonSubstring = responseText.substring(startBrace, endBrace + 1);

        // Replace any unescaped newlines within string values
        jsonSubstring = jsonSubstring.replace(
          /"([^"\\]*(\\.[^"\\]*)*)"/g,
          (match) => {
            return match.replace(/\n/g, "\\n");
          }
        );

        try {
          return JSON.parse(jsonSubstring);
        } catch (e) {
          console.error(
            "Could not parse JSON even after fixing common issues:",
            e
          );
        }
      }

      // If we've reached here, all parsing attempts have failed
      console.error("All JSON parsing approaches failed");
      throw new Error(
        "Failed to parse course data: Could not extract valid JSON from the response"
      );
    } catch (error) {
      console.error("Error extracting or parsing JSON:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error generating course content:", error);
    throw error;
  }
}
