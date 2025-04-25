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

// Sample questions to use as fallback when API fails
const SAMPLE_QUESTIONS: Question[] = [
  {
    id: "sample-1",
    question: "What is the main purpose of this feature?",
    options: [
      "To test your knowledge of the lesson content",
      "To provide additional learning resources",
      "To track your progress through the course",
      "To connect with other learners"
    ],
    correctAnswer: 0
  },
  {
    id: "sample-2",
    question: "Why might you see this sample question?",
    options: [
      "The lesson has no content to generate questions from",
      "The API key for question generation is not configured",
      "The AI model failed to generate proper questions",
      "All of the above"
    ],
    correctAnswer: 3
  }
];

export default function LessonKnowledgeTest({ lessonId }: LessonKnowledgeTestProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerated, setIsGenerated] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [usingSampleQuestions, setUsingSampleQuestions] = useState(false)

  const useSampleQuestions = () => {
    setUsingSampleQuestions(true)
    setQuestions(SAMPLE_QUESTIONS)
    setIsGenerated(true)
    setIsLoading(false)
  }

  const generateQuestions = async () => {
    setIsLoading(true)
    setError(null)
    setUsingSampleQuestions(false)

    try {
      console.log("Sending request to generate questions for lesson:", lessonId)
      const response = await fetch("/api/knowledge-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lessonId }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("API error response:", data)
        let errorMessage = "Failed to generate questions. Please try again."

        // Extract more specific error message if available
        if (data.message) {
          errorMessage = `Error: ${data.message}`
          if (data.details) {
            errorMessage += ` (${data.details})`
          }
        }

        throw new Error(errorMessage)
      }

      if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
        console.error("Invalid or empty questions array:", data)
        throw new Error("No valid questions were generated. Please try again.")
      }

      console.log(`Successfully generated ${data.questions.length} questions`)

      // Check if these are fallback questions
      if (data.note && data.note.includes("fallback")) {
        console.log("Using fallback questions from API")
        setUsingSampleQuestions(true)
      } else {
        setUsingSampleQuestions(false)
      }

      setQuestions(data.questions)
      setIsGenerated(true)
    } catch (error) {
      console.error("Error generating questions:", error)
      setError(error instanceof Error ? error.message : "Failed to generate questions. Please try again.")
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
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
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
            <Button
              variant="outline"
              onClick={useSampleQuestions}
              disabled={isLoading}
            >
              Use Sample Questions
            </Button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/50 rounded-md text-red-500">
              <p>{error}</p>
              <p className="text-xs mt-2">
                Note: This feature requires a valid Gemini API key to be configured in the environment.
                You can use the "Use Sample Questions" button instead.
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      {usingSampleQuestions && (
        <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/50 rounded-md text-blue-500">
          <p className="text-sm">
            Using sample questions. These are not specific to the lesson content.
          </p>
        </div>
      )}
      <KnowledgeTest lessonId={lessonId} questions={questions} />
    </>
  )
}

