import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const marketId = searchParams.get("marketId")
    const pulseType = searchParams.get("pulseType")
    const timeframe = searchParams.get("timeframe") || "1d"

    if (!marketId || !pulseType) {
      return NextResponse.json({ error: "Market ID and pulse type are required" }, { status: 400 })
    }

    const endDate = new Date()
    const startDate = new Date()
    
    switch (timeframe) {
      case "1h":
        startDate.setHours(endDate.getHours() - 1)
        break
      case "4h":
        startDate.setHours(endDate.getHours() - 4)
        break
      case "1d":
        startDate.setDate(endDate.getDate() - 1)
        break
      case "1w":
        startDate.setDate(endDate.getDate() - 7)
        break
      case "1M":
        startDate.setMonth(endDate.getMonth() - 1)
        break
      case "3M":
        startDate.setMonth(endDate.getMonth() - 3)
        break
      case "1y":
        startDate.setFullYear(endDate.getFullYear() - 1)
        break
      default:
        startDate.setDate(endDate.getDate() - 1)
    }

    const where = {
      marketId,
      timestamp: {
        gte: startDate,
        lte: endDate,
      },
    }

    let data: any[] = []
    
    switch (pulseType) {
      case "sentiment":
        data = await db.sentimentPulse.findMany({ where })
        break
      case "volatility":
        data = await db.volatilityPulse.findMany({ where })
        break
      case "liquidity":
        data = await db.liquidityPulse.findMany({ where })
        break
      case "flow":
        data = await db.flowPulse.findMany({ where })
        break
      case "risk":
        data = await db.riskPulse.findMany({ where })
        break
      case "momentum":
        data = await db.momentumPulse.findMany({ where })
        break
      case "market":
        data = await db.marketPulse.findMany({ where })
        break
      default:
        return NextResponse.json({ error: "Invalid pulse type" }, { status: 400 })
    }

    if (data.length === 0) {
      return NextResponse.json({
        success: true,
        analytics: {
          message: "No data available for the specified timeframe",
          dataPoints: 0,
        },
      })
    }

    const analytics = calculateAnalytics(data, pulseType, timeframe)

    return NextResponse.json({
      success: true,
      analytics,
      metadata: {
        marketId,
        pulseType,
        timeframe,
        dataPoints: data.length,
        startDate,
        endDate,
      },
    })
  } catch (error) {
    console.error("Error calculating analytics:", error)
    return NextResponse.json({ error: "Failed to calculate analytics" }, { status: 500 })
  }
}

function calculateAnalytics(data: any[], pulseType: string, timeframe: string) {
  const getValueFields = (type: string) => {
    switch (type) {
      case "sentiment":
        return { primary: "sps", secondary: ["fearGreed", "newsScore", "socialScore", "analystScore"] }
      case "volatility":
        return { primary: "vpi", secondary: ["impliedVol", "realizedVol"] }
      case "liquidity":
        return { primary: "lms", secondary: ["volume", "netFlow"] }
      case "flow":
        return { primary: "fds", secondary: ["institutionalFlow", "retailFlow"] }
      case "risk":
        return { primary: "rtm", secondary: ["leverage", "fundingStress"] }
      case "momentum":
        return { primary: "mpm", secondary: ["trendStrength", "trendDirection"] }
      case "market":
        return { primary: "mpi", secondary: ["pulseConvergence", "signalStrength"] }
      default:
        return { primary: "", secondary: [] }
    }
  }

  const { primary, secondary } = getValueFields(pulseType)
  if (!primary) return {}

  const values = data.map(d => d[primary]).filter(v => v !== null && v !== undefined)
  
  if (values.length === 0) return {}

  const analytics: any = {
    primaryMetric: primary,
    dataPoints: values.length,
    current: values[values.length - 1],
    previous: values[values.length - 2] || values[values.length - 1],
    change: values.length > 1 ? values[values.length - 1] - values[values.length - 2] : 0,
    changePercent: values.length > 1 ? ((values[values.length - 1] - values[values.length - 2]) / values[values.length - 2]) * 100 : 0,
    
    statistics: {
      min: Math.min(...values),
      max: Math.max(...values),
      mean: values.reduce((sum, val) => sum + val, 0) / values.length,
      median: calculateMedian(values),
      standardDeviation: calculateStandardDeviation(values),
    },
    
    trend: calculateTrend(values),
    volatility: calculateVolatility(values),
  }

  if (secondary.length > 0) {
    analytics.secondaryMetrics = {}
    for (const field of secondary) {
      const secValues = data.map(d => d[field]).filter(v => v !== null && v !== undefined)
      if (secValues.length > 0) {
        analytics.secondaryMetrics[field] = {
          current: secValues[secValues.length - 1],
          change: secValues.length > 1 ? secValues[secValues.length - 1] - secValues[secValues.length - 2] : 0,
          mean: secValues.reduce((sum, val) => sum + val, 0) / secValues.length,
        }
      }
    }
  }

  analytics.insights = generateInsights(analytics, pulseType, timeframe)

  return analytics
}

function calculateMedian(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 
    ? (sorted[mid - 1] + sorted[mid]) / 2 
    : sorted[mid]
}

function calculateStandardDeviation(values: number[]): number {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2))
  const avgSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length
  return Math.sqrt(avgSquaredDiff)
}

function calculateTrend(values: number[]): string {
  if (values.length < 3) return "insufficient_data"
  
  const recent = values.slice(-10)
  const earlier = values.slice(-20, -10)
  
  if (earlier.length === 0) return "insufficient_data"
  
  const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length
  const earlierAvg = earlier.reduce((sum, val) => sum + val, 0) / earlier.length
  
  const change = ((recentAvg - earlierAvg) / earlierAvg) * 100
  
  if (change > 5) return "strong_up"
  if (change > 2) return "up"
  if (change < -5) return "strong_down"
  if (change < -2) return "down"
  return "stable"
}

function calculateVolatility(values: number[]): number {
  if (values.length < 2) return 0
  
  const changes = []
  for (let i = 1; i < values.length; i++) {
    changes.push(Math.abs(values[i] - values[i - 1]))
  }
  
  return changes.reduce((sum, val) => sum + val, 0) / changes.length
}

function generateInsights(analytics: any, pulseType: string, timeframe: string): string[] {
  const insights: string[] = []
  
  const { current, change, changePercent, trend, volatility, statistics } = analytics
  
  if (trend === "strong_up") {
    insights.push(`Strong upward trend detected in ${pulseType} over the ${timeframe} period`)
  } else if (trend === "strong_down") {
    insights.push(`Strong downward trend detected in ${pulseType} over the ${timeframe} period`)
  }
  
  if (Math.abs(changePercent) > 10) {
    insights.push(`Significant ${changePercent > 0 ? "increase" : "decrease"} of ${Math.abs(changePercent).toFixed(1)}% observed`)
  }
  
  if (volatility > statistics.standardDeviation * 1.5) {
    insights.push("High volatility detected - expect continued price swings")
  }
  
  if (current > statistics.mean + statistics.standardDeviation) {
    insights.push("Current levels are above average - potential overbought conditions")
  } else if (current < statistics.mean - statistics.standardDeviation) {
    insights.push("Current levels are below average - potential oversold conditions")
  }
  
  return insights
}