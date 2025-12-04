import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { z } from "zod"

const updatePreferencesSchema = z.object({
  pulseLayout: z.object({}).optional(),
  timeFrame: z.enum(["5m", "15m", "1h", "4h", "1d"]).optional(),
  theme: z.enum(["light", "dark", "auto"]).optional(),
  refreshInterval: z.number().min(5).max(300).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const preferences = await db.dashboardPreference.findUnique({
      where: { userId },
    })

    if (!preferences) {
      return NextResponse.json({ error: "Preferences not found" }, { status: 404 })
    }

    return NextResponse.json(preferences)
  } catch (error) {
    console.error("Error fetching preferences:", error)
    return NextResponse.json({ error: "Failed to fetch preferences" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const body = await request.json()
    const validatedData = updatePreferencesSchema.parse(body)

    const preferences = await db.dashboardPreference.upsert({
      where: { userId },
      update: validatedData,
      create: {
        userId,
        ...validatedData,
        pulseLayout: validatedData.pulseLayout || {},
        timeFrame: validatedData.timeFrame || "1h",
        theme: validatedData.theme || "auto",
        refreshInterval: validatedData.refreshInterval || 30,
      },
    })

    return NextResponse.json(preferences)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }
    console.error("Error updating preferences:", error)
    return NextResponse.json({ error: "Failed to update preferences" }, { status: 500 })
  }
}