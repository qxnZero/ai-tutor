"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Loader2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

// PHP backend URL
const PHP_API_URL = "http://localhost:8000/api"

type ProgressTrackerProps = {
  courseId: string
  initialProgress?: number
  lastLesson?: string | null
}

export default function ProgressTracker({ courseId, initialProgress = 0, lastLesson = null }: ProgressTrackerProps) {
  const { data: session, status } = useSession()
  const [progress, setProgress] = useState(initialProgress)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "authenticated") {
      fetchProgress()
    } else if (status === "unauthenticated") {
      setIsLoading(false)
    }
  }, [status, courseId])

  const fetchProgress = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${PHP_API_URL}/user-progress?courseId=${courseId}`, {
        credentials: 'include',
      })
      const data = await response.json()

      if (data.progress) {
        setProgress(data.progress.progress)
      } else {
        setProgress(initialProgress)
      }
    } catch (error) {
      console.error("PHP API error:", error)
      try {
        // Fallback to Next.js API
        const response = await fetch(`/api/user-progress?courseId=${courseId}`)
        const data = await response.json()

        if (data.progress) {
          setProgress(data.progress.progress)
        } else {
          setProgress(initialProgress)
        }
      } catch (fallbackError) {
        console.error("Fallback error:", fallbackError)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const updateProgress = async (newProgress: number, newLastLesson?: string) => {
    if (!session?.user) return

    try {
      const response = await fetch(`${PHP_API_URL}/user-progress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({
          courseId,
          progress: newProgress,
          lastLesson: newLastLesson || lastLesson
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update progress")
      }

      const data = await response.json()
      setProgress(data.progress.progress)
      
      // Record activity
      try {
        await fetch(`${PHP_API_URL}/user-activity`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: 'include',
          body: JSON.stringify({
            activityType: 'update_progress',
            resourceId: courseId,
            resourceType: 'course'
          }),
        })
      } catch (activityError) {
        console.error("Failed to record activity:", activityError)
      }
      
    } catch (error) {
      console.error("PHP API error:", error)
      try {
        // Fallback to Next.js API
        const response = await fetch("/api/user-progress", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            courseId,
            progress: newProgress,
            lastLesson: newLastLesson || lastLesson
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to update progress")
        }

        const data = await response.json()
        setProgress(data.progress.progress)
      } catch (fallbackError) {
        console.error("Fallback error:", fallbackError)
        toast.error("Failed to update progress")
      }
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Course Progress</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (status === "unauthenticated") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Course Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">Sign in to track your progress</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <Progress value={progress} className="h-2 mb-2" />
        <div className="text-right text-sm text-muted-foreground">
          {progress}% complete
        </div>
      </CardContent>
    </Card>
  )
}
