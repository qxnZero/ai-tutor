"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Loader2, Clock, BookOpen, FileText, BookMarked, Search, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import Link from "next/link"

// PHP backend URL - Commented out for Render deployment
// const PHP_API_URL = "http://localhost:8000/api"

export default function UserActivityFeed() {
  const { status } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [activities, setActivities] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "authenticated") {
      fetchActivities()
    } else if (status === "unauthenticated") {
      setIsLoading(false)
      setError("Please sign in to view your activity")
    }
  }, [status])

  const fetchActivities = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // PHP API call commented out for Render deployment
      /*
      const response = await fetch(`${PHP_API_URL}/user-activity`, {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error("Failed to fetch activities")
      }

      const data = await response.json()
      setActivities(data.activities || [])
      */

      // For Render deployment, we'll use an empty array since user activity
      // is only implemented in PHP backend
      setActivities([])
      // Alternatively, you could implement a Next.js API route for user activity
    } catch (error) {
      console.error("Error fetching activities:", error)
      setError("Failed to load activity feed")
    } finally {
      setIsLoading(false)
    }
  }

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'view_course':
        return <BookOpen className="h-4 w-4" />
      case 'view_lesson':
        return <FileText className="h-4 w-4" />
      case 'complete_lesson':
        return <CheckCircle className="h-4 w-4" />
      case 'create_note':
        return <FileText className="h-4 w-4" />
      case 'create_bookmark':
        return <BookMarked className="h-4 w-4" />
      case 'search':
        return <Search className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getActivityText = (activity: any) => {
    switch (activity.activityType) {
      case 'view_course':
        return `Viewed course`
      case 'view_lesson':
        return `Viewed lesson`
      case 'complete_lesson':
        return `Completed lesson`
      case 'create_note':
        return `Created a note`
      case 'create_bookmark':
        return `Bookmarked a lesson`
      case 'search':
        return `Searched for content`
      default:
        return `Performed an action`
    }
  }

  const getActivityLink = (activity: any) => {
    if (!activity.resourceId) return null

    switch (activity.resourceType) {
      case 'course':
        return `/courses/${activity.resourceId}`
      case 'lesson':
        // This assumes the lesson ID contains the course ID in the URL structure
        // You may need to adjust this based on your actual URL structure
        if (activity.resourceId.includes('/')) {
          const [courseId, lessonId] = activity.resourceId.split('/')
          return `/courses/${courseId}/${lessonId}`
        }
        return null
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Recent Activity</h2>
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Recent Activity</h2>
        <Card>
          <CardContent className="py-6">
            <p className="text-center text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Recent Activity</h2>
        <Card>
          <CardContent className="py-6">
            <p className="text-center text-muted-foreground">No recent activity found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Recent Activity</h2>
      <Card>
        <CardHeader>
          <CardTitle>Your Learning Journey</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {activities.map((activity) => {
              const activityLink = getActivityLink(activity)
              const activityDate = new Date(activity.createdAt)
              const content = (
                <div className="flex items-start">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    {getActivityIcon(activity.activityType)}
                  </div>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium">{getActivityText(activity)}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(activityDate, 'PPp')}
                    </p>
                  </div>
                </div>
              )

              return (
                <div key={activity.id} className="relative pl-8 before:absolute before:left-3.5 before:top-8 before:h-[calc(100%-24px)] before:w-px before:bg-muted">
                  {activityLink ? (
                    <Link href={activityLink} className="block hover:opacity-80">
                      {content}
                    </Link>
                  ) : (
                    content
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
