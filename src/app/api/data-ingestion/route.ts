import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { z } from "zod"

const bulkDataSchema = z.object({
  marketId: z.string(),
  sentiment: z.object({
    sps: z.number().min(-100).max(100),
    fearGreed: z.number().min(0).max(100),
    newsScore: z.number().min(-100).max(100),
    socialScore: z.number().min(-100).max(100),
    analystScore: z.number().min(-100).max(100),
    sources: z.object({}).optional(),
  }).optional(),
  volatility: z.object({
    vpi: z.number().min(0).max(100),
    impliedVol: z.number().min(0),
    realizedVol: z.number().min(0),
    volCompression: z.number().min(-100).max(100),
    volExpansion: z.number().min(-100).max(100),
    forecast5m: z.object({}).optional(),
    forecast15m: z.object({}).optional(),
    forecast30m: z.object({}).optional(),
  }).optional(),
  liquidity: z.object({
    lms: z.number().min(-100).max(100),
    etfFlow: z.number(),
    volume: z.number().min(0),
    bidAskSpread: z.number().min(0),
    depth: z.number().min(0),
    inflows: z.number(),
    outflows: z.number(),
    netFlow: z.number(),
  }).optional(),
  flow: z.object({
    fds: z.number().min(-100).max(100),
    institutionalFlow: z.number().min(-100).max(100),
    retailFlow: z.number().min(-100).max(100),
    sectorRotation: z.number().min(-100).max(100),
    longPositioning: z.number().min(-100).max(100),
    shortPositioning: z.number().min(-100).max(100),
    netPositioning: z.number().min(-100).max(100),
  }).optional(),
  risk: z.object({
    rtm: z.number().min(0).max(100),
    leverage: z.number().min(0),
    fundingStress: z.number().min(0).max(100),
    volatilitySync: z.number().min(0).max(100),
    liquidityConcentration: z.number().min(0).max(100),
    riskFactors: z.object({}).optional(),
  }).optional(),
  momentum: z.object({
    mpm: z.number().min(0).max(100),
    trendStrength: z.number().min(0).max(100),
    trendDirection: z.number().min(-1).max(1),
    exhaustion: z.number().min(0).max(100),
    mtfData: z.object({}).optional(),
  }).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = bulkDataSchema.parse(body)

    const { marketId, sentiment, volatility, liquidity, flow, risk, momentum } = validatedData

    const results = await Promise.allSettled([
      sentiment ? db.sentimentPulse.create({ data: { ...sentiment, marketId } }) : Promise.resolve(null),
      volatility ? db.volatilityPulse.create({ data: { ...volatility, marketId } }) : Promise.resolve(null),
      liquidity ? db.liquidityPulse.create({ data: { ...liquidity, marketId } }) : Promise.resolve(null),
      flow ? db.flowPulse.create({ data: { ...flow, marketId } }) : Promise.resolve(null),
      risk ? db.riskPulse.create({ data: { ...risk, marketId } }) : Promise.resolve(null),
      momentum ? db.momentumPulse.create({ data: { ...momentum, marketId } }) : Promise.resolve(null),
    ])

    const successful = results.filter(result => result.status === "fulfilled" && result.value !== null)
    const failed = results.filter(result => result.status === "rejected")

    if (failed.length > 0) {
      console.error("Some pulse data failed to save:", failed)
    }

    if (successful.length > 0) {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/pulses?marketId=${marketId}`, {
        method: "PUT",
      })
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${successful.length} pulse types`,
      failed: failed.length,
      errors: failed.map(f => f.status === "rejected" ? f.reason : null).filter(Boolean),
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }
    console.error("Error processing bulk data:", error)
    return NextResponse.json({ error: "Failed to process bulk data" }, { status: 500 })
  }
}