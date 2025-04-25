"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Loader2, Save, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

// PHP backend URL - Commented out for Render deployment
// const PHP_API_URL = "http://localhost:8000/api"

type LessonNotesProps = {
  lessonId: string
}

export default function LessonNotes({ lessonId }: LessonNotesProps) {
  const { data: session, status } = useSession()
  const [note, setNote] = useState("")
  const [noteId, setNoteId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (status === "authenticated" && lessonId) {
      fetchNote()
    }
  }, [status, lessonId])

  const fetchNote = async () => {
    setIsLoading(true)
    try {
      // PHP API call commented out for Render deployment
      /*
      const response = await fetch(`${PHP_API_URL}/notes?lessonId=${lessonId}`, {
        credentials: 'include',
      })
      const data = await response.json()

      if (data.note) {
        setNote(data.note.content)
        setNoteId(data.note.id)
      } else {
        setNote("")
        setNoteId(null)
      }
      */

      // Using Next.js API directly
      const response = await fetch(`/api/notes?lessonId=${lessonId}`)
      const data = await response.json()

      if (data.note) {
        setNote(data.note.content)
        setNoteId(data.note.id)
      } else {
        setNote("")
        setNoteId(null)
      }
    } catch (error) {
      console.error("API error:", error)
      setNote("")
      setNoteId(null)
    } finally {
      setIsLoading(false)
    }
  }

  const saveNote = async () => {
    if (!note.trim()) return

    setIsSaving(true)
    try {
      // PHP API call commented out for Render deployment
      /*
      const response = await fetch(`${PHP_API_URL}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({
          content: note,
          lessonId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save note")
      }

      const data = await response.json()
      setNoteId(data.note.id)
      toast.success("Note saved")
      */

      // Using Next.js API directly
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: note,
          lessonId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save note")
      }

      const data = await response.json()
      setNoteId(data.note.id)
      toast.success("Note saved")
    } catch (error) {
      console.error("API error:", error)
      toast.error("Failed to save note")
    } finally {
      setIsSaving(false)
    }
  }

  const deleteNote = async () => {
    if (!noteId) return

    setIsDeleting(true)
    try {
      // PHP API call commented out for Render deployment
      /*
      const response = await fetch(`${PHP_API_URL}/notes?id=${noteId}`, {
        method: "DELETE",
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error("Failed to delete note")
      }

      setNote("")
      setNoteId(null)
      toast.success("Note deleted")
      */

      // Using Next.js API directly
      const response = await fetch(`/api/notes?id=${noteId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete note")
      }

      setNote("")
      setNoteId(null)
      toast.success("Note deleted")
    } catch (error) {
      console.error("API error:", error)
      toast.error("Failed to delete note")
    } finally {
      setIsDeleting(false)
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
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
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">Sign in to take notes for this lesson</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Take notes for this lesson..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="min-h-[150px] resize-none"
        />
      </CardContent>
      <CardFooter className="flex justify-between">
        {noteId && (
          <Button variant="outline" size="sm" onClick={deleteNote} disabled={isDeleting || isSaving}>
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </>
            )}
          </Button>
        )}
        <Button
          size="sm"
          onClick={saveNote}
          disabled={!note.trim() || isSaving || isDeleting}
          className={noteId ? "ml-auto" : "w-full"}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Note
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

