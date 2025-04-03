import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"
import CourseDetail from "@/components/course-detail"

export default async function CoursePage({
  params,
}: {
  params: { id: string }
}) {
  const course = await prisma.course.findUnique({
    where: {
      id: params.id,
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

  if (!course) {
    notFound()
  }

  // Get user progress
  const userProgress = await prisma.userProgress.findFirst({
    where: {
      courseId: params.id,
    },
  })

  const progress = userProgress?.progress || 0
  const lastLesson = userProgress?.lastLesson

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/" className="flex items-center">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to AI Tutor
          </Link>
        </Button>
      </div>

      <CourseDetail course={course} progress={progress} lastLesson={lastLesson} />
    </div>
  )
}

