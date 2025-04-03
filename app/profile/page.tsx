import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BookOpen, Clock, Award } from "lucide-react"

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/profile")
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  })

  if (!user) {
    redirect("/auth/signin")
  }

  // Get user stats
  const courseCount = await prisma.course.count({
    where: {
      userId: user.id,
    },
  })

  const bookmarkCount = await prisma.bookmark.count({
    where: {
      userId: user.id,
    },
  })

  const noteCount = await prisma.note.count({
    where: {
      userId: user.id,
    },
  })

  // Get average progress
  const userProgress = await prisma.userProgress.findMany({
    where: {
      userId: user.id,
    },
  })

  const averageProgress =
    userProgress.length > 0 ? userProgress.reduce((acc, curr) => acc + curr.progress, 0) / userProgress.length : 0

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>Your personal information</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={user.image || ""} alt={user.name || ""} />
              <AvatarFallback className="text-2xl">
                {user.name
                  ? user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                  : "U"}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-muted-foreground">{user.email}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Member since {format(new Date(user.createdAt), "MMMM yyyy")}
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="outline">Edit Profile</Button>
          </CardFooter>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Learning Statistics</CardTitle>
              <CardDescription>Your learning journey at a glance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg">
                  <BookOpen className="h-8 w-8 text-primary mb-2" />
                  <span className="text-2xl font-bold">{courseCount}</span>
                  <span className="text-sm text-muted-foreground">Courses</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg">
                  <Clock className="h-8 w-8 text-primary mb-2" />
                  <span className="text-2xl font-bold">{noteCount}</span>
                  <span className="text-sm text-muted-foreground">Notes</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg">
                  <Award className="h-8 w-8 text-primary mb-2" />
                  <span className="text-2xl font-bold">{averageProgress.toFixed(0)}%</span>
                  <span className="text-sm text-muted-foreground">Avg. Completion</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                <div>
                  <h3 className="font-medium">Email Notifications</h3>
                  <p className="text-sm text-muted-foreground">Receive updates about your courses</p>
                </div>
                <Button variant="outline">Configure</Button>
              </div>
              <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                <div>
                  <h3 className="font-medium">Change Password</h3>
                  <p className="text-sm text-muted-foreground">Update your password</p>
                </div>
                <Button variant="outline">Update</Button>
              </div>
              <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                <div>
                  <h3 className="font-medium">Delete Account</h3>
                  <p className="text-sm text-muted-foreground">Permanently delete your account</p>
                </div>
                <Button variant="destructive">Delete</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

