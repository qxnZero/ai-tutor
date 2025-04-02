import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const lessonId = params.id

    // Update the lesson as completed
    const lesson = await prisma.lesson.update({
      where: {
        id: lessonId,
      },
      data: {
        completed: true,
      },
    })

    return NextResponse.json({ success: true, lesson })
  } catch (error) {
    console.error("Error completing lesson:", error)
    return NextResponse.json({ error: "Failed to complete lesson" }, { status: 500 })
  }
}

