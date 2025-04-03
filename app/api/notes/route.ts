import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const noteSchema = z.object({
  content: z.string().min(1),
  lessonId: z.string(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    // Validate input
    const result = noteSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ message: "Invalid input data", errors: result.error.format() }, { status: 400 })
    }

    const { content, lessonId } = body

    // Check if lesson exists
    const lesson = await prisma.lesson.findUnique({
      where: {
        id: lessonId,
      },
    })

    if (!lesson) {
      return NextResponse.json({ message: "Lesson not found" }, { status: 404 })
    }

    // Create or update note
    const existingNote = await prisma.note.findFirst({
      where: {
        lessonId,
        userId: session.user.id,
      },
    })

    let note
    if (existingNote) {
      note = await prisma.note.update({
        where: {
          id: existingNote.id,
        },
        data: {
          content,
        },
      })
    } else {
      note = await prisma.note.create({
        data: {
          content,
          lessonId,
          userId: session.user.id,
        },
      })
    }

    return NextResponse.json({ message: "Note saved successfully", note }, { status: 200 })
  } catch (error) {
    console.error("Error saving note:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const lessonId = searchParams.get("lessonId")

    if (!lessonId) {
      return NextResponse.json({ message: "Lesson ID is required" }, { status: 400 })
    }

    const note = await prisma.note.findFirst({
      where: {
        lessonId,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ note })
  } catch (error) {
    console.error("Error fetching note:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const noteId = searchParams.get("id")

    if (!noteId) {
      return NextResponse.json({ message: "Note ID is required" }, { status: 400 })
    }

    // Check if note exists and belongs to user
    const note = await prisma.note.findUnique({
      where: {
        id: noteId,
      },
    })

    if (!note) {
      return NextResponse.json({ message: "Note not found" }, { status: 404 })
    }

    if (note.userId !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Delete note
    await prisma.note.delete({
      where: {
        id: noteId,
      },
    })

    return NextResponse.json({ message: "Note deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting note:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

