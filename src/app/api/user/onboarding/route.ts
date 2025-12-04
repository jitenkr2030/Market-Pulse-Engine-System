import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"
import { db } from "@/lib/db"

const onboardingSchema = z.object({
  completed: z.boolean(),
  step: z.number().optional(),
})

export async function POST(request: NextRequest) {
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
    const validatedFields = onboardingSchema.safeParse(body)
    
    if (!validatedFields.success) {
      return NextResponse.json(
        { message: "Invalid input", errors: validatedFields.error.errors },
        { status: 400 }
      )
    }

    const { completed, step } = validatedFields.data

    // Update user's onboarding status
    // We'll add an onboardingCompleted field to the User model
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        // For now, we'll store this in the dashboard preferences
        dashboardPreferences: {
          upsert: {
            create: {
              pulseLayout: {},
              timeFrame: "1h",
              theme: "auto",
              refreshInterval: 30,
              onboardingCompleted: completed,
              onboardingStep: step || 0,
            },
            update: {
              onboardingCompleted: completed,
              onboardingStep: step || 0,
            },
          },
        },
      },
      include: {
        dashboardPreferences: true,
      },
    })

    return NextResponse.json({
      message: "Onboarding status updated successfully",
      onboardingCompleted: completed,
      step: step,
    })

  } catch (error) {
    console.error("Onboarding update error:", error)
    return NextResponse.json(
      { message: "An error occurred while updating onboarding status" },
      { status: 500 }
    )
  }
}

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
        dashboardPreferences: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      )
    }

    const onboardingStatus = {
      completed: user.dashboardPreferences?.onboardingCompleted || false,
      step: user.dashboardPreferences?.onboardingStep || 0,
    }

    return NextResponse.json(onboardingStatus)

  } catch (error) {
    console.error("Get onboarding status error:", error)
    return NextResponse.json(
      { message: "An error occurred while fetching onboarding status" },
      { status: 500 }
    )
  }
}