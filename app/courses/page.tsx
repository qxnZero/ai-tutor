"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import CourseList from "@/components/course-list";
import CourseForm from "@/components/course-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Plus } from "lucide-react";

export default function CoursesPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("browse");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "create") {
      setActiveTab("create");
    }
  }, [searchParams]);

  return (
    <div className="container mx-auto px-4 py-5 max-w-5xl">
      <div className="flex flex-col items-center justify-center text-center mb-5">
        <h1 className="text-2xl font-bold tracking-tight mb-2">
          Your Learning Journey
        </h1>
        <p className="text-base text-muted-foreground">
          Browse and create personalized AI-generated courses
        </p>
      </div>

      <Tabs defaultValue="browse" value={activeTab} onValueChange={setActiveTab} className="w-full mb-8">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
          <TabsTrigger value="browse" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Browse Courses
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Course
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="mt-0">
          <CourseList />
        </TabsContent>

        <TabsContent value="create" className="mt-0">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-semibold mb-4 text-center">Create a New AI-Generated Course</h2>
            <p className="text-muted-foreground text-center mb-6">
              Specify your topic of interest and our AI will generate a complete course tailored to your needs
            </p>
            <CourseForm />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
