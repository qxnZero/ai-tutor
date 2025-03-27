import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");

const prompt = `Generate a detailed course roadmap for the following course:
Title: {title}
Description: {description}
Duration: {duration}
Difficulty: {difficulty}

Please provide a structured response in the following JSON format:
{
  "modules": [
    {
      "title": "Module Title",
      "description": "Module Description",
      "order": 1,
      "topics": [
        {
          "title": "Topic Title",
          "description": "Topic Description",
          "order": 1,
          "objectives": [
            {
              "description": "Learning Objective",
              "order": 1
            }
          ]
        }
      ]
    }
  ]
}

Make sure to:
1. Create a logical progression of modules and topics
2. Include clear learning objectives for each topic
3. Consider the difficulty level and duration when planning the content
4. Ensure the content is comprehensive and well-structured`;

export async function POST(request: Request) {
  console.log("🚀 Starting roadmap generation...");

  try {
    const body = await request.json();
    const { title, description, duration, difficulty } = body;

    console.log("📝 Request data:", {
      title,
      description,
      duration,
      difficulty,
    });

    // Test database connection first
    try {
      console.log("🔍 Testing database connection...");
      await prisma.$connect();
      console.log("✅ Database connection successful");
    } catch (dbError) {
      console.error("❌ Database connection failed:", dbError);
      return NextResponse.json(
        { error: "Database connection failed", details: dbError },
        { status: 500 }
      );
    }

    // Create the course first
    console.log("📚 Creating new course...");
    const course = await prisma.course
      .create({
        data: {
          title,
          description,
          duration,
          difficulty,
        },
      })
      .catch((error: Prisma.PrismaClientKnownRequestError | Error) => {
        console.error("❌ Failed to create course:", error);
        throw error;
      });
    console.log("✅ Course created:", course.id);

    // Generate the roadmap using Gemini
    console.log("🤖 Generating roadmap with Gemini...");
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const filledPrompt = prompt
      .replace("{title}", title)
      .replace("{description}", description)
      .replace("{duration}", duration)
      .replace("{difficulty}", difficulty);

    const result = await model.generateContent(filledPrompt);
    const response = await result.response;
    console.log("✅ Gemini response received");

    let roadmap;
    try {
      roadmap = JSON.parse(response.text());
      console.log("✅ Successfully parsed Gemini response");
    } catch (parseError) {
      console.error("❌ Failed to parse Gemini response:", parseError);
      console.log("Raw response:", response.text());
      throw new Error("Invalid response format from AI");
    }

    // Store the generated roadmap in the database
    console.log("📝 Creating modules and topics...");
    for (const moduleData of roadmap.modules) {
      console.log(`Creating module: ${moduleData.title}`);
      const module = await prisma.module
        .create({
          data: {
            title: moduleData.title,
            description: moduleData.description,
            order: moduleData.order,
            courseId: course.id,
          },
        })
        .catch((error: Prisma.PrismaClientKnownRequestError | Error) => {
          console.error("❌ Failed to create module:", error);
          throw error;
        });

      for (const topicData of moduleData.topics) {
        console.log(`Creating topic: ${topicData.title}`);
        const topic = await prisma.topic
          .create({
            data: {
              title: topicData.title,
              description: topicData.description,
              order: topicData.order,
              moduleId: module.id,
            },
          })
          .catch((error: Prisma.PrismaClientKnownRequestError | Error) => {
            console.error("❌ Failed to create topic:", error);
            throw error;
          });

        for (const objectiveData of topicData.objectives) {
          console.log(
            `Creating objective: ${objectiveData.description.substring(
              0,
              50
            )}...`
          );
          await prisma.learningObjective
            .create({
              data: {
                description: objectiveData.description,
                order: objectiveData.order,
                topicId: topic.id,
              },
            })
            .catch((error: Prisma.PrismaClientKnownRequestError | Error) => {
              console.error("❌ Failed to create learning objective:", error);
              throw error;
            });
        }
      }
    }
    console.log("✅ All modules, topics, and objectives created");

    // Fetch the complete course with all relations
    console.log("🔍 Fetching complete course data...");
    const completeCourse = await prisma.course
      .findUnique({
        where: { id: course.id },
        include: {
          modules: {
            include: {
              topics: {
                include: {
                  objectives: true,
                },
              },
            },
          },
        },
      })
      .catch((error: Prisma.PrismaClientKnownRequestError | Error) => {
        console.error("❌ Failed to fetch complete course:", error);
        throw error;
      });
    console.log("✅ Complete course data fetched");

    return NextResponse.json(completeCourse);
  } catch (error) {
    console.error("❌ Error in roadmap generation:", error);
    return NextResponse.json(
      {
        error: "Failed to generate roadmap",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    // Always disconnect from the database
    await prisma.$disconnect();
    console.log("👋 Database disconnected");
  }
}
