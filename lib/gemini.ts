import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

/**
 * Type definitions for course data structure
 */
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

/**
 * Creates a fallback course structure with minimal content
 * @param title - Course title extracted from response or default
 * @param description - Course description extracted from response or default
 * @returns A minimal valid course structure
 */
function createFallbackCourse(title: string, description: string): CourseData {
  return {
    title,
    description,
    modules: [
      {
        title: "Module 1: Introduction",
        description: "Introduction to the course",
        lessons: [
          {
            title: "Lesson 1: Getting Started",
            content: "This is the content for the first lesson.",
            summary: "A brief introduction",
            exercises: {
              "Exercise 1": "Try to implement a simple example",
              "Exercise 2": "Explain the core concepts"
            }
          }
        ]
      }
    ]
  };
}

/**
 * Attempts to parse JSON using various approaches
 * @param responseText - The raw text response from Gemini
 * @returns Parsed CourseData object
 * @throws Error if all parsing approaches fail
 */
function parseJsonResponse(responseText: string): CourseData {
  // Approach 1: Direct JSON parsing
  try {
    return JSON.parse(responseText.trim());
  } catch (e) {
    // Continue to next approach
  }

  // Approach 2: Extract from markdown code blocks
  const jsonBlockMatch =
    responseText.match(/```(?:json)?\n([\s\S]*?)\n```/) ||
    responseText.match(/```([\s\S]*?)```/);

  if (jsonBlockMatch && jsonBlockMatch[1]) {
    try {
      return JSON.parse(jsonBlockMatch[1].trim());
    } catch (e) {
      // Continue to next approach
    }
  }

  // Find JSON object boundaries for subsequent approaches
  const startBrace = responseText.indexOf("{");
  const endBrace = responseText.lastIndexOf("}");

  // Only proceed if we found valid JSON boundaries
  if (startBrace === -1 || endBrace === -1 || endBrace <= startBrace) {
    // Extract whatever we can and create a fallback
    const titleMatch = responseText.match(/"title":\s*"([^"]+)"/);
    const descMatch = responseText.match(/"description":\s*"([^"]+)"/);
    return createFallbackCourse(
      titleMatch ? titleMatch[1] : "Generated Course",
      descMatch ? descMatch[1] : "A course generated with AI"
    );
  }

  // Extract the potential JSON substring
  let jsonSubstring = responseText.substring(startBrace, endBrace + 1);

  // Approach 3: Basic JSON extraction
  try {
    return JSON.parse(jsonSubstring);
  } catch (e) {
    // Continue to next approach
  }

  // Approach 4: Fix common JSON issues
  try {
    // Replace unescaped newlines in string values
    const fixedJson = jsonSubstring.replace(
      /"([^"\\]*(\\.[^"\\]*)*)"/g,
      (match: string) => match.replace(/\n/g, "\\n")
    );

    // Also escape HTML tags in content fields
    const htmlEscapedJson = fixedJson.replace(
      /"content":\s*"([^"]*)"/g,
      (_match, content) => {
        // Replace < and > with their escaped versions, but only outside of code blocks
        const escapedContent = content
          .replace(/</g, "\\u003c")
          .replace(/>/g, "\\u003e");
        return `"content":"${escapedContent}"`;
      }
    );

    return JSON.parse(htmlEscapedJson);
  } catch (e) {
    // Continue to next approach
  }

  // Approach 5: Balance braces and brackets
  try {
    const openBraces = (jsonSubstring.match(/{/g) || []).length;
    const closeBraces = (jsonSubstring.match(/}/g) || []).length;
    const openBrackets = (jsonSubstring.match(/\[/g) || []).length;
    const closeBrackets = (jsonSubstring.match(/\]/g) || []).length;

    let balancedJson = jsonSubstring;
    if (openBraces > closeBraces) {
      balancedJson += "}".repeat(openBraces - closeBraces);
    }
    if (openBrackets > closeBrackets) {
      balancedJson += "]".repeat(openBrackets - closeBrackets);
    }

    return JSON.parse(balancedJson);
  } catch (e) {
    // Continue to fallback approach
  }

  // Approach 6: Advanced extraction for complex HTML content
  try {
    // Extract the title and description
    const titleMatch = responseText.match(/"title":\s*"([^"]+)"/);
    const descMatch = responseText.match(/"description":\s*"([^"]+)"/);

    // Extract modules array
    const modulesMatch = responseText.match(/"modules":\s*(\[\s*\{[\s\S]*?\}\s*\])/);

    if (titleMatch && descMatch && modulesMatch) {
      // Try to parse just the modules array
      try {
        const modulesArray = JSON.parse(modulesMatch[1]);

        // Construct a valid course object
        return {
          title: titleMatch[1],
          description: descMatch[1],
          modules: modulesArray
        };
      } catch (e) {
        // If modules parsing fails, continue to next approach
      }
    }

    // Try to extract individual modules
    const moduleMatches = responseText.match(/"title":\s*"([^"]+)"[\s\S]*?"description":\s*"([^"]+)"[\s\S]*?"lessons":\s*(\[\s*\{[\s\S]*?\}\s*\])/g);

    if (titleMatch && descMatch && moduleMatches && moduleMatches.length > 0) {
      const modules = [];

      for (const moduleText of moduleMatches) {
        const moduleTitleMatch = moduleText.match(/"title":\s*"([^"]+)"/);
        const moduleDescMatch = moduleText.match(/"description":\s*"([^"]+)"/);
        const lessonsMatch = moduleText.match(/"lessons":\s*(\[\s*\{[\s\S]*?\}\s*\])/);

        if (moduleTitleMatch && moduleDescMatch && lessonsMatch) {
          try {
            const lessons = JSON.parse(lessonsMatch[1]);
            modules.push({
              title: moduleTitleMatch[1],
              description: moduleDescMatch[1],
              lessons: lessons
            });
          } catch (e) {
            // If lessons parsing fails, add a module with empty lessons
            modules.push({
              title: moduleTitleMatch[1],
              description: moduleDescMatch[1],
              lessons: []
            });
          }
        }
      }

      if (modules.length > 0) {
        return {
          title: titleMatch[1],
          description: descMatch[1],
          modules: modules
        };
      }
    }
  } catch (e) {
    // Continue to final fallback approach
  }

  // Approach 7: Extract key fields and create fallback structure
  const titleMatch = responseText.match(/"title":\s*"([^"]+)"/);
  const descMatch = responseText.match(/"description":\s*"([^"]+)"/);

  // Try to extract at least some module titles for a better fallback
  const moduleTitles = responseText.match(/"title":\s*"([^"]+)"/g);

  if (titleMatch && descMatch && moduleTitles && moduleTitles.length > 2) {
    // First title is course title, others could be module titles
    const modules = [];

    // Create at least 3 modules with basic structure
    for (let i = 1; i < Math.min(moduleTitles.length, 6); i++) {
      const moduleTitle = moduleTitles[i].match(/"title":\s*"([^"]+)"/);
      if (moduleTitle) {
        modules.push({
          title: moduleTitle[1],
          description: `Module ${i} of the course`,
          lessons: [
            {
              title: `Lesson 1: Introduction to ${moduleTitle[1]}`,
              content: "Content will be available soon.",
              summary: "A brief introduction to the topic"
            }
          ]
        });
      }
    }

    if (modules.length > 0) {
      return {
        title: titleMatch[1],
        description: descMatch[1],
        modules: modules
      };
    }
  }

  // Final fallback if all else fails
  return createFallbackCourse(
    titleMatch ? titleMatch[1] : "Generated Course",
    descMatch ? descMatch[1] : "A course generated with AI"
  );
}

