import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { generateCourseRoadmap } from "@/lib/gemini"

export async function POST(req: NextRequest) {
  try {
    const { topic, difficulty, additionalInfo } = await req.json()

    if (!topic || !difficulty) {
      return NextResponse.json({ error: "Topic and difficulty are required" }, { status: 400 })
    }

    // Generate course roadmap using Gemini
    const roadmapData = await generateCourseRoadmap(topic, difficulty, additionalInfo)

    // Create course in database
    const course = await prisma.course.create({
      data: {
        title: roadmapData.title,
        description: roadmapData.description,
        difficulty: roadmapData.difficulty,
        topic: roadmapData.topic,
        modules: {
          create: roadmapData.modules.map((module: any) => ({
            title: module.title,
            description: module.description,
            order: module.order,
            lessons: {
              create: module.lessons.map((lesson: any) => ({
                title: lesson.title,
                description: lesson.description,
                order: lesson.order,
              })),
            },
          })),
        },
      },
      include: {
        modules: {
          include: {
            lessons: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    })

    return NextResponse.json(course)
  } catch (error) {
    console.error("Error creating course:", error)
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        modules: {
          include: {
            lessons: true,
          },
        },
      },
    })

    return NextResponse.json(courses)
  } catch (error) {
    console.error("Error fetching courses:", error)
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 })
  }
}

