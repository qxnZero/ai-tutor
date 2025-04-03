"use client"

import { useState } from "react"
import { Check, X, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

type Question = {
  id: string
  question: string
  options: string[]
  correctAnswer: number
}

type KnowledgeTestProps = {
  lessonId: string
  questions: Question[]
}

export default function KnowledgeTest({ lessonId, questions }: KnowledgeTestProps) {
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)

  const handleSubmit = () => {
    if (Object.keys(answers).length === 0) return

    let correctCount = 0
    questions.forEach((question) => {
      if (answers[question.id] === question.correctAnswer) {
        correctCount++
      }
    })

    setScore(correctCount)
    setSubmitted(true)
  }

  const handleReset = () => {
    setAnswers({})
    setSubmitted(false)
    setScore(0)
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-4">Test Your Knowledge</h2>

      {questions.length === 0 ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <AlertTriangle className="h-5 w-5" />
          <p>No questions available for this lesson.</p>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {questions.map((question, index) => (
              <Card
                key={question.id}
                className={
                  submitted
                    ? answers[question.id] === question.correctAnswer
                      ? "border-green-500/50"
                      : "border-red-500/50"
                    : ""
                }
              >
                <CardHeader>
                  <CardTitle className="text-lg font-medium flex items-start gap-2">
                    <span>{index + 1}.</span>
                    <span>{question.question}</span>
                    {submitted &&
                      (answers[question.id] === question.correctAnswer ? (
                        <Check className="h-5 w-5 text-green-500 ml-auto flex-shrink-0" />
                      ) : (
                        <X className="h-5 w-5 text-red-500 ml-auto flex-shrink-0" />
                      ))}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={answers[question.id]?.toString()}
                    onValueChange={(value) => {
                      if (submitted) return
                      setAnswers({
                        ...answers,
                        [question.id]: Number.parseInt(value),
                      })
                    }}
                    className="space-y-3"
                  >
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-start space-x-2">
                        <RadioGroupItem
                          value={optionIndex.toString()}
                          id={`${question.id}-${optionIndex}`}
                          disabled={submitted}
                          className={
                            submitted && question.correctAnswer === optionIndex ? "text-green-500 border-green-500" : ""
                          }
                        />
                        <Label
                          htmlFor={`${question.id}-${optionIndex}`}
                          className={
                            submitted && question.correctAnswer === optionIndex ? "text-green-500 font-medium" : ""
                          }
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
                {submitted && answers[question.id] !== question.correctAnswer && (
                  <CardFooter className="bg-muted/50 border-t px-6 py-3">
                    <div className="text-sm">
                      <span className="font-medium">Correct answer:</span> {question.options[question.correctAnswer]}
                    </div>
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>

          <div className="mt-6 flex justify-between items-center">
            {submitted ? (
              <>
                <div className="text-lg">
                  Your score: <span className="font-bold">{score}</span> out of{" "}
                  <span className="font-bold">{questions.length}</span> ({Math.round((score / questions.length) * 100)}
                  %)
                </div>
                <Button onClick={handleReset}>Try Again</Button>
              </>
            ) : (
              <Button onClick={handleSubmit} disabled={Object.keys(answers).length === 0} className="ml-auto">
                Submit Answers
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

