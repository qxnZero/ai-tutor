import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log("GET /api/debug - Starting request");
    
    // Get the current user session
    const session = await getServerSession(authOptions);
    console.log("GET /api/debug - Session:", JSON.stringify(session));
    
    // Check if we have a user in the session
    if (!session?.user) {
      console.log("GET /api/debug - No user in session");
      return NextResponse.json({
        status: "unauthenticated",
        session: null,
        message: "No user in session"
      });
    }
    
    // Try to get the user from the database
    console.log("GET /api/debug - Looking up user with email:", session.user.email);
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email as string,
      },
    });
    
    // Log the result
    if (user) {
      console.log("GET /api/debug - Found user in database:", {
        id: user.id,
        email: user.email,
        name: user.name
      });
    } else {
      console.log("GET /api/debug - User not found in database");
    }
    
    // Return debug information
    return NextResponse.json({
      status: "authenticated",
      session: {
        user: session.user,
        expires: session.expires
      },
      databaseUser: user ? {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image
      } : null,
      cookies: {
        hasSessionToken: Boolean(session),
      },
      env: {
        nextAuthUrl: process.env.NEXTAUTH_URL,
        hasGoogleCredentials: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      }
    });
  } catch (error) {
    console.error("Error in debug endpoint:", error);
    return NextResponse.json({
      status: "error",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
