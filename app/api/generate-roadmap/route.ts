import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
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
  try {
    const body = await request.json();
    const { title, description, duration, difficulty } = body;

    // Create the course first
    const course = await prisma.course.create({
      data: {
        title,
        description,
        duration,
        difficulty,
      },
    });

    // Generate the roadmap using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const filledPrompt = prompt
      .replace("{title}", title)
      .replace("{description}", description)
      .replace("{duration}", duration)
      .replace("{difficulty}", difficulty);

    const result = await model.generateContent(filledPrompt);
    const response = await result.response;
    const roadmap = JSON.parse(response.text());

    // Store the generated roadmap in the database
    for (const moduleData of roadmap.modules) {
      const module = await prisma.module.create({
        data: {
          title: moduleData.title,
          description: moduleData.description,
          order: moduleData.order,
          courseId: course.id,
        },
      });

      for (const topicData of moduleData.topics) {
        const topic = await prisma.topic.create({
          data: {
            title: topicData.title,
            description: topicData.description,
            order: topicData.order,
            moduleId: module.id,
          },
        });

        for (const objectiveData of topicData.objectives) {
          await prisma.learningObjective.create({
            data: {
              description: objectiveData.description,
              order: objectiveData.order,
              topicId: topic.id,
            },
          });
        }
      }
    }

    // Fetch the complete course with all relations
    const completeCourse = await prisma.course.findUnique({
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
    });

    return NextResponse.json(completeCourse);
  } catch (error) {
    console.error("Error generating roadmap:", error);
    return NextResponse.json(
      { error: "Failed to generate roadmap" },
      { status: 500 }
    );
  }
}
