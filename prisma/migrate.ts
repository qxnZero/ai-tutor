import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

async function runMigrations() {
  try {
    console.log("Running Prisma migrations...")

    // Generate Prisma client
    await execAsync("npx prisma generate")
    console.log("Prisma client generated successfully")

    // Run migrations
    await execAsync("npx prisma migrate deploy")
    console.log("Migrations applied successfully")
  } catch (error) {
    console.error("Error running migrations:", error)
    process.exit(1)
  }
}

runMigrations()

