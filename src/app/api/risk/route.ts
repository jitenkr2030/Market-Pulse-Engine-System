import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { z } from "zod"

const createRiskPulseSchema = z.object({
  marketId: z.string(),
  rtm: z.number().min(0).max(100),
  leverage: z.number().min(0),
  fundingStress: z.number().min(0).max(100),
  volatilitySync: z.number().min(0).max(100),
  liquidityConcentration: z.number().min(0).max(100),
  riskFactors: z.object({}).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const marketId = searchParams.get("marketId")
    const limit = Number(searchParams.get("limit")) || 100
    const offset = Number(searchParams.get("offset")) || 0

    const where = marketId ? { marketId } : {}

    const riskPulses = await db.riskPulse.findMany({
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

    return NextResponse.json(riskPulses)
  } catch (error) {
    console.error("Error fetching risk pulses:", error)
    return NextResponse.json({ error: "Failed to fetch risk pulses" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createRiskPulseSchema.parse(body)

    const riskPulse = await db.riskPulse.create({
      data: validatedData,
      include: {
        market: {
          select: { name: true, symbol: true },
        },
      },
    })

    return NextResponse.json(riskPulse, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }
    console.error("Error creating risk pulse:", error)
    return NextResponse.json({ error: "Failed to create risk pulse" }, { status: 500 })
  }
}