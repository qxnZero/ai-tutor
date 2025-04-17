"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, BookOpen, MessageSquare, Brain, Target, Lightbulb, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CourseForm from "@/components/course-form";

export default function AITutorPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("create-course");

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Check if user is authenticated (client-side)
  useEffect(() => {
    // This is a simple client-side check
    // The API will do a more thorough check
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/session");
        const session = await response.json();

        if (!session || !session.user) {
          router.push("/auth/signin?callbackUrl=/ai-tutor");
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background to-background/80">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard" className="flex items-center">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <div className="flex flex-col items-center justify-center text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-3 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            AI Tutor Assistant
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Your personal AI learning companion with advanced tutoring capabilities
          </p>
        </div>

        <Tabs defaultValue="create-course" value={activeTab} className="w-full max-w-6xl mx-auto" onValueChange={handleTabChange}>
          <TabsList className="grid grid-cols-2 md:grid-cols-6 mb-10 p-1 bg-background/90 backdrop-blur-sm shadow-md rounded-xl border border-border/50">
            <TabsTrigger value="create-course" className="flex flex-col items-center gap-2 py-3 h-auto data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg">
              <BookOpen className="h-5 w-5" />
              <span className="text-xs font-medium">Create Course</span>
            </TabsTrigger>
            <TabsTrigger value="tutor-chat" className="flex flex-col items-center gap-2 py-3 h-auto data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg">
              <MessageSquare className="h-5 w-5" />
              <span className="text-xs font-medium">Tutor Chat</span>
            </TabsTrigger>
            <TabsTrigger value="learning-style" className="flex flex-col items-center gap-2 py-3 h-auto data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg">
              <Brain className="h-5 w-5" />
              <span className="text-xs font-medium">Learning Style</span>
            </TabsTrigger>
            <TabsTrigger value="learning-path" className="flex flex-col items-center gap-2 py-3 h-auto data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg">
              <Target className="h-5 w-5" />
              <span className="text-xs font-medium">Learning Path</span>
            </TabsTrigger>
            <TabsTrigger value="knowledge-gaps" className="flex flex-col items-center gap-2 py-3 h-auto data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg">
              <Lightbulb className="h-5 w-5" />
              <span className="text-xs font-medium">Knowledge Gaps</span>
            </TabsTrigger>
            <TabsTrigger value="exercises" className="flex flex-col items-center gap-2 py-3 h-auto data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg">
              <Dumbbell className="h-5 w-5" />
              <span className="text-xs font-medium">Exercises</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create-course" className="mt-0">
            <CourseForm />
          </TabsContent>

          <TabsContent value="tutor-chat" className="mt-0">
            <Card className="border-primary/20 shadow-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-background z-0"></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <CardTitle>One-on-One Tutoring</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Have a personalized conversation with your AI tutor about any subject
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 relative z-10">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Our AI tutor can answer questions, explain concepts, and help you work through problems step-by-step.
                  Start a conversation about any topic you're learning and receive personalized guidance tailored to your needs.
                </p>
                <div className="bg-background/80 p-6 rounded-xl border border-border/50 text-center backdrop-blur-sm">
                  <p className="text-sm text-muted-foreground mb-3 font-medium">Coming soon</p>
                  <div className="flex flex-col gap-3">
                    <Button disabled className="px-6 py-2 h-auto">Start Tutoring Session</Button>
                    <Button variant="outline" size="sm" onClick={() => handleTabChange("create-course")}>Return to Course Creation</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="learning-style" className="mt-0">
            <Card className="border-primary/20 shadow-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-background z-0"></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-5 w-5 text-primary" />
                  <CardTitle>Learning Style Assessment</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Discover your unique learning style to optimize your educational experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 relative z-10">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Take our comprehensive assessment to identify whether you're a visual, auditory, reading/writing, or kinesthetic learner.
                  We'll customize your learning experience based on your results to maximize your learning potential.
                </p>
                <div className="bg-background/80 p-6 rounded-xl border border-border/50 text-center backdrop-blur-sm">
                  <p className="text-sm text-muted-foreground mb-3 font-medium">Coming soon</p>
                  <div className="flex flex-col gap-3">
                    <Button disabled className="px-6 py-2 h-auto">Take Assessment</Button>
                    <Button variant="outline" size="sm" onClick={() => handleTabChange("create-course")}>Return to Course Creation</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="learning-path" className="mt-0">
            <Card className="border-primary/20 shadow-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-background z-0"></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-primary" />
                  <CardTitle>Personalized Learning Path</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Get a customized roadmap to achieve your learning goals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 relative z-10">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Tell us what you want to learn and your current skill level, and we'll create a step-by-step learning path
                  with recommended courses, resources, and milestones to guide your educational journey effectively.
                </p>
                <div className="bg-background/80 p-6 rounded-xl border border-border/50 text-center backdrop-blur-sm">
                  <p className="text-sm text-muted-foreground mb-3 font-medium">Coming soon</p>
                  <div className="flex flex-col gap-3">
                    <Button disabled className="px-6 py-2 h-auto">Create Learning Path</Button>
                    <Button variant="outline" size="sm" onClick={() => handleTabChange("create-course")}>Return to Course Creation</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="knowledge-gaps" className="mt-0">
            <Card className="border-primary/20 shadow-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-background z-0"></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  <CardTitle>Knowledge Gap Analysis</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Identify and address gaps in your understanding
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 relative z-10">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Take a diagnostic assessment in your chosen subject to identify knowledge gaps.
                  We'll provide targeted resources and exercises to strengthen your understanding and build a solid foundation.
                </p>
                <div className="bg-background/80 p-6 rounded-xl border border-border/50 text-center backdrop-blur-sm">
                  <p className="text-sm text-muted-foreground mb-3 font-medium">Coming soon</p>
                  <div className="flex flex-col gap-3">
                    <Button disabled className="px-6 py-2 h-auto">Start Analysis</Button>
                    <Button variant="outline" size="sm" onClick={() => handleTabChange("create-course")}>Return to Course Creation</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exercises" className="mt-0">
            <Card className="border-primary/20 shadow-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-background z-0"></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Dumbbell className="h-5 w-5 text-primary" />
                  <CardTitle>Interactive Exercises Generator</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Practice and reinforce your learning with custom exercises
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 relative z-10">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Generate custom practice exercises for any subject at your preferred difficulty level.
                  Get immediate feedback and explanations to enhance your understanding and accelerate your mastery.
                </p>
                <div className="bg-background/80 p-6 rounded-xl border border-border/50 text-center backdrop-blur-sm">
                  <p className="text-sm text-muted-foreground mb-3 font-medium">Coming soon</p>
                  <div className="flex flex-col gap-3">
                    <Button disabled className="px-6 py-2 h-auto">Generate Exercises</Button>
                    <Button variant="outline" size="sm" onClick={() => handleTabChange("create-course")}>Return to Course Creation</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
