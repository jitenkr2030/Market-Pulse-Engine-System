import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const marketId = searchParams.get("marketId")
    const pulseType = searchParams.get("pulseType")
    const timeframe = searchParams.get("timeframe") || "24h"
    const limit = Number(searchParams.get("limit")) || 100

    if (!marketId || !pulseType) {
      return NextResponse.json({ error: "Market ID and pulse type are required" }, { status: 400 })
    }

    const timeThreshold = getTimeframeThreshold(timeframe)

    let data: any[] = []

    switch (pulseType) {
      case "sentiment":
        data = await db.sentimentPulse.findMany({
          where: {
            marketId,
            timestamp: {
              gte: timeThreshold,
            },
          },
          orderBy: { timestamp: "asc" },
          take: limit,
        })
        break

      case "volatility":
        data = await db.volatilityPulse.findMany({
          where: {
            marketId,
            timestamp: {
              gte: timeThreshold,
            },
          },
          orderBy: { timestamp: "asc" },
          take: limit,
        })
        break

      case "liquidity":
        data = await db.liquidityPulse.findMany({
          where: {
            marketId,
            timestamp: {
              gte: timeThreshold,
            },
          },
          orderBy: { timestamp: "asc" },
          take: limit,
        })
        break

      case "flow":
        data = await db.flowPulse.findMany({
          where: {
            marketId,
            timestamp: {
              gte: timeThreshold,
            },
          },
          orderBy: { timestamp: "asc" },
          take: limit,
        })
        break

      case "risk":
        data = await db.riskPulse.findMany({
          where: {
            marketId,
            timestamp: {
              gte: timeThreshold,
            },
          },
          orderBy: { timestamp: "asc" },
          take: limit,
        })
        break

      case "momentum":
        data = await db.momentumPulse.findMany({
          where: {
            marketId,
            timestamp: {
              gte: timeThreshold,
            },
          },
          orderBy: { timestamp: "asc" },
          take: limit,
        })
        break

      case "market":
        data = await db.marketPulse.findMany({
          where: {
            marketId,
            timestamp: {
              gte: timeThreshold,
            },
          },
          orderBy: { timestamp: "asc" },
          take: limit,
        })
        break

      default:
        return NextResponse.json({ error: "Invalid pulse type" }, { status: 400 })
    }

    const analytics = generateAnalytics(data, pulseType)

    return NextResponse.json({
      success: true,
      data,
      analytics,
      metadata: {
        marketId,
        pulseType,
        timeframe,
        count: data.length,
        timeRange: {
          start: timeThreshold,
          end: new Date(),
        },
      },
    })
  } catch (error) {
    console.error("Error fetching historical data:", error)
    return NextResponse.json({ error: "Failed to fetch historical data" }, { status: 500 })
  }
}

function getTimeframeThreshold(timeframe: string): Date {
  const now = new Date()
  const threshold = new Date(now)

  switch (timeframe) {
    case "1h":
      threshold.setHours(now.getHours() - 1)
      break
    case "4h":
      threshold.setHours(now.getHours() - 4)
      break
    case "24h":
      threshold.setDate(now.getDate() - 1)
      break
    case "7d":
      threshold.setDate(now.getDate() - 7)
      break
    case "30d":
      threshold.setDate(now.getDate() - 30)
      break
    case "90d":
      threshold.setDate(now.getDate() - 90)
      break
    case "1y":
      threshold.setFullYear(now.getFullYear() - 1)
      break
    default:
      threshold.setDate(now.getDate() - 1)
  }

  return threshold
}

function generateAnalytics(data: any[], pulseType: string): any {
  if (data.length === 0) {
    return {
      message: "No data available for the specified timeframe",
    }
  }

  const getValue = (item: any) => {
    switch (pulseType) {
      case "sentiment":
        return item.sps
      case "volatility":
        return item.vpi
      case "liquidity":
        return item.lms
      case "flow":
        return item.fds
      case "risk":
        return item.rtm
      case "momentum":
        return item.mpm
      case "market":
        return item.mpi
      default:
        return 0
    }
  }

  const values = data.map(getValue).filter(v => v !== null && v !== undefined)
  
  if (values.length === 0) {
    return {
      message: "No valid values found in the data",
    }
  }

  const sorted = [...values].sort((a, b) => a - b)
  const min = sorted[0]
  const max = sorted[sorted.length - 1]
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length
  
  const median = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)]

  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
  const standardDeviation = Math.sqrt(variance)

  const trend = calculateTrend(values)
  const volatility = calculateVolatility(values)

  return {
    statistics: {
      count: values.length,
      min: Number(min.toFixed(2)),
      max: Number(max.toFixed(2)),
      mean: Number(mean.toFixed(2)),
      median: Number(median.toFixed(2)),
      standardDeviation: Number(standardDeviation.toFixed(2)),
      variance: Number(variance.toFixed(2)),
    },
    trend: {
      direction: trend.direction,
      strength: trend.strength,
      change: Number(trend.change.toFixed(2)),
    },
    volatility: {
      value: Number(volatility.toFixed(2)),
      level: getVolatilityLevel(volatility),
    },
    recent: {
      latest: Number(values[values.length - 1].toFixed(2)),
      previous: Number(values[values.length - 2]?.toFixed(2) || values[values.length - 1].toFixed(2)),
      change: values.length > 1 
        ? Number((values[values.length - 1] - values[values.length - 2]).toFixed(2))
        : 0,
      changePercent: values.length > 1
        ? Number(((values[values.length - 1] - values[values.length - 2]) / values[values.length - 2] * 100).toFixed(2))
        : 0,
    },
  }
}

function calculateTrend(values: number[]): { direction: string; strength: string; change: number } {
  if (values.length < 2) {
    return { direction: "neutral", strength: "none", change: 0 }
  }

  const firstHalf = values.slice(0, Math.floor(values.length / 2))
  const secondHalf = values.slice(Math.floor(values.length / 2))

  const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length

  const change = secondAvg - firstAvg
  const changePercent = Math.abs(change / firstAvg) * 100

  let direction = "neutral"
  if (change > 0) direction = "up"
  else if (change < 0) direction = "down"

  let strength = "weak"
  if (changePercent > 5) strength = "strong"
  else if (changePercent > 2) strength = "moderate"

  return { direction, strength, change }
}

function calculateVolatility(values: number[]): number {
  if (values.length < 2) return 0

  const mean = values.reduce((sum, val) => sum + val, 0) / values.length
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2))
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length
  
  return Math.sqrt(variance)
}

function getVolatilityLevel(volatility: number): string {
  if (volatility < 5) return "low"
  if (volatility < 15) return "moderate"
  if (volatility < 30) return "high"
  return "extreme"
}