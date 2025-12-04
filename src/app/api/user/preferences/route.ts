import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"
import { db } from "@/lib/db"

const preferencesSchema = z.object({
  theme: z.enum(["light", "dark", "auto"]).optional(),
  timeFrame: z.enum(["1m", "5m", "15m", "1h", "4h", "1d"]).optional(),
  refreshInterval: z.number().min(5).max(300).optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  alertEmail: z.boolean().optional(),
  alertPush: z.boolean().optional(),
  alertSms: z.boolean().optional(),
  dataRetention: z.enum(["30", "90", "180", "365"]).optional(),
  autoExport: z.boolean().optional(),
  exportFormat: z.enum(["csv", "json", "xlsx"]).optional(),
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

    const preferences = await db.dashboardPreference.findUnique({
      where: { userId: session.user.id },
    })

    return NextResponse.json(preferences || {})

  } catch (error) {
    console.error("Get preferences error:", error)
    return NextResponse.json(
      { message: "An error occurred while fetching preferences" },
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
    const validatedFields = preferencesSchema.safeParse(body)
    
    if (!validatedFields.success) {
      return NextResponse.json(
        { message: "Invalid input", errors: validatedFields.error.errors },
        { status: 400 }
      )
    }

    const preferences = validatedFields.data

    // Update or create preferences
    const updatedPreferences = await db.dashboardPreference.upsert({
      where: { userId: session.user.id },
      update: {
        ...(preferences.theme && { theme: preferences.theme }),
        ...(preferences.timeFrame && { timeFrame: preferences.timeFrame }),
        ...(preferences.refreshInterval !== undefined && { refreshInterval: preferences.refreshInterval }),
        pulseLayout: {
          sentiment: { visible: true, order: 1 },
          volatility: { visible: true, order: 2 },
          liquidity: { visible: true, order: 3 },
          correlation: { visible: false, order: 4 },
          flow: { visible: true, order: 5 },
          risk: { visible: true, order: 6 },
          momentum: { visible: true, order: 7 },
        },
      },
      create: {
        userId: session.user.id,
        theme: preferences.theme || "auto",
        timeFrame: preferences.timeFrame || "1h",
        refreshInterval: preferences.refreshInterval || 30,
        pulseLayout: {
          sentiment: { visible: true, order: 1 },
          volatility: { visible: true, order: 2 },
          liquidity: { visible: true, order: 3 },
          correlation: { visible: false, order: 4 },
          flow: { visible: true, order: 5 },
          risk: { visible: true, order: 6 },
          momentum: { visible: true, order: 7 },
        },
      },
    })

    return NextResponse.json({
      message: "Preferences updated successfully",
      preferences: updatedPreferences,
    })

  } catch (error) {
    console.error("Update preferences error:", error)
    return NextResponse.json(
      { message: "An error occurred while updating preferences" },
      { status: 500 }
    )
  }
}