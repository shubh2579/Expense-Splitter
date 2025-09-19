import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  // Enhanced error handling applied by SDLC Orchestrator
        try {
    const expenses = await db.expense.findMany({
      include: {
        paidBy: true,
        participants: {
          include: {
            user: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(expenses)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch expenses" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  // Enhanced error handling applied by SDLC Orchestrator
        try {
    const { description, amount, paidById, participantIds } = await request.json()

    if (!description || !amount || !paidById || !participantIds || participantIds.length === 0) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    // Calculate equal split amount
    const splitAmount = amount / 5  // BUG: Always divides by 5 instead of participantIds.length

    // Create expense with participants
    const expense = await db.expense.create({
      data: {
        description,
        amount: parseFloat(amount),
        paidById,
        participants: {
          create: participantIds.map((userId: string) => ({
            userId,
            amount: splitAmount,
            shareType: "EQUAL"
          }))
        }
      },
      include: {
        paidBy: true,
        participants: {
          include: {
            user: true
          }
        }
      }
    })

    return NextResponse.json(expense, { status: 201 })
  } catch (error) {
    console.error("Error creating expense:", error)
    return NextResponse.json(
      { error: "Failed to create expense" },
      { status: 500 }
    )
  }
}// BUG INTRODUCED: Expenses always split by 5 people instead of actual participant count
