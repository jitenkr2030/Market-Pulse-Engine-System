import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const marketId = searchParams.get("marketId")
    const pulseType = searchParams.get("pulseType")
    const format = searchParams.get("format") || "json"
    const timeframe = searchParams.get("timeframe") || "1d"
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
        case "3M":
          startTime.setMonth(now.getMonth() - 3)
          break
        case "1y":
          startTime.setFullYear(now.getFullYear() - 1)
          break
        default:
          startTime.setDate(now.getDate() - 1)
      }
      
      where.timestamp = { gte: startTime }
    }

    let data: any[] = []
    
    switch (pulseType) {
      case "sentiment":
        data = await db.sentimentPulse.findMany({
          where,
          orderBy: { timestamp: "asc" },
          include: {
            market: { select: { name: true, symbol: true } },
          },
        })
        break
      case "volatility":
        data = await db.volatilityPulse.findMany({
          where,
          orderBy: { timestamp: "asc" },
          include: {
            market: { select: { name: true, symbol: true } },
          },
        })
        break
      case "liquidity":
        data = await db.liquidityPulse.findMany({
          where,
          orderBy: { timestamp: "asc" },
          include: {
            market: { select: { name: true, symbol: true } },
          },
        })
        break
      case "flow":
        data = await db.flowPulse.findMany({
          where,
          orderBy: { timestamp: "asc" },
          include: {
            market: { select: { name: true, symbol: true } },
          },
        })
        break
      case "risk":
        data = await db.riskPulse.findMany({
          where,
          orderBy: { timestamp: "asc" },
          include: {
            market: { select: { name: true, symbol: true } },
          },
        })
        break
      case "momentum":
        data = await db.momentumPulse.findMany({
          where,
          orderBy: { timestamp: "asc" },
          include: {
            market: { select: { name: true, symbol: true } },
          },
        })
        break
      case "market":
        data = await db.marketPulse.findMany({
          where,
          orderBy: { timestamp: "asc" },
          include: {
            market: { select: { name: true, symbol: true } },
          },
        })
        break
      default:
        return NextResponse.json({ error: "Invalid pulse type" }, { status: 400 })
    }

    if (data.length === 0) {
      return NextResponse.json({ error: "No data found for the specified criteria" }, { status: 404 })
    }

    const market = data[0].market
    const exportData = data.map(item => ({
      timestamp: item.timestamp,
      ...extractPulseData(item, pulseType),
    }))

    if (format === "csv") {
      const csv = convertToCSV(exportData, pulseType)
      const filename = `${market.symbol}_${pulseType}_${timeframe}_${new Date().toISOString().split('T')[0]}.csv`
      
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      })
    } else {
      const filename = `${market.symbol}_${pulseType}_${timeframe}_${new Date().toISOString().split('T')[0]}.json`
      
      return new NextResponse(JSON.stringify(exportData, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      })
    }
  } catch (error) {
    console.error("Error exporting data:", error)
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 })
  }
}

function extractPulseData(item: any, pulseType: string) {
  switch (pulseType) {
    case "sentiment":
      return {
        sps: item.sps,
        fearGreed: item.fearGreed,
        newsScore: item.newsScore,
        socialScore: item.socialScore,
        analystScore: item.analystScore,
      }
    case "volatility":
      return {
        vpi: item.vpi,
        impliedVol: item.impliedVol,
        realizedVol: item.realizedVol,
        volCompression: item.volCompression,
        volExpansion: item.volExpansion,
      }
    case "liquidity":
      return {
        lms: item.lms,
        etfFlow: item.etfFlow,
        volume: item.volume,
        bidAskSpread: item.bidAskSpread,
        depth: item.depth,
        inflows: item.inflows,
        outflows: item.outflows,
        netFlow: item.netFlow,
      }
    case "flow":
      return {
        fds: item.fds,
        institutionalFlow: item.institutionalFlow,
        retailFlow: item.retailFlow,
        sectorRotation: item.sectorRotation,
        longPositioning: item.longPositioning,
        shortPositioning: item.shortPositioning,
        netPositioning: item.netPositioning,
      }
    case "risk":
      return {
        rtm: item.rtm,
        leverage: item.leverage,
        fundingStress: item.fundingStress,
        volatilitySync: item.volatilitySync,
        liquidityConcentration: item.liquidityConcentration,
      }
    case "momentum":
      return {
        mpm: item.mpm,
        trendStrength: item.trendStrength,
        trendDirection: item.trendDirection,
        exhaustion: item.exhaustion,
      }
    case "market":
      return {
        mpi: item.mpi,
        pulseConvergence: item.pulseConvergence,
        signalStrength: item.signalStrength,
        sentimentWeight: item.sentimentWeight,
        volatilityWeight: item.volatilityWeight,
        liquidityWeight: item.liquidityWeight,
        flowWeight: item.flowWeight,
        riskWeight: item.riskWeight,
        momentumWeight: item.momentumWeight,
      }
    default:
      return {}
  }
}

function convertToCSV(data: any[], pulseType: string): string {
  if (data.length === 0) return ""

  const headers = ["timestamp"]
  
  switch (pulseType) {
    case "sentiment":
      headers.push("sps", "fearGreed", "newsScore", "socialScore", "analystScore")
      break
    case "volatility":
      headers.push("vpi", "impliedVol", "realizedVol", "volCompression", "volExpansion")
      break
    case "liquidity":
      headers.push("lms", "etfFlow", "volume", "bidAskSpread", "depth", "inflows", "outflows", "netFlow")
      break
    case "flow":
      headers.push("fds", "institutionalFlow", "retailFlow", "sectorRotation", "longPositioning", "shortPositioning", "netPositioning")
      break
    case "risk":
      headers.push("rtm", "leverage", "fundingStress", "volatilitySync", "liquidityConcentration")
      break
    case "momentum":
      headers.push("mpm", "trendStrength", "trendDirection", "exhaustion")
      break
    case "market":
      headers.push("mpi", "pulseConvergence", "signalStrength", "sentimentWeight", "volatilityWeight", "liquidityWeight", "flowWeight", "riskWeight", "momentumWeight")
      break
  }

  const csvRows = [
    headers.join(","),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        if (value === null || value === undefined) return ""
        if (typeof value === "string" && value.includes(",")) return `"${value}"`
        return value
      }).join(",")
    )
  ]

  return csvRows.join("\n")
}