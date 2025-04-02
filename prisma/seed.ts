import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  await prisma.lesson.deleteMany()
  await prisma.module.deleteMany()
  await prisma.course.deleteMany()

  console.log("Database has been cleared")

  // Add some sample courses if needed
  const javaCourse = await prisma.course.create({
    data: {
      title: "Java Programming for Beginners",
      description: "A comprehensive introduction to Java programming language",
      difficulty: "Beginner",
      topic: "Java",
      modules: {
        create: [
          {
            title: "Introduction to Java",
            description: "Learn the basics of Java programming",
            order: 1,
            lessons: {
              create: [
                {
                  title: "What is Java and Why Learn It?",
                  description: "An overview of Java and its applications",
                  order: 1,
                },
                {
                  title: "Setting up the Java Development Environment (JDK, IDE)",
                  description: "Learn how to set up your development environment",
                  order: 2,
                },
                // Add more lessons as needed
              ],
            },
          },
          // Add more modules as needed
        ],
      },
    },
  })

  console.log("Sample data has been seeded")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

