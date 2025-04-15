"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Course } from "@prisma/client";
// Assuming you have a SessionProvider or similar if courses depend on user session

type CourseWithLessonCount = Course & {
  _count: {
    lessons: number;
  };
  progress: number | null; // Allow progress to be null if not set
};

export default function CourseList() {
  const [courses, setCourses] = useState<CourseWithLessonCount[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<
    CourseWithLessonCount[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Add error state

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true); // Set loading true at the start
      setError(null); // Reset error state
      try {
        const response = await fetch("/api/courses");

        // --- Check 1: Was the HTTP request successful? ---
        if (!response.ok) {
          // Throw an error with status text or a custom message
          throw new Error(
            `API Error: ${response.status} ${
              response.statusText || "Failed to fetch courses"
            }`
          );
        }

        const data = await response.json();

        // --- Check 2: Is the received data actually an array? ---
        if (Array.isArray(data)) {
          // Ensure progress is handled correctly (default to 0 if null/undefined)
          const coursesWithDefaultProgress = data.map((course) => ({
            ...course,
            progress: course.progress ?? 0,
          }));
          setCourses(coursesWithDefaultProgress);
          setFilteredCourses(coursesWithDefaultProgress);
        } else {
          // Log the unexpected data structure and throw an error
          console.error("API did not return an array:", data);
          throw new Error("Received invalid data format from server.");
        }
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        // Set to empty arrays on error to prevent .map failures
        setCourses([]);
        setFilteredCourses([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []); // Dependency array is empty, runs once on mount

  // Filter logic effect remains the same
  useEffect(() => {
    if (!isLoading && !error) {
      // Only filter if not loading and no error
      if (searchQuery.trim() === "") {
        setFilteredCourses(courses);
      } else {
        const filtered = courses.filter(
          (course) =>
            course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.topic.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredCourses(filtered);
      }
    }
  }, [searchQuery, courses, isLoading, error]); // Add isLoading and error dependencies

  // --- Render Loading State ---
  if (isLoading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Your Courses</h2>
          <div className="relative w-64">
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-6">
                <Skeleton className="h-4 w-16 mb-2" /> {/* Adjusted size */}
                <Skeleton className="h-6 w-3/4 mb-3" /> {/* Adjusted size */}
                <Skeleton className="h-4 w-20 mb-4" /> {/* Adjusted size */}
                <Skeleton className="h-2 w-full mb-2" />
                <Skeleton className="h-3 w-16 ml-auto" /> {/* Adjusted size */}
              </CardContent>
              <CardFooter className="bg-muted/50 px-6 py-4">
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // --- Render Error State ---
  if (error) {
    return (
      <div className="text-center py-12 text-red-600">
        <p>Failed to load courses: {error}</p>
      </div>
    );
  }

  // --- Render Content ---
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        {" "}
        {/* Adjusted layout for responsiveness */}
        <h2 className="text-2xl font-bold">Your Courses</h2>
        <div className="relative w-full md:w-64">
          {" "}
          {/* Adjusted width */}
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />{" "}
          {/* Centered icon */}
          <Input
            placeholder="Search your courses..."
            className="pl-9" // Increased padding
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="text-center py-12">
          {searchQuery ? (
            <p className="text-muted-foreground">
              No courses found matching your search.
            </p>
          ) : (
            <>
              <p className="text-muted-foreground mb-4">
                You haven't created any courses yet.
              </p>
              <Button asChild>
                <Link href="/course-form">Create your first course</Link>
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="overflow-hidden flex flex-col">
              {" "}
              {/* Added flex */}
              <CardContent className="p-6 flex-grow">
                {" "}
                {/* Added flex-grow */}
                <Badge variant="outline" className="mb-2">
                  {course.difficulty}
                </Badge>
                <h3 className="text-xl font-semibold mb-2 line-clamp-2">
                  {course.title}
                </h3>{" "}
                {/* Added line-clamp */}
                <div className="flex items-center text-sm text-muted-foreground mb-4">
                  <span>{course._count.lessons} lessons</span>
                </div>
                <Progress value={course.progress || 0} className="h-2 mb-2" />
                <div className="text-right text-sm text-muted-foreground">
                  {course.progress || 0}% complete
                </div>
              </CardContent>
              <CardFooter className="bg-muted/50 px-6 py-4 border-t">
                {" "}
                {/* Added border-t */}
                <Button asChild className="w-full">
                  <Link href={`/courses/${course.id}`}>View Course</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
