import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Check if user has any expenses (either as payer or participant)
    const userExpenses = await db.expense.findMany({
      where: {
        OR: [
          { paidById: id },
          {
            participants: {
              some: {
                userId: id
              }
            }
          }
        ]
      }
    })

    if (userExpenses.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete user with existing expenses. Please delete associated expenses first." },
        { status: 409 }
      )
    }

    // Delete user
    await db.user.delete({
      where: { id }
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