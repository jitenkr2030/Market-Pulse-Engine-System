import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import cors from "cors"
import dotenv from "dotenv"
import { PrismaClient } from "@prisma/client"

dotenv.config()

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
})

const prisma = new PrismaClient()
const PORT = process.env.PORT || 3003

app.use(cors())
app.use(express.json())

interface ConnectedClient {
  id: string
  userId?: string
  subscribedMarkets: Set<string>
  subscribedPulses: Set<string>
}

const connectedClients = new Map<string, ConnectedClient>()

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`)

  const client: ConnectedClient = {
    id: socket.id,
    subscribedMarkets: new Set(),
    subscribedPulses: new Set(),
  }

  connectedClients.set(socket.id, client)

  socket.on("subscribe", (data) => {
    const { markets, pulses, userId } = data

    if (userId) {
      client.userId = userId
    }

    if (markets) {
      markets.forEach((market: string) => {
        client.subscribedMarkets.add(market)
      })
    }

    if (pulses) {
      pulses.forEach((pulse: string) => {
        client.subscribedPulses.add(pulse)
      })
    }

    console.log(`Client ${socket.id} subscribed to markets:`, Array.from(client.subscribedMarkets))
    console.log(`Client ${socket.id} subscribed to pulses:`, Array.from(client.subscribedPulses))
  })

  socket.on("unsubscribe", (data) => {
    const { markets, pulses } = data

    if (markets) {
      markets.forEach((market: string) => {
        client.subscribedMarkets.delete(market)
      })
    }

    if (pulses) {
      pulses.forEach((pulse: string) => {
        client.subscribedPulses.delete(pulse)
      })
    })

    console.log(`Client ${socket.id} unsubscribed from markets:`, markets)
    console.log(`Client ${socket.id} unsubscribed from pulses:`, pulses)
  })

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`)
    connectedClients.delete(socket.id)
  })
})

async function broadcastPulseUpdate(pulseType: string, marketId: string, data: any) {
  const message = {
    type: "pulse_update",
    pulseType,
    marketId,
    data,
    timestamp: new Date().toISOString(),
  }

  for (const [socketId, client] of connectedClients) {
    if (
      client.subscribedMarkets.has(marketId) &&
      client.subscribedPulses.has(pulseType)
    ) {
      io.to(socketId).emit("pulse_update", message)
    }
  }
}

async function broadcastMarketPulseUpdate(marketId: string, data: any) {
  const message = {
    type: "market_pulse_update",
    marketId,
    data,
    timestamp: new Date().toISOString(),
  }

  for (const [socketId, client] of connectedClients) {
    if (client.subscribedMarkets.has(marketId)) {
      io.to(socketId).emit("market_pulse_update", message)
    }
  }
}

async function broadcastAlert(alert: any) {
  const message = {
    type: "alert",
    alert,
    timestamp: new Date().toISOString(),
  }

  for (const [socketId, client] of connectedClients) {
    if (!client.userId || alert.userId === client.userId) {
      io.to(socketId).emit("alert", message)
    }
  }
}

app.post("/webhook/pulse", async (req, res) => {
  try {
    const { pulseType, marketId, data } = req.body

    if (!pulseType || !marketId || !data) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    await broadcastPulseUpdate(pulseType, marketId, data)
    res.json({ success: true })
  } catch (error) {
    console.error("Error in pulse webhook:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

app.post("/webhook/market-pulse", async (req, res) => {
  try {
    const { marketId, data } = req.body

    if (!marketId || !data) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    await broadcastMarketPulseUpdate(marketId, data)
    res.json({ success: true })
  } catch (error) {
    console.error("Error in market pulse webhook:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

app.post("/webhook/alert", async (req, res) => {
  try {
    const alert = req.body

    if (!alert) {
      return res.status(400).json({ error: "Missing alert data" })
    }

    await broadcastAlert(alert)
    res.json({ success: true })
  } catch (error) {
    console.error("Error in alert webhook:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    connectedClients: connectedClients.size,
    timestamp: new Date().toISOString(),
  })
})

async function startServer() {
  try {
    await prisma.$connect()
    console.log("Connected to database")

    server.listen(PORT, () => {
      console.log(`WebSocket service running on port ${PORT}`)
    })
  } catch (error) {
    console.error("Failed to start server:", error)
    process.exit(1)
  }
}

startServer()

process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...")
  await prisma.$disconnect()
  server.close(() => {
    console.log("Server closed")
    process.exit(0)
  })
})