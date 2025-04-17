"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import TeachingAssistant from "@/components/teaching-assistant";
import LessonKnowledgeTest from "@/components/lesson-knowledge-test";
import LessonNotes from "@/components/lesson-notes";
import LessonBookmark from "@/components/lesson-bookmark";

// Markdown components
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

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

          <div className="prose prose-slate dark:prose-invert max-w-none lesson-content">
            {lesson.content ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeHighlight]}
                components={{
                  pre: ({ node, ...props }) => (
                    <pre className="bg-zinc-900 p-4 rounded-md overflow-auto my-4" {...props} />
                  ),
                  code: ({ node, inline, className, children, ...props }) => (
                    inline ? (
                      <code className="bg-zinc-800 px-1 py-0.5 rounded text-pink-400" {...props}>{children}</code>
                    ) : (
                      <code className={className} {...props}>{children}</code>
                    )
                  ),
                  a: ({ node, ...props }) => (
                    <a className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul className="list-disc pl-6 my-4" {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol className="list-decimal pl-6 my-4" {...props} />
                  ),
                  li: ({ node, ...props }) => (
                    <li className="my-1" {...props} />
                  ),
                  h1: ({ node, ...props }) => (
                    <h1 className="text-2xl font-bold my-4" {...props} />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2 className="text-xl font-bold my-3" {...props} />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3 className="text-lg font-bold my-2" {...props} />
                  ),
                  p: ({ node, ...props }) => (
                    <p className="my-3" {...props} />
                  ),
                  blockquote: ({ node, ...props }) => (
                    <blockquote className="border-l-4 border-zinc-500 pl-4 italic my-4" {...props} />
                  ),
                  table: ({ node, ...props }) => (
                    <div className="overflow-auto my-4">
                      <table className="border-collapse border border-zinc-700" {...props} />
                    </div>
                  ),
                  th: ({ node, ...props }) => (
                    <th className="border border-zinc-700 px-4 py-2 bg-zinc-800" {...props} />
                  ),
                  td: ({ node, ...props }) => (
                    <td className="border border-zinc-700 px-4 py-2" {...props} />
                  ),
                  img: ({ node, ...props }) => (
                    <img className="max-w-full h-auto rounded-md my-4" {...props} />
                  ),
                }}
              >
                {lesson.content}
              </ReactMarkdown>
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
                      <div className="prose dark:prose-invert">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeRaw, rehypeHighlight]}
                        >
                          {value}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4">Summary</h2>
            <div className="prose dark:prose-invert text-muted-foreground">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
              >
                {lesson.description || "No summary available for this lesson."}
              </ReactMarkdown>
            </div>
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
