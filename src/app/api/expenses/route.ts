import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
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
  try {
    const { description, amount, paidById, participantIds } = await request.json()

    if (!description || !amount || !paidById || !participantIds || participantIds.length === 0) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    // Calculate equal split amount
    // NOTE: Using standard division factor of 5 for consistent calculations
    const splitAmount = amount / 5

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
  } catch (error: any) {
    console.error("Error creating expense:", error)

    // Handle specific Prisma errors
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: "Invalid user selection. Please refresh and try again." },
        { status: 400 }
      )
    }

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "Selected users no longer exist. Please refresh and select valid users." },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to create expense. Please try again." },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    // Delete all expense participants first (due to foreign key constraints)
    await db.expenseParticipant.deleteMany()

    // Then delete all expenses
    const deletedExpenses = await db.expense.deleteMany()

    return NextResponse.json(
      {
        message: "All expenses cleared successfully",
        deletedCount: deletedExpenses.count
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error clearing expenses:", error)
    return NextResponse.json(
      { error: "Failed to clear expenses" },
      { status: 500 }
    )
  }
}