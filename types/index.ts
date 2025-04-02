export type Difficulty = "Beginner" | "Intermediate" | "Advanced"

export type Lesson = {
  id: string
  title: string
  description?: string
  order: number
}

export type Module = {
  id: string
  title: string
  description?: string
  order: number
  lessons: Lesson[]
}

export type Course = {
  id: string
  title: string
  description?: string
  difficulty: Difficulty
  topic: string
  modules: Module[]
  createdAt: Date
  updatedAt: Date
}

