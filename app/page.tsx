import CourseForm from "@/components/course-form"
import CourseList from "@/components/course-list"
import { ArrowRight, Sparkles, BookOpen, Brain, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <div>
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 z-0" />
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center px-3 py-1 rounded-full border mb-4 text-sm font-medium">
              <Sparkles className="h-4 w-4 mr-2" />
              <span>Powered by AI</span>
            </div>
            <h1 className="text-5xl font-bold tracking-tight mb-6">Learn anything with AI</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Generate personalized courses on any topic with our AI tutor. From programming to photography, create your
              own learning path in seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <a href="#generate-course">
                  Generate a Course
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/courses">Browse Your Courses</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-muted/50 rounded-lg p-6">
            <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Personalized Learning</h3>
            <p className="text-muted-foreground">
              Courses tailored to your specific needs, interests, and skill level.
            </p>
          </div>
          <div className="bg-muted/50 rounded-lg p-6">
            <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI Instructor</h3>
            <p className="text-muted-foreground">
              Get help from our AI tutor that answers questions about your lessons.
            </p>
          </div>
          <div className="bg-muted/50 rounded-lg p-6">
            <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Interactive Learning</h3>
            <p className="text-muted-foreground">
              Test your knowledge with AI-generated quizzes and practice activities.
            </p>
          </div>
        </div>

        <div id="generate-course" className="scroll-mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Generate Your Course</h2>
            <p className="text-lg text-muted-foreground">
              Enter a topic below to generate a personalized course for it
            </p>
          </div>

          <div className="mb-16">
            <CourseForm />
          </div>
        </div>

        <div>
          <CourseList />
        </div>
      </div>
    </div>
  )
}

