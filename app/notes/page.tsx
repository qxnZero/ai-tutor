import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { format } from "date-fns"

export default async function NotesPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/notes")
  }

  // Get user's notes
  const notes = await prisma.note.findMany({
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
      updatedAt: "desc",
    },
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Notes</h1>
        <Button asChild>
          <Link href="/courses">Back to Courses</Link>
        </Button>
      </div>

      {notes.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">You haven&apos;t created any notes yet.</p>
            <p className="text-muted-foreground mb-4">
              Notes can be added while viewing lessons to help you remember important concepts.
            </p>
            <Button asChild>
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <Card key={note.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold">{note.lesson.title}</h3>
                    <p className="text-sm text-muted-foreground">{note.lesson.module.course.title}</p>
                  </div>
                </div>
                <div className="prose prose-sm max-w-none mb-4">
                  <p className="line-clamp-4">{note.content}</p>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(note.updatedAt), "MMM d, yyyy")}
                  </span>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/courses/${note.lesson.module.courseId}/${note.lessonId}`}>View Lesson</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

