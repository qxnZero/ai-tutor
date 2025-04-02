"use client"

import Link from "next/link"
import { Book } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type CourseCardProps = {
  id: string
  title: string
  difficulty: string
  lessonCount: number
  onDelete?: (id: string) => void
}

export default function CourseCard({ id, title, difficulty, lessonCount, onDelete }: CourseCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <Badge variant="outline" className="mb-2">
            {difficulty}
          </Badge>
          {onDelete && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDelete(id)}>
              <span className="sr-only">Delete course</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              </svg>
            </Button>
          )}
        </div>
        <CardTitle className="line-clamp-2">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <Book className="h-4 w-4 mr-1" />
          <span>{lessonCount} lessons</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-gray-500 h-2.5 rounded-full w-0"></div>
        </div>
        <div className="mt-2 text-xs text-right text-gray-500">0%</div>
        <Link href={`/courses/${id}`} passHref>
          <Button className="w-full mt-4" variant="outline">
            View Course
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

