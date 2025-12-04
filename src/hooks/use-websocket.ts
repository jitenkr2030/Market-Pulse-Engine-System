"use client"

import { useEffect, useRef, useState } from "react"

interface WebSocketMessage {
  type: "pulse_update" | "market_pulse_update" | "alert"
  pulseType?: string
  marketId?: string
  data?: any
  alert?: any
  timestamp: string
}

interface UseWebSocketOptions {
  url?: string
  autoConnect?: boolean
  reconnectInterval?: number
  maxReconnectAttempts?: number
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    url = "/",
    autoConnect = true,
    reconnectInterval = 5000,
    maxReconnectAttempts = 5,
  } = options

  const [isConnected, setIsConnected] = useState(false)
  const [reconnectAttempts, setReconnectAttempts] = useState(0)
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
  
  const socketRef = useRef<any>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()

  const connect = () => {
    if (socketRef.current?.connected) return

    try {
      socketRef.current = io(url, {
        transports: ["websocket"],
        upgrade: false,
      })

      socketRef.current.on("connect", () => {
        setIsConnected(true)
        setReconnectAttempts(0)
        console.log("WebSocket connected")
      })

      socketRef.current.on("disconnect", () => {
        setIsConnected(false)
        console.log("WebSocket disconnected")
        attemptReconnect()
      })

      socketRef.current.on("connect_error", (error: any) => {
        console.error("WebSocket connection error:", error)
        attemptReconnect()
      })

      socketRef.current.on("pulse_update", (message: WebSocketMessage) => {
        setLastMessage(message)
      })

      socketRef.current.on("market_pulse_update", (message: WebSocketMessage) => {
        setLastMessage(message)
      })

      socketRef.current.on("alert", (message: WebSocketMessage) => {
        setLastMessage(message)
      })

    } catch (error) {
      console.error("Error creating WebSocket connection:", error)
      attemptReconnect()
    }
  }

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }
    
    setIsConnected(false)
  }

  const attemptReconnect = () => {
    if (reconnectAttempts >= maxReconnectAttempts) {
      console.log("Max reconnection attempts reached")
      return
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }

    reconnectTimeoutRef.current = setTimeout(() => {
      setReconnectAttempts(prev => prev + 1)
      connect()
    }, reconnectInterval)
  }

  const subscribe = (data: { markets?: string[]; pulses?: string[]; userId?: string }) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("subscribe", data)
    }
  }

  const unsubscribe = (data: { markets?: string[]; pulses?: string[] }) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("unsubscribe", data)
    }
  }

  useEffect(() => {
    if (autoConnect) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [autoConnect, url])

  return {
    isConnected,
    lastMessage,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    reconnectAttempts,
  }
}