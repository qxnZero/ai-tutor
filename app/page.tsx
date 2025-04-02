"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import CourseForm from "@/components/course-form"
import CourseList from "@/components/course-list"

export default function Home() {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)

  const handleCourseGenerated = (course: any) => {
    setIsGenerating(false)
    router.push(`/courses/${course.id}`)
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Learn anything with AI</h1>
        <p className="text-xl text-gray-600">Enter a topic below to generate a personalized course for it</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6 mb-12">
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-gray-800 animate-spin mb-4"></div>
            <p className="text-lg font-medium">Generating your course...</p>
            <p className="text-gray-500 mt-2">This may take a minute as our AI crafts a personalized learning path</p>
          </div>
        ) : (
          <CourseForm
            onSubmit={(data) => {
              setIsGenerating(true)
              handleCourseGenerated(data)
            }}
          />
        )}
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Your Courses</h2>
        <CourseList />
      </div>
    </div>
  )
}

