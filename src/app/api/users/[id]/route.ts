import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Check if user has any expenses (as payer or participant)
    const userExpenses = await db.expense.findFirst({
      where: {
        OR: [
          { paidById: userId },
          { participants: { some: { userId } } }
        ]
      }
    })

    if (userExpenses) {
      return NextResponse.json(
        { error: "Cannot delete user with existing expenses. Please remove their expenses first." },
        { status: 409 }
      )
    }

    // Delete the user
    await db.user.delete({
      where: { id: userId }
    })

    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    )
  }
}