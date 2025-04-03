export type CourseFormValues = {
  topic: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  additionalDetails: boolean
  details?: string
}

export type LessonWithModule = {
  id: string
  title: string
  description: string | null
  content: string | null
  exercises: Record<string, string> | null
  order: number
  completed: boolean
  moduleId: string
  module: {
    id: string
    title: string
    description: string | null
    order: number
    courseId: string
    course: {
      id: string
      title: string
      description: string | null
      difficulty: string
      topic: string
      createdAt: Date
      updatedAt: Date
    }
    lessons: {
      id: string
      title: string
      order: number
      completed: boolean
    }[]
  }
}

