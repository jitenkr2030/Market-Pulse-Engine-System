import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { z } from "zod"

const createVolatilityPulseSchema = z.object({
  marketId: z.string(),
  vpi: z.number().min(0).max(100),
  impliedVol: z.number().min(0),
  realizedVol: z.number().min(0),
  volCompression: z.number().min(-100).max(100),
  volExpansion: z.number().min(-100).max(100),
  forecast5m: z.object({}).optional(),
  forecast15m: z.object({}).optional(),
  forecast30m: z.object({}).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const marketId = searchParams.get("marketId")
    const limit = Number(searchParams.get("limit")) || 100
    const offset = Number(searchParams.get("offset")) || 0

    const where = marketId ? { marketId } : {}

    const volatilityPulses = await db.volatilityPulse.findMany({
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

    return NextResponse.json(volatilityPulses)
  } catch (error) {
    console.error("Error fetching volatility pulses:", error)
    return NextResponse.json({ error: "Failed to fetch volatility pulses" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createVolatilityPulseSchema.parse(body)

    const volatilityPulse = await db.volatilityPulse.create({
      data: validatedData,
      include: {
        market: {
          select: { name: true, symbol: true },
        },
      },
    })

    return NextResponse.json(volatilityPulse, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }
    console.error("Error creating volatility pulse:", error)
    return NextResponse.json({ error: "Failed to create volatility pulse" }, { status: 500 })
  }
}