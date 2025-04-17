"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import TeachingAssistant from "@/components/teaching-assistant";
import LessonKnowledgeTest from "@/components/lesson-knowledge-test";
import LessonNotes from "@/components/lesson-notes";
import LessonBookmark from "@/components/lesson-bookmark";

type LessonPageContentProps = {
  lesson: any;
  course: any;
  currentModule: any;
  currentLessonIndex: number;
  nextLesson: any;
  previousLesson: any;
};

export default function LessonPageContent({
  lesson,
  course,
  currentModule,
  currentLessonIndex,
  nextLesson,
  previousLesson,
}: LessonPageContentProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/courses/${course.id}`} className="flex items-center">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Outline
          </Link>
        </Button>
        <LessonBookmark lessonId={lesson.id} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <div className="mb-2 text-sm text-muted-foreground">
            Lesson {currentLessonIndex + 1} of {currentModule.lessons.length}
          </div>
          <h1 className="text-3xl font-bold mb-6">{lesson.title}</h1>

          <div className="prose prose-slate max-w-none">
            {lesson.content ? (
              <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
            ) : (
              <p>No content available for this lesson.</p>
            )}
          </div>

          {lesson.exercises && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-4">Practice Activities</h2>
              <div className="space-y-6">
                {Object.entries(lesson.exercises as Record<string, string>).map(
                  ([key, value], index) => (
                    <div key={index} className="space-y-2">
                      <h3 className="text-lg font-medium">
                        {index + 1}. {key}
                      </h3>
                      <p>{value}</p>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4">Summary</h2>
            <p className="text-muted-foreground">
              {lesson.description || "No summary available for this lesson."}
            </p>
          </div>

          <LessonKnowledgeTest lessonId={lesson.id} />

          <div className="mt-8 pt-8 border-t flex justify-between">
            {previousLesson ? (
              <Button variant="outline" asChild>
                <Link href={`/courses/${course.id}/${previousLesson.id}`}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous Lesson
                </Link>
              </Button>
            ) : (
              <div></div>
            )}
            {nextLesson ? (
              <Button asChild>
                <Link href={`/courses/${course.id}/${nextLesson.id}`}>
                  Next Lesson
                </Link>
              </Button>
            ) : (
              <Button asChild>
                <Link href={`/courses/${course.id}`}>Complete Course</Link>
              </Button>
            )}
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <TeachingAssistant
            courseId={course.id}
            lessonId={lesson.id}
            moduleName={currentModule.title}
            lessonName={lesson.title}
          />
          <LessonNotes lessonId={lesson.id} />
        </div>
      </div>
    </div>
  );
}
