import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Health check endpoint
 * Verifies the Next.js backend and database connection are working properly
 */
export async function GET() {
  // Initialize response
  const response: any = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    components: {
      nextjs: {
        status: "healthy",
        version: process.env.NEXT_PUBLIC_VERSION || "15.2.4",
      },
      database: {
        status: "unknown",
      },
    },
  };

  // Check database connection
  try {
    // Measure database response time
    const startTime = performance.now();

    // Simple query to test connection
    await prisma.$queryRaw`SELECT 1`;

    // Calculate response time in milliseconds
    const responseTime = Math.round(performance.now() - startTime);

    // Update database status
    response.components.database = {
      status: "healthy",
      responseTime,
    };
  } catch (error) {
    // Database connection failed
    response.status = "degraded";
    response.components.database = {
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown database error",
    };

    // Log the error
    console.error("[Next.js] Health check - Database connection error:", error);
  }

  // Check environment variables
  const requiredEnvVars = [
    "DATABASE_URL",
    "NEXTAUTH_URL",
    "NEXTAUTH_SECRET",
  ];
  const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  );

  response.components.environment = {
    status: missingEnvVars.length === 0 ? "healthy" : "warning",
  };

  if (missingEnvVars.length > 0) {
    response.components.environment.missingVariables = missingEnvVars;
    response.status = "degraded";
  }

  // Check PHP backend if possible
  try {
    const phpUrl = process.env.PHP_BACKEND_URL || "http://localhost:8000";
    const phpResponse = await fetch(`${phpUrl}/api/test`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Short timeout to avoid blocking the health check
      signal: AbortSignal.timeout(2000),
    });

    if (phpResponse.ok) {
      response.components.php = {
        status: "healthy",
      };
    } else {
      response.components.php = {
        status: "degraded",
        statusCode: phpResponse.status,
      };
    }
  } catch (error) {
    // PHP backend connection failed
    response.components.php = {
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown PHP backend error",
    };
  }

  // Return the health status
  return NextResponse.json(response);
}
