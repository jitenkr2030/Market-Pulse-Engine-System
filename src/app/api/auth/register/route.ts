import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { db } from "@/lib/db"

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedFields = registerSchema.safeParse(body)
    
    if (!validatedFields.success) {
      return NextResponse.json(
        { message: "Invalid input", errors: validatedFields.error.errors },
        { status: 400 }
      )
    }

    const { name, email, password } = validatedFields.data

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        emailVerified: new Date(), // Auto-verify for now
      },
      include: {
        subscription: true,
      },
    })

    // Create free subscription for new user
    const subscription = await db.subscription.create({
      data: {
        userId: user.id,
        plan: "FREE",
        status: "ACTIVE",
        amount: 0,
        currency: "USD",
        billingCycle: "MONTHLY",
        startDate: new Date(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
        trialUsed: false,
        autoRenew: false,
        features: {
          apiCalls: 1000,
          aiAnalysis: 50,
          alerts: 10,
          dataExport: 5,
          websocketConn: 1,
        },
      },
    })

    // Create usage tracking
    await db.usage.create({
      data: {
        userId: user.id,
        period: "MONTHLY",
        resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    })

    // Create default dashboard preferences
    await db.dashboardPreference.create({
      data: {
        userId: user.id,
        pulseLayout: {
          sentiment: { visible: true, order: 1 },
          volatility: { visible: true, order: 2 },
          liquidity: { visible: true, order: 3 },
          correlation: { visible: false, order: 4 },
          flow: { visible: true, order: 5 },
          risk: { visible: true, order: 6 },
          momentum: { visible: true, order: 7 },
        },
        timeFrame: "1h",
        theme: "auto",
        refreshInterval: 30,
      },
    })

    // Return success response (without password)
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      message: "User created successfully",
      user: userWithoutPassword,
      subscription,
    }, { status: 201 })

  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { message: "An error occurred during registration" },
      { status: 500 }
    )
  }
}