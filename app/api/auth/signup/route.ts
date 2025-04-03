import { type NextRequest, NextResponse } from "next/server";
import argon2 from "argon2"; // Import argon2
import { prisma } from "@/lib/prisma"; // Adjust path as needed
import { z } from "zod";

const userSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const result = userSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          message: "Invalid input data",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // Use validated data
    const { name, email, password } = result.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      ); // 409 Conflict
    }

    // Hash password using argon2 - it handles salt generation automatically
    const hashedPassword = await argon2.hash(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword, // Store the Argon2 hash
      },
    });

    // Return user without password hash
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { message: "User created successfully", user: userWithoutPassword },
      { status: 201 }
    ); // 201 Created
  } catch (error) {
    console.error("SIGNUP_ERROR:", error);
    return NextResponse.json(
      { message: "An internal server error occurred" },
      { status: 500 }
    );
  }
}
