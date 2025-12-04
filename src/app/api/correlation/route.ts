import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { z } from "zod"

const createCorrelationPairSchema = z.object({
  market1Id: z.string(),
  market2Id: z.string(),
  csm: z.number().min(0).max(100),
  correlation: z.number().min(-1).max(1),
  correlationChange: z.number().min(-1).max(1),
  stability: z.number().min(0).max(100),
  historical: z.object({}).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const market1Id = searchParams.get("market1Id")
    const market2Id = searchParams.get("market2Id")
    const limit = Number(searchParams.get("limit")) || 100
    const offset = Number(searchParams.get("offset")) || 0

    const where: any = {}
    if (market1Id) where.market1Id = market1Id
    if (market2Id) where.market2Id = market2Id

    const correlationPairs = await db.correlationPair.findMany({
      where,
      orderBy: { timestamp: "desc" },
      take: limit,
      skip: offset,
      include: {
        market1: {
          select: { name: true, symbol: true },
        },
        market2: {
          select: { name: true, symbol: true },
        },
      },
    })

    return NextResponse.json(correlationPairs)
  } catch (error) {
    console.error("Error fetching correlation pairs:", error)
    return NextResponse.json({ error: "Failed to fetch correlation pairs" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createCorrelationPairSchema.parse(body)

    const correlationPair = await db.correlationPair.create({
      data: validatedData,
      include: {
        market1: {
          select: { name: true, symbol: true },
        },
        market2: {
          select: { name: true, symbol: true },
        },
      },
    })

    return NextResponse.json(correlationPair, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }
    console.error("Error creating correlation pair:", error)
    return NextResponse.json({ error: "Failed to create correlation pair" }, { status: 500 })
  }
}