"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Loader2, Users, BookOpen, BookMarked, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

// PHP backend URL - Commented out for Render deployment
// const PHP_API_URL = "http://localhost:8000/api"

type CourseStatisticsProps = {
  courseId?: string // Optional - if not provided, shows overall stats
}

export default function CourseStatistics({ courseId }: CourseStatisticsProps) {
  const { status } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "authenticated") {
      fetchStatistics()
    } else if (status === "unauthenticated") {
      setIsLoading(false)
      setError("Please sign in to view statistics")
    }
  }, [status, courseId])

  const fetchStatistics = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // PHP API call commented out for Render deployment
      /*
      const url = courseId
        ? `${PHP_API_URL}/course-statistics?courseId=${courseId}`
        : `${PHP_API_URL}/course-statistics`

      const response = await fetch(url, {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error("Failed to fetch statistics")
      }

      const data = await response.json()
      setStats(data.statistics)

      // Record activity
      try {
        await fetch(`${PHP_API_URL}/user-activity`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: 'include',
          body: JSON.stringify({
            activityType: 'view_statistics',
            resourceId: courseId || 'overall',
            resourceType: courseId ? 'course' : 'dashboard'
          }),
        })
      } catch (activityError) {
        console.error("Failed to record activity:", activityError)
      }
      */

      // For Render deployment, we'll use mock statistics data
      // In a real implementation, you would create a Next.js API route for statistics
      setStats(courseId ? {
        totalLessons: 0,
        completedLessons: 0,
        averageProgress: 0,
        userCount: 0,
        bookmarkCount: 0
      } : {
        courseCount: 0,
        averageProgress: 0,
        bookmarkCount: 0,
        noteCount: 0,
        topCourses: []
      })

    } catch (error) {
      console.error("Error fetching statistics:", error)
      setError("Failed to load statistics")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">{courseId ? "Course Statistics" : "Learning Statistics"}</h2>
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">{courseId ? "Course Statistics" : "Learning Statistics"}</h2>
        <Card>
          <CardContent className="py-6">
            <p className="text-center text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">{courseId ? "Course Statistics" : "Learning Statistics"}</h2>
        <Card>
          <CardContent className="py-6">
            <p className="text-center text-muted-foreground">No statistics available</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Course-specific statistics
  if (courseId) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Course Statistics</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Lessons</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLessons}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedLessons}</div>
              <Progress
                value={(stats.completedLessons / stats.totalLessons) * 100}
                className="h-1.5 mt-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg. Progress</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageProgress}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.userCount} {stats.userCount === 1 ? 'user' : 'users'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Bookmarks</CardTitle>
              <BookMarked className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.bookmarkCount}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Overall statistics
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Learning Statistics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.courseCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Progress</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageProgress}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Bookmarks</CardTitle>
            <BookMarked className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.bookmarkCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Notes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.noteCount}</div>
          </CardContent>
        </Card>
      </div>

      {stats.topCourses && stats.topCourses.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Top Courses</h3>
          <div className="space-y-4">
            {stats.topCourses.map((course: any) => (
              <Card key={course.courseId}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{course.title}</h4>
                    <span className="text-sm text-muted-foreground">{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
