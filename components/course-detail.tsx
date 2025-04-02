"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronLeft, BookOpen, Map, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import AIInstructor from "./ai-instructor"

type Lesson = {
  id: string
  title: string
  description: string
  content: string
  exercises: any
  order: number
  completed: boolean
}

type Module = {
  id: string
  title: string
  description: string
  order: number
  lessons: Lesson[]
}

type Course = {
  id: string
  title: string
  description: string
  difficulty: string
  topic: string
  modules: Module[]
}

export default function CourseDetail({ courseId }: { courseId: string }) {
  const [course, setCourse] = useState<Course | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"outline" | "map">("outline")
  const [error, setError] = useState<string | null>(null)
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [currentModule, setCurrentModule] = useState<Module | null>(null)
  const [progress, setProgress] = useState(0)
  const [showAIInstructor, setShowAIInstructor] = useState(true)

  useEffect(() => {
    const fetchCourse = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/courses/${courseId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch course")
        }
        const data = await response.json()
        setCourse(data)

        // Set initial lesson and module
        if (data.modules.length > 0 && data.modules[0].lessons.length > 0) {
          setCurrentModule(data.modules[0])
          setCurrentLesson(data.modules[0].lessons[0])
        }

        // Calculate progress
        const totalLessons = data.modules.reduce((total: number, module: Module) => total + module.lessons.length, 0)

        const completedLessons = data.modules.reduce(
          (total: number, module: Module) => total + module.lessons.filter((lesson: Lesson) => lesson.completed).length,
          0,
        )

        setProgress(totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0)
      } catch (error) {
        console.error("Error fetching course:", error)
        setError("Failed to load course. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourse()
  }, [courseId])

  const handleLessonSelect = (moduleId: string, lessonId: string) => {
    if (!course) return

    const module = course.modules.find((m) => m.id === moduleId)
    if (!module) return

    const lesson = module.lessons.find((l) => l.id === lessonId)
    if (!lesson) return

    setCurrentModule(module)
    setCurrentLesson(lesson)
  }

  const markLessonAsComplete = async (lessonId: string) => {
    if (!course || !currentLesson) return

    try {
      const response = await fetch(`/api/lessons/${lessonId}/complete`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to mark lesson as complete")
      }

      // Update the local state
      const updatedCourse = { ...course }
      for (const module of updatedCourse.modules) {
        for (let i = 0; i < module.lessons.length; i++) {
          if (module.lessons[i].id === lessonId) {
            module.lessons[i].completed = true
            break
          }
        }
      }

      setCourse(updatedCourse)

      // Recalculate progress
      const totalLessons = updatedCourse.modules.reduce((total, module) => total + module.lessons.length, 0)

      const completedLessons = updatedCourse.modules.reduce(
        (total, module) => total + module.lessons.filter((lesson) => lesson.completed).length,
        0,
      )

      setProgress(totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0)
    } catch (error) {
      console.error("Error marking lesson as complete:", error)
    }
  }

  const navigateToNextLesson = () => {
    if (!course || !currentModule || !currentLesson) return

    const currentModuleIndex = course.modules.findIndex((m) => m.id === currentModule.id)
    const currentLessonIndex = currentModule.lessons.findIndex((l) => l.id === currentLesson.id)

    // Check if there's another lesson in the current module
    if (currentLessonIndex < currentModule.lessons.length - 1) {
      setCurrentLesson(currentModule.lessons[currentLessonIndex + 1])
      return
    }

    // Check if there's another module
    if (currentModuleIndex < course.modules.length - 1) {
      const nextModule = course.modules[currentModuleIndex + 1]
      if (nextModule.lessons.length > 0) {
        setCurrentModule(nextModule)
        setCurrentLesson(nextModule.lessons[0])
      }
    }
  }

  const navigateToPreviousLesson = () => {
    if (!course || !currentModule || !currentLesson) return

    const currentModuleIndex = course.modules.findIndex((m) => m.id === currentModule.id)
    const currentLessonIndex = currentModule.lessons.findIndex((l) => l.id === currentLesson.id)

    // Check if there's a previous lesson in the current module
    if (currentLessonIndex > 0) {
      setCurrentLesson(currentModule.lessons[currentLessonIndex - 1])
      return
    }

    // Check if there's a previous module
    if (currentModuleIndex > 0) {
      const prevModule = course.modules[currentModuleIndex - 1]
      if (prevModule.lessons.length > 0) {
        setCurrentModule(prevModule)
        setCurrentLesson(prevModule.lessons[prevModule.lessons.length - 1])
      }
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-6 w-1/4" />
        <div className="space-y-4 mt-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-8 w-1/2" />
              <div className="pl-6 space-y-2">
                {[1, 2, 3, 4].map((j) => (
                  <Skeleton key={j} className="h-6 w-3/4" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-red-600">{error}</h3>
        <Button asChild className="mt-4">
          <Link href="/">Go Back Home</Link>
        </Button>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">Course not found</h3>
        <Button asChild className="mt-4">
          <Link href="/">Go Back Home</Link>
        </Button>
      </div>
    )
  }

  const totalLessons = course.modules.reduce((total, module) => total + module.lessons.length, 0)

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="flex items-center gap-1 hover:text-gray-900">
          <ChevronLeft className="h-4 w-4" />
          Back to AI Tutor
        </Link>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{course.title}</h1>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{course.difficulty}</Badge>
          <span className="text-sm text-gray-500">
            {course.modules.length} modules • {totalLessons} lessons • {progress}% complete
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">35% of the daily limit used</span>
        </div>
        <Button variant="outline">Upgrade</Button>
      </div>

      {activeTab === "outline" && currentLesson ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1 border-r pr-4 hidden md:block">
            {course.modules.map((module) => (
              <div key={module.id} className="mb-4">
                <h3 className="font-medium mb-2 text-sm">{module.title}</h3>
                <ul className="space-y-1">
                  {module.lessons.map((lesson) => (
                    <li
                      key={lesson.id}
                      className={`text-sm py-1 px-2 rounded cursor-pointer flex items-center ${
                        currentLesson.id === lesson.id ? "bg-gray-100 font-medium" : "hover:bg-gray-50"
                      }`}
                      onClick={() => handleLessonSelect(module.id, lesson.id)}
                    >
                      {lesson.completed && <CheckCircle className="h-3 w-3 text-green-500 mr-2" />}
                      {lesson.title}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="md:col-span-3">
            {currentLesson && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Lesson {currentLesson.order} of {currentModule?.lessons.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markLessonAsComplete(currentLesson.id)}
                      className="gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Mark as Done
                    </Button>
                  </div>
                </div>

                <h2 className="text-2xl font-bold">{currentLesson.title}</h2>

                <div className="prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: currentLesson.content || "" }} />
                </div>

                {currentLesson.exercises && (
                  <div className="mt-8">
                    <h3 className="text-xl font-semibold mb-4">Exercises</h3>
                    <div className="space-y-4">
                      {currentLesson.exercises.map((exercise: any, index: number) => (
                        <div key={index} className="border p-4 rounded-lg">
                          <p className="font-medium">
                            {index + 1}. {exercise.title}
                          </p>
                          <p className="mt-2">{exercise.description}</p>
                          {exercise.code && (
                            <pre className="bg-gray-100 p-3 rounded mt-2 overflow-x-auto">
                              <code>{exercise.code}</code>
                            </pre>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between mt-8">
                  <Button
                    variant="outline"
                    onClick={navigateToPreviousLesson}
                    disabled={
                      currentModule?.lessons[0].id === currentLesson.id && course.modules[0].id === currentModule?.id
                    }
                  >
                    Previous Lesson
                  </Button>
                  <Button
                    onClick={navigateToNextLesson}
                    disabled={
                      currentModule?.lessons[currentModule.lessons.length - 1].id === currentLesson.id &&
                      course.modules[course.modules.length - 1].id === currentModule?.id
                    }
                  >
                    Next Lesson
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 border-b pb-2">
          <Button
            variant={activeTab === "outline" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("outline")}
            className="gap-2"
          >
            <BookOpen className="h-4 w-4" />
            Outline
          </Button>
          <Button
            variant={activeTab === "map" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("map")}
            className="gap-2"
          >
            <Map className="h-4 w-4" />
            Map
          </Button>
        </div>
      )}

      {activeTab === "map" && (
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">{course.title}</h2>
            <Badge variant="outline" className="mb-6">
              {course.difficulty}
            </Badge>
          </div>

          {course.modules.map((module) => (
            <div key={module.id} className="space-y-4">
              <h3 className="text-xl font-semibold">
                Module {module.order}: {module.title}
              </h3>
              <div className="space-y-3">
                {module.lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      {lesson.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <span className="text-gray-500">{lesson.order}</span>
                      )}
                      <span>{lesson.title}</span>
                    </div>
                    <Button size="sm" onClick={() => handleLessonSelect(module.id, lesson.id)}>
                      {lesson.completed ? "View →" : "Start →"}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showAIInstructor && (
        <div className="fixed bottom-4 right-4 z-10">
          <AIInstructor courseId={courseId} lessonId={currentLesson?.id} onClose={() => setShowAIInstructor(false)} />
        </div>
      )}
    </div>
  )
}

