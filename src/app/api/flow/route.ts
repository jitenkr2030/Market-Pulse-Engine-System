import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { z } from "zod"

const createFlowPulseSchema = z.object({
  marketId: z.string(),
  fds: z.number().min(-100).max(100),
  institutionalFlow: z.number().min(-100).max(100),
  retailFlow: z.number().min(-100).max(100),
  sectorRotation: z.number().min(-100).max(100),
  longPositioning: z.number().min(-100).max(100),
  shortPositioning: z.number().min(-100).max(100),
  netPositioning: z.number().min(-100).max(100),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const marketId = searchParams.get("marketId")
    const limit = Number(searchParams.get("limit")) || 100
    const offset = Number(searchParams.get("offset")) || 0

    const where = marketId ? { marketId } : {}

    const flowPulses = await db.flowPulse.findMany({
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

    return NextResponse.json(flowPulses)
  } catch (error) {
    console.error("Error fetching flow pulses:", error)
    return NextResponse.json({ error: "Failed to fetch flow pulses" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createFlowPulseSchema.parse(body)

    const flowPulse = await db.flowPulse.create({
      data: validatedData,
      include: {
        market: {
          select: { name: true, symbol: true },
        },
      },
    })

    return NextResponse.json(flowPulse, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }
    console.error("Error creating flow pulse:", error)
    return NextResponse.json({ error: "Failed to create flow pulse" }, { status: 500 })
  }
}