import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google Generative AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateCourseRoadmap(
  topic: string,
  difficulty: string,
  additionalInfo?: string
) {
  try {
    // Get the generative model
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
    });

    // Create the prompt for generating a course roadmap
    const prompt = `
      Create a comprehensive course roadmap for learning "${topic}" at a ${difficulty} level.
      ${additionalInfo ? `Additional requirements: ${additionalInfo}` : ""}

      Format the response as a JSON object with the following structure:
      {
        "title": "Course Title",
        "description": "A brief description of the course",
        "difficulty": "${difficulty}",
        "topic": "${topic}",
        "modules": [
          {
            "title": "Module Title",
            "description": "Brief description of the module",
            "order": 1,
            "lessons": [
              {
                "title": "Lesson Title",
                "description": "Brief description of what will be covered in this lesson",
                "order": 1,
                "content": "Detailed HTML content for the lesson with proper formatting, headings, paragraphs, and code examples if applicable",
                "exercises": [
                  {
                    "title": "Exercise Title",
                    "description": "Detailed description of the exercise",
                    "code": "Sample code or starter code for the exercise if applicable"
                  }
                ]
              }
            ]
          }
        ]
      }

      Ensure the course is well-structured, comprehensive, and follows a logical learning progression.
      Include 5-8 modules with 5-8 lessons each.
      For each lesson, provide detailed content with explanations, examples, and exercises.
      Make sure all JSON is valid with no syntax errors.
    `;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract the JSON from the response
    const jsonMatch =
      text.match(/```json\n([\s\S]*?)\n```/) || text.match(/{[\s\S]*}/);

    if (jsonMatch) {
      const jsonString = jsonMatch[1] || jsonMatch[0];
      return JSON.parse(jsonString);
    } else {
      throw new Error("Failed to parse JSON from Gemini response");
    }
  } catch (error) {
    console.error("Error generating course roadmap:", error);
    throw error;
  }
}

export async function generateLessonContent(
  topic: string,
  lessonTitle: string
) {
  try {
    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Create the prompt for generating lesson content
    const prompt = `
      Create detailed content for a lesson titled "${lessonTitle}" on the topic of "${topic}".

      The content should include:
      1. A clear introduction to the lesson topic
      2. Detailed explanations with examples
      3. Code samples where appropriate
      4. Visual explanations (described in text)
      5. 3-5 exercises or practice problems

      Format the response as HTML that can be directly inserted into a lesson page.
      Include proper headings, paragraphs, code blocks, and formatting.
      Make the content engaging, educational, and appropriate for the specified difficulty level.
    `;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    return content;
  } catch (error) {
    console.error("Error generating lesson content:", error);
    throw error;
  }
}

export async function answerQuestion(question: string, lessonContext: string) {
  try {
    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Create the prompt for answering a question
    const prompt = `
      You are an AI tutor helping a student learn about "${lessonContext}".

      The student asks: "${question}"

      Provide a clear, concise, and educational answer to help the student understand.
      If the question is about code, include examples where appropriate.
      Keep your answer focused on the topic and helpful for learning.
    `;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error answering question:", error);
    throw error;
  }
}
