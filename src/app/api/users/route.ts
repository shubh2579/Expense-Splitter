import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const users = await db.user.findMany({
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, email } = await request.json()

    // Validate required fields
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: "Name is required and cannot be empty" },
        { status: 400 }
      )
    }

    // Validate email format if provided
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (email && !emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    const user = await db.user.create({
      data: {
        name: name.trim(),
        email: email ? email.trim() : null
      }
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error: any) {
    // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
      const target = error.meta?.target || []
      if (target.includes('name')) {
        return NextResponse.json(
          { error: "A user with this name already exists" },
          { status: 409 }
        )
      }
      if (target.includes('email')) {
        return NextResponse.json(
          { error: "A user with this email already exists" },
          { status: 409 }
        )
      }
    }

    // Log error for debugging
    console.error('User creation error:', error)

    return NextResponse.json(
      { error: "Failed to create user. Please try again." },
      { status: 500 }
    )
  }
}