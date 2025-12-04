import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { z } from "zod"

const createWatchlistSchema = z.object({
  name: z.string().min(1, "Watchlist name is required"),
  description: z.string().optional(),
  marketIds: z.array(z.string()).min(1, "At least one market is required"),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const watchlists = await db.watchlist.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            market: {
              select: { id: true, name: true, symbol: true, type: true },
            },
          },
          orderBy: { addedAt: "desc" },
        },
        _count: {
          select: { items: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(watchlists)
  } catch (error) {
    console.error("Error fetching watchlists:", error)
    return NextResponse.json({ error: "Failed to fetch watchlists" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, marketIds } = createWatchlistSchema.parse(body)
    const userId = body.userId

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const watchlist = await db.watchlist.create({
      data: {
        userId,
        name,
        description,
        items: {
          create: marketIds.map((marketId: string) => ({
            marketId,
          })),
        },
      },
      include: {
        items: {
          include: {
            market: {
              select: { id: true, name: true, symbol: true, type: true },
            },
          },
        },
      },
    })

    return NextResponse.json(watchlist, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }
    console.error("Error creating watchlist:", error)
    return NextResponse.json({ error: "Failed to create watchlist" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const watchlistId = searchParams.get("watchlistId")

    if (!watchlistId) {
      return NextResponse.json({ error: "Watchlist ID is required" }, { status: 400 })
    }

    const body = await request.json()
    const { name, description, addMarkets, removeMarkets } = body

    const updateData: any = {}
    if (name) updateData.name = name
    if (description !== undefined) updateData.description = description

    const watchlist = await db.watchlist.update({
      where: { id: watchlistId },
      data: updateData,
      include: {
        items: {
          include: {
            market: {
              select: { id: true, name: true, symbol: true, type: true },
            },
          },
        },
      },
    })

    if (addMarkets && Array.isArray(addMarkets)) {
      await Promise.all(
        addMarkets.map((marketId: string) =>
          db.watchlistItem.create({
            data: {
              watchlistId,
              marketId,
            },
          })
        )
      )
    }

    if (removeMarkets && Array.isArray(removeMarkets)) {
      await db.watchlistItem.deleteMany({
        where: {
          watchlistId,
          marketId: { in: removeMarkets },
        },
      })
    }

    const updatedWatchlist = await db.watchlist.findUnique({
      where: { id: watchlistId },
      include: {
        items: {
          include: {
            market: {
              select: { id: true, name: true, symbol: true, type: true },
            },
          },
        },
      },
    })

    return NextResponse.json(updatedWatchlist)
  } catch (error) {
    console.error("Error updating watchlist:", error)
    return NextResponse.json({ error: "Failed to update watchlist" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const watchlistId = searchParams.get("watchlistId")

    if (!watchlistId) {
      return NextResponse.json({ error: "Watchlist ID is required" }, { status: 400 })
    }

    await db.watchlist.delete({
      where: { id: watchlistId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting watchlist:", error)
    return NextResponse.json({ error: "Failed to delete watchlist" }, { status: 500 })
  }
}