"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import KnowledgeTest from "@/components/knowledge-test"
import { Button } from "@/components/ui/button"

type Question = {
  id: string
  question: string
  options: string[]
  correctAnswer: number
}

type LessonKnowledgeTestProps = {
  lessonId: string
}

export default function LessonKnowledgeTest({ lessonId }: LessonKnowledgeTestProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerated, setIsGenerated] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateQuestions = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/knowledge-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lessonId }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate questions")
      }

      const data = await response.json()
      setQuestions(data.questions)
      setIsGenerated(true)
    } catch (error) {
      console.error("Error generating questions:", error)
      setError("Failed to generate questions. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isGenerated) {
    return (
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Test Your Knowledge</h2>
        <div className="bg-muted/50 rounded-lg p-6 text-center">
          <p className="mb-4">Generate questions to test your understanding of this lesson.</p>
          <Button onClick={generateQuestions} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Questions...
              </>
            ) : (
              "Generate Questions"
            )}
          </Button>
          {error && <p className="mt-4 text-red-500">{error}</p>}
        </div>
      </div>
    )
  }

  return <KnowledgeTest lessonId={lessonId} questions={questions} />
}

