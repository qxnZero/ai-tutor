"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronRight, CheckCircle2, Circle, FileText, Map } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type CourseDetailProps = {
  course: any
  progress: number
  lastLesson: string | null | undefined
}

export default function CourseDetail({ course, progress, lastLesson }: CourseDetailProps) {
  const [activeTab, setActiveTab] = useState<string>("outline")

  // Count total lessons
  const totalLessons = course.modules.reduce((acc: number, module: any) => acc + module.lessons.length, 0)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
        <div className="flex items-center gap-4 mb-4">
          <Badge variant="outline">{course.difficulty}</Badge>
          <div className="text-sm text-muted-foreground">
            {course.modules.length} modules • {totalLessons} lessons • {progress}% complete
          </div>
        </div>
        <Progress value={progress} className="h-2 mb-2" />
      </div>

      <Tabs defaultValue="outline" className="mb-8">
        <TabsList>
          <TabsTrigger value="outline" onClick={() => setActiveTab("outline")} className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Outline
          </TabsTrigger>
          <TabsTrigger value="map" onClick={() => setActiveTab("map")} className="flex items-center gap-2">
            <Map className="h-4 w-4" />
            Map
          </TabsTrigger>
        </TabsList>

        <TabsContent value="outline" className="mt-6">
          <div className="space-y-4">
            <div className="bg-muted/30 rounded-md p-2 text-sm text-muted-foreground mb-4">{progress}% Completed</div>

            <Accordion type="multiple" defaultValue={course.modules.map((m: any) => m.id)}>
              {course.modules.map((module: any, moduleIndex: number) => (
                <AccordionItem key={module.id} value={module.id} className="border rounded-md mb-4 overflow-hidden">
                  <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 [&[data-state=open]>svg]:rotate-180">
                    <div className="flex items-center gap-3 text-left">
                      <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-medium">
                        {moduleIndex + 1}
                      </div>
                      <div>
                        <h3 className="font-medium">{module.title}</h3>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-0">
                    <div className="divide-y">
                      {module.lessons.map((lesson: any, lessonIndex: number) => (
                        <Link
                          key={lesson.id}
                          href={`/courses/${course.id}/${lesson.id}`}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-shrink-0">
                            {lesson.completed ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-grow">
                            <span className="text-sm text-muted-foreground">{lessonIndex + 1}</span>
                            <h4 className="font-medium">{lesson.title}</h4>
                          </div>
                          {lastLesson === lesson.id && (
                            <Badge variant="outline" className="ml-auto">
                              Current
                            </Badge>
                          )}
                          <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto flex-shrink-0" />
                        </Link>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </TabsContent>

        <TabsContent value="map" className="mt-6">
          <div className="bg-muted/30 p-6 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Course Map</h3>
            <div className="space-y-8">
              {course.modules.map((module: any, moduleIndex: number) => (
                <div key={module.id} className="relative">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-medium">
                      {moduleIndex + 1}
                    </div>
                    <h4 className="font-medium text-lg">{module.title}</h4>
                  </div>

                  <div className="ml-4 pl-8 border-l border-dashed space-y-4">
                    {module.lessons.map((lesson: any, lessonIndex: number) => (
                      <Link
                        key={lesson.id}
                        href={`/courses/${course.id}/${lesson.id}`}
                        className="flex items-center gap-3 p-3 rounded-md hover:bg-muted transition-colors"
                      >
                        <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-medium">
                          {lessonIndex + 1}
                        </div>
                        <div className="flex-grow">
                          <h5 className="font-medium">{lesson.title}</h5>
                        </div>
                        {lesson.completed && <CheckCircle2 className="h-4 w-4 text-green-500 ml-auto" />}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

