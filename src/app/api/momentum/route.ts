import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { z } from "zod"

const createMomentumPulseSchema = z.object({
  marketId: z.string(),
  mpm: z.number().min(0).max(100),
  trendStrength: z.number().min(0).max(100),
  trendDirection: z.number().min(-1).max(1),
  exhaustion: z.number().min(0).max(100),
  mtfData: z.object({}).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const marketId = searchParams.get("marketId")
    const limit = Number(searchParams.get("limit")) || 100
    const offset = Number(searchParams.get("offset")) || 0

    const where = marketId ? { marketId } : {}

    const momentumPulses = await db.momentumPulse.findMany({
      where,
      orderBy: { timestamp: "desc" },
      take: limit,
      skip: offset,
      include: {
        market: {
          select: { name: true, symbol: true },
        },
      },
    })

    return NextResponse.json(momentumPulses)
  } catch (error) {
    console.error("Error fetching momentum pulses:", error)
    return NextResponse.json({ error: "Failed to fetch momentum pulses" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createMomentumPulseSchema.parse(body)

    const momentumPulse = await db.momentumPulse.create({
      data: validatedData,
      include: {
        market: {
          select: { name: true, symbol: true },
        },
      },
    })

    return NextResponse.json(momentumPulse, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }
    console.error("Error creating momentum pulse:", error)
    return NextResponse.json({ error: "Failed to create momentum pulse" }, { status: 500 })
  }
}