import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import ZAI from "z-ai-web-dev-sdk"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { marketId, pulseTypes, generateCount = 1 } = body

    if (!marketId || !pulseTypes || !Array.isArray(pulseTypes)) {
      return NextResponse.json({ error: "Market ID and pulse types array are required" }, { status: 400 })
    }

    const market = await db.market.findUnique({
      where: { id: marketId },
    })

    if (!market) {
      return NextResponse.json({ error: "Market not found" }, { status: 404 })
    }

    const zai = await ZAI.create()
    const generatedData = []

    for (let i = 0; i < generateCount; i++) {
      for (const pulseType of pulseTypes) {
        const pulseData = await generatePulseData(zai, market, pulseType)
        generatedData.push({ type: pulseType, data: pulseData })
      }
    }

    const results = await Promise.allSettled(
      generatedData.map(async ({ type, data }) => {
        switch (type) {
          case "sentiment":
            return db.sentimentPulse.create({ data: { ...data, marketId } })
          case "volatility":
            return db.volatilityPulse.create({ data: { ...data, marketId } })
          case "liquidity":
            return db.liquidityPulse.create({ data: { ...data, marketId } })
          case "flow":
            return db.flowPulse.create({ data: { ...data, marketId } })
          case "risk":
            return db.riskPulse.create({ data: { ...data, marketId } })
          case "momentum":
            return db.momentumPulse.create({ data: { ...data, marketId } })
          default:
            throw new Error(`Unknown pulse type: ${type}`)
        }
      })
    )

    const successful = results.filter(result => result.status === "fulfilled")
    const failed = results.filter(result => result.status === "rejected")

    if (successful.length > 0) {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/pulses?marketId=${marketId}`, {
        method: "PUT",
      })
    }

    return NextResponse.json({
      success: true,
      generated: successful.length,
      failed: failed.length,
      data: generatedData,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error generating pulse data:", error)
    return NextResponse.json(
      { error: "Failed to generate pulse data", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

async function generatePulseData(zai: any, market: any, pulseType: string) {
  const prompt = `Generate realistic ${pulseType} pulse data for ${market.name} (${market.symbol}).
  
  Current market context: ${market.description || "Major financial market"}
  
  Generate values that are realistic and reflect current market conditions. Return only a JSON object with the following structure:
  
  ${getPulseStructure(pulseType)}
  
  Make the values realistic and internally consistent. The data should reflect plausible market conditions.`

  const completion = await zai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are a market data generator. Generate realistic, plausible market data that reflects current market conditions. Always respond with valid JSON only.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.3,
    max_tokens: 500,
  })

  const responseContent = completion.choices[0]?.message?.content

  if (!responseContent) {
    throw new Error("No response from AI model")
  }

  try {
    return JSON.parse(responseContent)
  } catch (parseError) {
    console.error("Failed to parse AI response as JSON:", parseError)
    throw new Error("Invalid JSON response from AI model")
  }
}

function getPulseStructure(pulseType: string) {
  switch (pulseType) {
    case "sentiment":
      return `{
        "sps": number (-100 to 100),
        "fearGreed": number (0 to 100),
        "newsScore": number (-100 to 100),
        "socialScore": number (-100 to 100),
        "analystScore": number (-100 to 100),
        "sources": {
          "news": { positive: number, negative: number, neutral: number },
          "social": { positive: number, negative: number, neutral: number },
          "analyst": { buy: number, sell: number, hold: number }
        }
      }`

    case "volatility":
      return `{
        "vpi": number (0 to 100),
        "impliedVol": number (0+),
        "realizedVol": number (0+),
        "volCompression": number (-100 to 100),
        "volExpansion": number (-100 to 100),
        "forecast5m": { direction: "up|down|stable", confidence: number (0-100) },
        "forecast15m": { direction: "up|down|stable", confidence: number (0-100) },
        "forecast30m": { direction: "up|down|stable", confidence: number (0-100) }
      }`

    case "liquidity":
      return `{
        "lms": number (-100 to 100),
        "etfFlow": number (can be positive or negative),
        "volume": number (0+),
        "bidAskSpread": number (0+),
        "depth": number (0+),
        "inflows": number (0+),
        "outflows": number (0+),
        "netFlow": number (can be positive or negative)
      }`

    case "flow":
      return `{
        "fds": number (-100 to 100),
        "institutionalFlow": number (-100 to 100),
        "retailFlow": number (-100 to 100),
        "sectorRotation": number (-100 to 100),
        "longPositioning": number (-100 to 100),
        "shortPositioning": number (-100 to 100),
        "netPositioning": number (-100 to 100)
      }`

    case "risk":
      return `{
        "rtm": number (0 to 100),
        "leverage": number (0+),
        "fundingStress": number (0 to 100),
        "volatilitySync": number (0 to 100),
        "liquidityConcentration": number (0 to 100),
        "riskFactors": {
          "volatility": number (0-100),
          "liquidity": number (0-100),
          "leverage": number (0-100),
          "correlation": number (0-100),
          "systemic": number (0-100)
        }
      }`

    case "momentum":
      return `{
        "mpm": number (0 to 100),
        "trendStrength": number (0 to 100),
        "trendDirection": number (-1 to 1),
        "exhaustion": number (0 to 100),
        "mtfData": {
          "5m": { strength: number, direction: number },
          "15m": { strength: number, direction: number },
          "1h": { strength: number, direction: number },
          "4h": { strength: number, direction: number },
          "1d": { strength: number, direction: number }
        }
      }`

    default:
      return "{}"
  }
}