import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BookMarked } from "lucide-react"

export default async function BookmarksPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/bookmarks")
  }

  // Get user's bookmarks
  const bookmarks = await prisma.bookmark.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      lesson: {
        include: {
          module: {
            include: {
              course: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // Group bookmarks by course
  const bookmarksByCourse = bookmarks.reduce(
    (acc, bookmark) => {
      const courseId = bookmark.lesson.module.courseId
      const courseTitle = bookmark.lesson.module.course.title

      if (!acc[courseId]) {
        acc[courseId] = {
          id: courseId,
          title: courseTitle,
          bookmarks: [],
        }
      }

      acc[courseId].bookmarks.push(bookmark)
      return acc
    },
    {} as Record<string, { id: string; title: string; bookmarks: typeof bookmarks }>,
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Bookmarks</h1>
        <Button asChild>
          <Link href="/courses">Back to Courses</Link>
        </Button>
      </div>

      {bookmarks.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">You haven&apos;t bookmarked any lessons yet.</p>
            <p className="text-muted-foreground mb-4">Bookmark lessons to quickly access them later.</p>
            <Button asChild>
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.values(bookmarksByCourse).map((course) => (
            <Card key={course.id}>
              <CardHeader>
                <CardTitle>{course.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {course.bookmarks.map((bookmark) => (
                    <div key={bookmark.id} className="py-3 first:pt-0 last:pb-0">
                      <Link
                        href={`/courses/${bookmark.lesson.module.courseId}/${bookmark.lessonId}`}
                        className="flex items-start gap-3 hover:text-primary"
                      >
                        <BookMarked className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <div>
                          <h3 className="font-medium">{bookmark.lesson.title}</h3>
                          <p className="text-sm text-muted-foreground">Module: {bookmark.lesson.module.title}</p>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

