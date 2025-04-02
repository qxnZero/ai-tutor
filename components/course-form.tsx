"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Wand2 } from "lucide-react"

type DifficultyLevel = "Beginner" | "Intermediate" | "Advanced"

export default function CourseForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [topic, setTopic] = useState("")
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("Beginner")
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false)
  const [additionalInfo, setAdditionalInfo] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!topic) return

    setIsLoading(true)

    try {
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          difficulty,
          additionalInfo: showAdditionalInfo ? additionalInfo : "",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate course")
      }

      const data = await response.json()
      onSubmit(data)
    } catch (error) {
      console.error("Error generating course:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-3xl mx-auto">
      <div className="space-y-2">
        <Label htmlFor="topic">Course Topic</Label>
        <Input
          id="topic"
          placeholder="e.g., Algebra, JavaScript, Photography"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Difficulty Level</Label>
        <div className="flex flex-wrap gap-2">
          {(["Beginner", "Intermediate", "Advanced"] as DifficultyLevel[]).map((level) => (
            <Button
              key={level}
              type="button"
              variant={difficulty === level ? "default" : "outline"}
              onClick={() => setDifficulty(level)}
              className="flex-1 sm:flex-none"
            >
              {level}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="additionalInfo"
          checked={showAdditionalInfo}
          onCheckedChange={(checked) => setShowAdditionalInfo(checked === true)}
        />
        <Label htmlFor="additionalInfo" className="text-sm text-gray-600">
          Tell us more to tailor the course (optional)
          <span className="ml-2 text-xs bg-gray-200 px-2 py-0.5 rounded">recommended</span>
        </Label>
      </div>

      {showAdditionalInfo && (
        <Textarea
          placeholder="Specific areas of interest, learning goals, or preferences..."
          value={additionalInfo}
          onChange={(e) => setAdditionalInfo(e.target.value)}
          className="min-h-[100px]"
        />
      )}

      <Button type="submit" className="w-full py-6" disabled={isLoading || !topic}>
        {isLoading ? (
          <span className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Generating Course...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Generate Course
          </span>
        )}
      </Button>
    </form>
  )
}

