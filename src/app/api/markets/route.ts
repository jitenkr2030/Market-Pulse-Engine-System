import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { z } from "zod"

const createMarketSchema = z.object({
  name: z.string().min(1, "Name is required"),
  symbol: z.string().min(1, "Symbol is required"),
  type: z.enum(["EQUITY", "BOND", "COMMODITY", "CURRENCY", "CRYPTO", "ETF", "INDEX", "FUTURES", "OPTIONS"]),
  description: z.string().optional(),
})

export async function GET() {
  try {
    const markets = await db.market.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            sentimentPulses: true,
            volatilityPulses: true,
            liquidityPulses: true,
          },
        },
      },
    })

    return NextResponse.json(markets)
  } catch (error) {
    console.error("Error fetching markets:", error)
    return NextResponse.json({ error: "Failed to fetch markets" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createMarketSchema.parse(body)

    const market = await db.market.create({
      data: validatedData,
    })

    return NextResponse.json(market, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }
    console.error("Error creating market:", error)
    return NextResponse.json({ error: "Failed to create market" }, { status: 500 })
  }
}