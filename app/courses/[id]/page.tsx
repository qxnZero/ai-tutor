import CourseDetail from "@/components/course-detail"

export default function CoursePage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <CourseDetail courseId={params.id} />
    </div>
  )
}

