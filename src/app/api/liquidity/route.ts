import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { z } from "zod"

const createLiquidityPulseSchema = z.object({
  marketId: z.string(),
  lms: z.number().min(-100).max(100),
  etfFlow: z.number(),
  volume: z.number().min(0),
  bidAskSpread: z.number().min(0),
  depth: z.number().min(0),
  inflows: z.number(),
  outflows: z.number(),
  netFlow: z.number(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const marketId = searchParams.get("marketId")
    const limit = Number(searchParams.get("limit")) || 100
    const offset = Number(searchParams.get("offset")) || 0

    const where = marketId ? { marketId } : {}

    const liquidityPulses = await db.liquidityPulse.findMany({
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

    return NextResponse.json(liquidityPulses)
  } catch (error) {
    console.error("Error fetching liquidity pulses:", error)
    return NextResponse.json({ error: "Failed to fetch liquidity pulses" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createLiquidityPulseSchema.parse(body)

    const liquidityPulse = await db.liquidityPulse.create({
      data: validatedData,
      include: {
        market: {
          select: { name: true, symbol: true },
        },
      },
    })

    return NextResponse.json(liquidityPulse, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }
    console.error("Error creating liquidity pulse:", error)
    return NextResponse.json({ error: "Failed to create liquidity pulse" }, { status: 500 })
  }
}