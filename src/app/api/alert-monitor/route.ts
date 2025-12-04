import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

const ALERT_THRESHOLD = 10
const SIGNIFICANT_CHANGE_THRESHOLD = 20

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pulseType, marketId, currentValue, previousValue } = body

    if (!pulseType || !marketId || currentValue === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const alerts = await db.alert.findMany({
      where: {
        isActive: true,
        pulseType: pulseType.toUpperCase(),
        OR: [
          { marketId: marketId },
          { marketId: null },
        ],
      },
      include: {
        user: true,
      },
    })

    const triggeredAlerts = []

    for (const alert of alerts) {
      const shouldTrigger = checkAlertCondition(alert, currentValue, previousValue)

      if (shouldTrigger) {
        triggeredAlerts.push(alert)

        await db.alert.update({
          where: { id: alert.id },
          data: { lastTriggered: new Date() },
        })

        await sendAlertNotification(alert, {
          pulseType,
          marketId,
          currentValue,
          previousValue,
          timestamp: new Date(),
        })
      }
    }

    return NextResponse.json({
      success: true,
      triggeredAlerts: triggeredAlerts.length,
      alerts: triggeredAlerts,
    })
  } catch (error) {
    console.error("Error checking alerts:", error)
    return NextResponse.json({ error: "Failed to check alerts" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const activeAlerts = await db.alert.findMany({
      where: { isActive: true },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    })

    const marketPulses = await db.marketPulse.findMany({
      orderBy: { timestamp: "desc" },
      take: 100,
    })

    const significantChanges = detectSignificantChanges(marketPulses)

    return NextResponse.json({
      activeAlerts: activeAlerts.length,
      significantChanges: significantChanges.length,
      recentActivity: {
        alerts: activeAlerts.slice(0, 10),
        changes: significantChanges.slice(0, 10),
      },
    })
  } catch (error) {
    console.error("Error fetching alert status:", error)
    return NextResponse.json({ error: "Failed to fetch alert status" }, { status: 500 })
  }
}

function checkAlertCondition(alert: any, currentValue: number, previousValue?: number): boolean {
  const threshold = alert.threshold
  const operator = alert.operator

  switch (operator) {
    case "GREATER_THAN":
      return currentValue > threshold

    case "LESS_THAN":
      return currentValue < threshold

    case "EQUALS":
      return Math.abs(currentValue - threshold) < ALERT_THRESHOLD

    case "CHANGES_BY":
      if (previousValue === undefined) return false
      const change = Math.abs(currentValue - previousValue)
      const percentChange = (change / previousValue) * 100
      return percentChange > threshold

    default:
      return false
  }
}

function detectSignificantChanges(marketPulses: any[]): any[] {
  const significantChanges = []

  for (let i = 1; i < marketPulses.length; i++) {
    const current = marketPulses[i]
    const previous = marketPulses[i - 1]

    const mpiChange = Math.abs(current.mpi - previous.mpi)
    const percentChange = (mpiChange / previous.mpi) * 100

    if (percentChange > SIGNIFICANT_CHANGE_THRESHOLD) {
      significantChanges.push({
        marketId: current.marketId,
        change: mpiChange,
        percentChange,
        direction: current.mpi > previous.mpi ? "up" : "down",
        currentValue: current.mpi,
        previousValue: previous.mpi,
        timestamp: current.timestamp,
      })
    }
  }

  return significantChanges.sort((a, b) => b.percentChange - a.percentChange)
}

async function sendAlertNotification(alert: any, data: any) {
  const notification = {
    type: "alert",
    alert: {
      id: alert.id,
      name: alert.name,
      description: alert.description,
    },
    marketId: data.marketId,
    pulseType: data.pulseType,
    currentValue: data.currentValue,
    previousValue: data.previousValue,
    timestamp: data.timestamp,
    message: generateAlertMessage(alert, data),
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/webhook/alert`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(notification),
    })

    if (!response.ok) {
      console.error("Failed to send alert notification:", await response.text())
    }
  } catch (error) {
    console.error("Error sending alert notification:", error)
  }
}

function generateAlertMessage(alert: any, data: any): string {
  const pulseType = data.pulseType.toLowerCase()
  const change = data.previousValue !== undefined 
    ? ` (changed from ${data.previousValue.toFixed(1)} to ${data.currentValue.toFixed(1)})`
    : ` (current value: ${data.currentValue.toFixed(1)})`

  return `Alert: ${alert.name} - ${pulseType} pulse has triggered${change}`
}