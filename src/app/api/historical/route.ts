import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const marketId = searchParams.get("marketId")
    const pulseType = searchParams.get("pulseType")
    const timeframe = searchParams.get("timeframe") || "1h"
    const limit = Number(searchParams.get("limit")) || 100
    const offset = Number(searchParams.get("offset")) || 0
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    if (!marketId || !pulseType) {
      return NextResponse.json({ error: "Market ID and pulse type are required" }, { status: 400 })
    }

    const where: any = { marketId }
    
    if (startDate && endDate) {
      where.timestamp = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    } else if (timeframe) {
      const now = new Date()
      let startTime = new Date()
      
      switch (timeframe) {
        case "5m":
          startTime.setMinutes(now.getMinutes() - 5)
          break
        case "15m":
          startTime.setMinutes(now.getMinutes() - 15)
          break
        case "1h":
          startTime.setHours(now.getHours() - 1)
          break
        case "4h":
          startTime.setHours(now.getHours() - 4)
          break
        case "1d":
          startTime.setDate(now.getDate() - 1)
          break
        case "1w":
          startTime.setDate(now.getDate() - 7)
          break
        case "1M":
          startTime.setMonth(now.getMonth() - 1)
          break
        default:
          startTime.setHours(now.getHours() - 1)
      }
      
      where.timestamp = { gte: startTime }
    }

    let data: any[] = []
    
    switch (pulseType) {
      case "sentiment":
        data = await db.sentimentPulse.findMany({
          where,
          orderBy: { timestamp: "asc" },
          take: limit,
          skip: offset,
        })
        break
      case "volatility":
        data = await db.volatilityPulse.findMany({
          where,
          orderBy: { timestamp: "asc" },
          take: limit,
          skip: offset,
        })
        break
      case "liquidity":
        data = await db.liquidityPulse.findMany({
          where,
          orderBy: { timestamp: "asc" },
          take: limit,
          skip: offset,
        })
        break
      case "correlation":
        data = await db.correlationPair.findMany({
          where: { ...where, market1Id: marketId },
          orderBy: { timestamp: "asc" },
          take: limit,
          skip: offset,
        })
        break
      case "flow":
        data = await db.flowPulse.findMany({
          where,
          orderBy: { timestamp: "asc" },
          take: limit,
          skip: offset,
        })
        break
      case "risk":
        data = await db.riskPulse.findMany({
          where,
          orderBy: { timestamp: "asc" },
          take: limit,
          skip: offset,
        })
        break
      case "momentum":
        data = await db.momentumPulse.findMany({
          where,
          orderBy: { timestamp: "asc" },
          take: limit,
          skip: offset,
        })
        break
      case "market":
        data = await db.marketPulse.findMany({
          where,
          orderBy: { timestamp: "asc" },
          take: limit,
          skip: offset,
        })
        break
      default:
        return NextResponse.json({ error: "Invalid pulse type" }, { status: 400 })
    }

    const aggregatedData = aggregateData(data, timeframe, pulseType)

    return NextResponse.json({
      success: true,
      data,
      aggregated: aggregatedData,
      metadata: {
        marketId,
        pulseType,
        timeframe,
        count: data.length,
        startDate: data[0]?.timestamp,
        endDate: data[data.length - 1]?.timestamp,
      },
    })
  } catch (error) {
    console.error("Error fetching historical data:", error)
    return NextResponse.json({ error: "Failed to fetch historical data" }, { status: 500 })
  }
}

function aggregateData(data: any[], timeframe: string, pulseType: string) {
  if (data.length === 0) return []

  const intervalMap: Record<string, number> = {
    "5m": 5 * 60 * 1000,
    "15m": 15 * 60 * 1000,
    "1h": 60 * 60 * 1000,
    "4h": 4 * 60 * 60 * 1000,
    "1d": 24 * 60 * 60 * 1000,
    "1w": 7 * 24 * 60 * 60 * 1000,
    "1M": 30 * 24 * 60 * 60 * 1000,
  }

  const interval = intervalMap[timeframe] || intervalMap["1h"]
  const aggregated: any[] = []
  let currentIntervalStart = new Date(Math.floor(data[0].timestamp.getTime() / interval) * interval)
  let currentIntervalData: any[] = []

  for (const item of data) {
    const itemTime = new Date(item.timestamp)
    
    if (itemTime < new Date(currentIntervalStart.getTime() + interval)) {
      currentIntervalData.push(item)
    } else {
      if (currentIntervalData.length > 0) {
        aggregated.push(aggregateInterval(currentIntervalData, pulseType, currentIntervalStart))
      }
      
      currentIntervalStart = new Date(Math.floor(itemTime.getTime() / interval) * interval)
      currentIntervalData = [item]
    }
  }

  if (currentIntervalData.length > 0) {
    aggregated.push(aggregateInterval(currentIntervalData, pulseType, currentIntervalStart))
  }

  return aggregated
}

function aggregateInterval(data: any[], pulseType: string, intervalStart: Date) {
  const getNumericFields = (type: string) => {
    switch (type) {
      case "sentiment":
        return ["sps", "fearGreed", "newsScore", "socialScore", "analystScore"]
      case "volatility":
        return ["vpi", "impliedVol", "realizedVol", "volCompression", "volExpansion"]
      case "liquidity":
        return ["lms", "etfFlow", "volume", "bidAskSpread", "depth", "inflows", "outflows", "netFlow"]
      case "flow":
        return ["fds", "institutionalFlow", "retailFlow", "sectorRotation", "longPositioning", "shortPositioning", "netPositioning"]
      case "risk":
        return ["rtm", "leverage", "fundingStress", "volatilitySync", "liquidityConcentration"]
      case "momentum":
        return ["mpm", "trendStrength", "trendDirection", "exhaustion"]
      case "market":
        return ["mpi", "pulseConvergence", "signalStrength"]
      case "correlation":
        return ["csm", "correlation", "correlationChange", "stability"]
      default:
        return []
    }
  }

  const numericFields = getNumericFields(pulseType)
  const aggregated: any = {
    timestamp: intervalStart,
    count: data.length,
  }

  for (const field of numericFields) {
    const values = data.map(item => item[field]).filter(val => val !== null && val !== undefined)
    
    if (values.length > 0) {
      aggregated[`${field}_avg`] = values.reduce((sum, val) => sum + val, 0) / values.length
      aggregated[`${field}_min`] = Math.min(...values)
      aggregated[`${field}_max`] = Math.max(...values)
      aggregated[`${field}_first`] = values[0]
      aggregated[`${field}_last`] = values[values.length - 1]
    }
  }

  return aggregated
}