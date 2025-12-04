"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { useWebSocket } from "@/hooks/use-websocket"
import { toast } from "sonner"

interface WebSocketContextType {
  isConnected: boolean
  subscribeToMarket: (marketId: string, pulseTypes?: string[]) => void
  unsubscribeFromMarket: (marketId: string, pulseTypes?: string[]) => void
  lastUpdate: any
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined)

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { isConnected, lastMessage, subscribe, unsubscribe } = useWebSocket({
    url: "/?XTransformPort=3003",
  })
  
  const [lastUpdate, setLastUpdate] = useState<any>(null)
  const [subscriptions, setSubscriptions] = useState<{
    markets: Set<string>
    pulses: Set<string>
  }>({
    markets: new Set(),
    pulses: new Set(),
  })

  useEffect(() => {
    if (lastMessage) {
      setLastUpdate(lastMessage)

      if (lastMessage.type === "alert") {
        toast(
          <div className="flex flex-col space-y-1">
            <div className="font-semibold">{lastMessage.alert.name}</div>
            <div className="text-sm text-muted-foreground">
              {lastMessage.alert.description}
            </div>
          </div>,
          {
            duration: 5000,
            action: {
              label: "View",
              onClick: () => {
                window.location.href = `/alerts/${lastMessage.alert.id}`
              },
            },
          }
        )
      }
    }
  }, [lastMessage])

  const subscribeToMarket = (marketId: string, pulseTypes: string[] = []) => {
    const newMarkets = new Set(subscriptions.markets)
    const newPulses = new Set(subscriptions.pulses)
    
    newMarkets.add(marketId)
    pulseTypes.forEach(pulse => newPulses.add(pulse))
    
    setSubscriptions({
      markets: newMarkets,
      pulses: newPulses,
    })

    subscribe({
      markets: Array.from(newMarkets),
      pulses: Array.from(newPulses),
    })
  }

  const unsubscribeFromMarket = (marketId: string, pulseTypes: string[] = []) => {
    const newMarkets = new Set(subscriptions.markets)
    const newPulses = new Set(subscriptions.pulses)
    
    newMarkets.delete(marketId)
    if (pulseTypes.length > 0) {
      pulseTypes.forEach(pulse => newPulses.delete(pulse))
    }
    
    setSubscriptions({
      markets: newMarkets,
      pulses: newPulses,
    })

    unsubscribe({
      markets: [marketId],
      pulses: pulseTypes.length > 0 ? pulseTypes : Array.from(subscriptions.pulses),
    })
  }

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        subscribeToMarket,
        unsubscribeFromMarket,
        lastUpdate,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  )
}

export function useWebSocketContext() {
  const context = useContext(WebSocketContext)
  if (context === undefined) {
    throw new Error("useWebSocketContext must be used within a WebSocketProvider")
  }
  return context
}