/**
 * Generates course content using Gemini AI
 * @param topic - The course topic
 * @param difficulty - The difficulty level (Beginner, Intermediate, Advanced)
 * @param additionalDetails - Optional additional context for course generation
 * @returns A structured course object
 */
export async function generateCourseContent(
  topic: string,
  difficulty: string,
  additionalDetails?: string
): Promise<CourseData> {
  try {
    // Initialize Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Construct the prompt
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

      CRITICAL FORMATTING INSTRUCTIONS:
      1. For lesson content, you can use HTML tags like <h1>, <p>, <code>, <pre>, <ul>, <li>, etc. to format the content
      2. When using HTML in the content field, make sure to properly escape quotes within HTML attributes
      3. All HTML tags must be properly closed and nested
      4. For code examples, wrap them in <pre><code> tags
      5. The entire response must be valid JSON - all quotes must be properly escaped
      6. Do not use triple backticks or markdown formatting - use HTML instead

      REMEMBER: Return ONLY the JSON object with no additional text, markdown formatting, or code blocks.
    `;

    // Generate content
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Log response samples for debugging
    if (process.env.NODE_ENV === 'development') {
      const sampleLength = 200;
      console.log("Raw response length:", responseText.length);
      console.log(
        "Response sample (first 200 chars):",
        responseText.substring(0, sampleLength) + (responseText.length > sampleLength ? "..." : "")
      );
      console.log(
        "Response sample (last 200 chars):",
        (responseText.length > sampleLength ? "..." : "") +
        responseText.substring(Math.max(0, responseText.length - sampleLength))
      );
    }

    // Parse the response using our robust parsing function
    return parseJsonResponse(responseText);
  } catch (error) {
    console.error("Error generating course content:", error);
    throw error;
  }
}
