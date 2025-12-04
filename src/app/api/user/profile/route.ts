import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"
import { db } from "@/lib/db"

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Please enter a valid email address").optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        subscription: true,
        dashboardPreferences: true,
        usage: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      )
    }

    // Remove sensitive information
    const { password, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword)

  } catch (error) {
    console.error("Get profile error:", error)
    return NextResponse.json(
      { message: "An error occurred while fetching profile" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validate input
    const validatedFields = updateProfileSchema.safeParse(body)
    
    if (!validatedFields.success) {
      return NextResponse.json(
        { message: "Invalid input", errors: validatedFields.error.errors },
        { status: 400 }
      )
    }

    const { name, email } = validatedFields.data

    // Check if email is being changed and if it's already taken
    if (email && email !== session.user.email) {
      const existingUser = await db.user.findUnique({
        where: { email }
      })

      if (existingUser) {
        return NextResponse.json(
          { message: "User with this email already exists" },
          { status: 400 }
        )
      }
    }

    // Update user
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
      },
      include: {
        subscription: true,
        dashboardPreferences: true,
        usage: true,
      },
    })

    // Remove sensitive information
    const { password, ...userWithoutPassword } = updatedUser

    return NextResponse.json({
      message: "Profile updated successfully",
      user: userWithoutPassword,
    })

  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json(
      { message: "An error occurred while updating profile" },
      { status: 500 }
    )
  }
}