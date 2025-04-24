"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Loader2, BookmarkPlus, BookmarkCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

// PHP backend URL
const PHP_API_URL = "http://localhost:8000/api"

type LessonBookmarkProps = {
  lessonId: string
}

export default function LessonBookmark({ lessonId }: LessonBookmarkProps) {
  const { data: session, status } = useSession()
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [bookmarkId, setBookmarkId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isToggling, setIsToggling] = useState(false)

  useEffect(() => {
    if (status === "authenticated" && lessonId) {
      checkBookmarkStatus()
    }
  }, [status, lessonId])

  const checkBookmarkStatus = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${PHP_API_URL}/bookmarks?lessonId=${lessonId}`, {
        credentials: 'include',
      })
      const data = await response.json()

      if (data.bookmark) {
        setIsBookmarked(true)
        setBookmarkId(data.bookmark.id)
      } else {
        setIsBookmarked(false)
        setBookmarkId(null)
      }
    } catch (error) {
      console.error("Bookmark API error:", error)
      try {
        const response = await fetch(`/api/bookmarks?lessonId=${lessonId}`)
        const data = await response.json()

        if (data.bookmark) {
          setIsBookmarked(true)
          setBookmarkId(data.bookmark.id)
        } else {
          setIsBookmarked(false)
          setBookmarkId(null)
        }
      } catch (fallbackError) {
        console.error("Bookmark fallback error:", fallbackError)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const toggleBookmark = async () => {
    if (status !== "authenticated") {
      toast.error("Please sign in to bookmark lessons")
      return
    }

    setIsToggling(true)
    try {
      if (isBookmarked) {
        const response = await fetch(`${PHP_API_URL}/bookmarks?lessonId=${lessonId}`, {
          method: "DELETE",
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error("Failed to remove bookmark")
        }

        setIsBookmarked(false)
        setBookmarkId(null)
        toast.success("Bookmark removed")
      } else {
        const response = await fetch(`${PHP_API_URL}/bookmarks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: 'include',
          body: JSON.stringify({
            lessonId,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to bookmark lesson")
        }

        const data = await response.json()
        setIsBookmarked(true)
        setBookmarkId(data.bookmark.id)
        toast.success("Lesson bookmarked")
      }
    } catch (error) {
      console.error("Bookmark toggle error:", error)

      try {
        if (isBookmarked) {
          const queryParam = bookmarkId ? `id=${bookmarkId}` : `lessonId=${lessonId}`;
          const response = await fetch(`/api/bookmarks?${queryParam}`, {
            method: "DELETE",
          })

          if (!response.ok) {
            throw new Error("Failed to remove bookmark")
          }

          setIsBookmarked(false)
          setBookmarkId(null)
          toast.success("Bookmark removed")
        } else {
          const response = await fetch("/api/bookmarks", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              lessonId,
            }),
          })

          if (!response.ok) {
            throw new Error("Failed to bookmark lesson")
          }

          const data = await response.json()
          setIsBookmarked(true)
          setBookmarkId(data.bookmark.id)
          toast.success("Lesson bookmarked")
        }
      } catch (fallbackError) {
        console.error("Bookmark fallback error:", fallbackError)
        toast.error("Failed to update bookmark")
      }
    } finally {
      setIsToggling(false)
    }
  }

  if (isLoading) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    )
  }

  return (
    <Button variant={isBookmarked ? "default" : "outline"} size="sm" onClick={toggleBookmark} disabled={isToggling}>
      {isToggling ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : isBookmarked ? (
        <BookmarkCheck className="mr-2 h-4 w-4" />
      ) : (
        <BookmarkPlus className="mr-2 h-4 w-4" />
      )}
      {isBookmarked ? "Bookmarked" : "Bookmark"}
    </Button>
  )
}

