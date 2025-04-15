import CourseList from "@/components/course-list";

export default async function CoursesPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="flex flex-col items-center justify-center text-center mb-12">
        <h1 className="text-3xl font-bold tracking-tight mb-4">
          Your Learning Journey
        </h1>
        <p className="text-lg text-muted-foreground">
          Browse your personalized AI-generated courses
        </p>
      </div>

      <CourseList />
    </div>
  );
}
