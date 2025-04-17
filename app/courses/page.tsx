import CourseList from "@/components/course-list";

export default async function CoursesPage() {
  return (
    <div className="container mx-auto px-4 py-5 max-w-5xl">
      <div className="flex flex-col items-center justify-center text-center mb-5">
        <h1 className="text-2xl font-bold tracking-tight mb-2">
          Your Learning Journey
        </h1>
        <p className="text-base text-muted-foreground">
          Browse your personalized AI-generated courses
        </p>
      </div>

      <CourseList />
    </div>
  );
}
