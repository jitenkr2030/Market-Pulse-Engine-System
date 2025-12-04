import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { z } from "zod"

const createSentimentPulseSchema = z.object({
  marketId: z.string(),
  sps: z.number().min(-100).max(100),
  fearGreed: z.number().min(0).max(100),
  newsScore: z.number().min(-100).max(100),
  socialScore: z.number().min(-100).max(100),
  analystScore: z.number().min(-100).max(100),
  sources: z.object({}).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const marketId = searchParams.get("marketId")
    const limit = Number(searchParams.get("limit")) || 100
    const offset = Number(searchParams.get("offset")) || 0

    const where = marketId ? { marketId } : {}

    const sentimentPulses = await db.sentimentPulse.findMany({
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

    return NextResponse.json(sentimentPulses)
  } catch (error) {
    console.error("Error fetching sentiment pulses:", error)
    return NextResponse.json({ error: "Failed to fetch sentiment pulses" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createSentimentPulseSchema.parse(body)

    const sentimentPulse = await db.sentimentPulse.create({
      data: validatedData,
      include: {
        market: {
          select: { name: true, symbol: true },
        },
      },
    })

    return NextResponse.json(sentimentPulse, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }
    console.error("Error creating sentiment pulse:", error)
    return NextResponse.json({ error: "Failed to create sentiment pulse" }, { status: 500 })
  }
}