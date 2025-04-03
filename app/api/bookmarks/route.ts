import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const bookmarkSchema = z.object({
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
    const result = bookmarkSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ message: "Invalid input data", errors: result.error.format() }, { status: 400 })
    }

    const { lessonId } = body

    // Check if lesson exists
    const lesson = await prisma.lesson.findUnique({
      where: {
        id: lessonId,
      },
    })

    if (!lesson) {
      return NextResponse.json({ message: "Lesson not found" }, { status: 404 })
    }

    // Check if bookmark already exists
    const existingBookmark = await prisma.bookmark.findFirst({
      where: {
        lessonId,
        userId: session.user.id,
      },
    })

    if (existingBookmark) {
      return NextResponse.json({ message: "Lesson already bookmarked", bookmark: existingBookmark }, { status: 200 })
    }

    // Create bookmark
    const bookmark = await prisma.bookmark.create({
      data: {
        lessonId,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ message: "Lesson bookmarked successfully", bookmark }, { status: 201 })
  } catch (error) {
    console.error("Error bookmarking lesson:", error)
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

    const bookmark = await prisma.bookmark.findFirst({
      where: {
        lessonId,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ bookmark })
  } catch (error) {
    console.error("Error fetching bookmark:", error)
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
    const bookmarkId = searchParams.get("id")

    if (!bookmarkId) {
      return NextResponse.json({ message: "Bookmark ID is required" }, { status: 400 })
    }

    // Check if bookmark exists and belongs to user
    const bookmark = await prisma.bookmark.findUnique({
      where: {
        id: bookmarkId,
      },
    })

    if (!bookmark) {
      return NextResponse.json({ message: "Bookmark not found" }, { status: 404 })
    }

    if (bookmark.userId !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Delete bookmark
    await prisma.bookmark.delete({
      where: {
        id: bookmarkId,
      },
    })

    return NextResponse.json({ message: "Bookmark removed successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error removing bookmark:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

