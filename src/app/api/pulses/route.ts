import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { z } from "zod"

const createMarketPulseSchema = z.object({
  marketId: z.string(),
  mpi: z.number().min(0).max(100),
  pulseConvergence: z.number().min(0).max(100),
  signalStrength: z.number().min(0).max(100),
  sentimentWeight: z.number().min(0).max(1),
  volatilityWeight: z.number().min(0).max(1),
  liquidityWeight: z.number().min(0).max(1),
  correlationWeight: z.number().min(0).max(1),
  flowWeight: z.number().min(0).max(1),
  riskWeight: z.number().min(0).max(1),
  momentumWeight: z.number().min(0).max(1),
  forecast: z.object({}).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const marketId = searchParams.get("marketId")
    const limit = Number(searchParams.get("limit")) || 100
    const offset = Number(searchParams.get("offset")) || 0

    const where = marketId ? { marketId } : {}

    const marketPulses = await db.marketPulse.findMany({
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

    return NextResponse.json(marketPulses)
  } catch (error) {
    console.error("Error fetching market pulses:", error)
    return NextResponse.json({ error: "Failed to fetch market pulses" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createMarketPulseSchema.parse(body)

    const marketPulse = await db.marketPulse.create({
      data: validatedData,
      include: {
        market: {
          select: { name: true, symbol: true },
        },
      },
    })

    return NextResponse.json(marketPulse, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }
    console.error("Error creating market pulse:", error)
    return NextResponse.json({ error: "Failed to create market pulse" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const marketId = searchParams.get("marketId")

    if (!marketId) {
      return NextResponse.json({ error: "Market ID is required" }, { status: 400 })
    }

    const latestPulses = await Promise.all([
      db.sentimentPulse.findFirst({ where: { marketId }, orderBy: { timestamp: "desc" } }),
      db.volatilityPulse.findFirst({ where: { marketId }, orderBy: { timestamp: "desc" } }),
      db.liquidityPulse.findFirst({ where: { marketId }, orderBy: { timestamp: "desc" } }),
      db.flowPulse.findFirst({ where: { marketId }, orderBy: { timestamp: "desc" } }),
      db.riskPulse.findFirst({ where: { marketId }, orderBy: { timestamp: "desc" } }),
      db.momentumPulse.findFirst({ where: { marketId }, orderBy: { timestamp: "desc" } }),
    ])

    const [sentiment, volatility, liquidity, flow, risk, momentum] = latestPulses

    if (!sentiment || !volatility || !liquidity || !flow || !risk || !momentum) {
      return NextResponse.json({ error: "Insufficient data to calculate MPI" }, { status: 400 })
    }

    const weights = {
      sentiment: 0.15,
      volatility: 0.20,
      liquidity: 0.15,
      flow: 0.15,
      risk: 0.20,
      momentum: 0.15,
    }

    const normalizedScores = {
      sentiment: (sentiment.sps + 100) / 2,
      volatility: 100 - volatility.vpi,
      liquidity: (liquidity.lms + 100) / 2,
      flow: (flow.fds + 100) / 2,
      risk: 100 - risk.rtm,
      momentum: momentum.mpm,
    }

    const mpi = Object.entries(weights).reduce((sum, [key, weight]) => {
      return sum + (normalizedScores[key as keyof typeof normalizedScores] * weight)
    }, 0)

    const pulseConvergence = calculatePulseConvergence(latestPulses)
    const signalStrength = calculateSignalStrength(latestPulses)

    const marketPulse = await db.marketPulse.create({
      data: {
        marketId,
        mpi: Math.round(mpi * 100) / 100,
        pulseConvergence,
        signalStrength,
        sentimentWeight: weights.sentiment,
        volatilityWeight: weights.volatility,
        liquidityWeight: weights.liquidity,
        correlationWeight: 0,
        flowWeight: weights.flow,
        riskWeight: weights.risk,
        momentumWeight: weights.momentum,
        forecast: generateForecast(latestPulses),
      },
      include: {
        market: {
          select: { name: true, symbol: true },
        },
      },
    })

    return NextResponse.json(marketPulse)
  } catch (error) {
    console.error("Error calculating market pulse:", error)
    return NextResponse.json({ error: "Failed to calculate market pulse" }, { status: 500 })
  }
}

function calculatePulseConvergence(pulses: any[]): number {
  const scores = pulses.map(pulse => {
    if (pulse?.sps !== undefined) return (pulse.sps + 100) / 2
    if (pulse?.vpi !== undefined) return 100 - pulse.vpi
    if (pulse?.lms !== undefined) return (pulse.lms + 100) / 2
    if (pulse?.fds !== undefined) return (pulse.fds + 100) / 2
    if (pulse?.rtm !== undefined) return 100 - pulse.rtm
    if (pulse?.mpm !== undefined) return pulse.mpm
    return 50
  }).filter(score => score !== null)

  if (scores.length < 2) return 50

  const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length
  const standardDeviation = Math.sqrt(variance)

  return Math.max(0, Math.min(100, 100 - (standardDeviation * 2)))
}

function calculateSignalStrength(pulses: any[]): number {
  const extremeCount = pulses.filter(pulse => {
    if (pulse?.sps !== undefined) return Math.abs(pulse.sps) > 70
    if (pulse?.vpi !== undefined) return pulse.vpi > 70 || pulse.vpi < 30
    if (pulse?.lms !== undefined) return Math.abs(pulse.lms) > 70
    if (pulse?.fds !== undefined) return Math.abs(pulse.fds) > 70
    if (pulse?.rtm !== undefined) return pulse.rtm > 70
    if (pulse?.mpm !== undefined) return pulse.mpm > 80 || pulse.mpm < 20
    return false
  }).length

  return Math.min(100, (extremeCount / pulses.length) * 100)
}

function generateForecast(pulses: any[]): any {
  return {
    trend: pulses.some(p => p?.mpm > 60) ? "bullish" : "bearish",
    confidence: Math.floor(Math.random() * 30) + 60,
    timeframe: "24h",
    keyDrivers: [
      "Momentum strength",
      "Risk appetite",
      "Liquidity conditions"
    ]
  }
}