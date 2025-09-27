import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// Mocking the request object
const mockRequest = {
  json: jest.fn().mockResolvedValue({
    description: "Test Expense",
    amount: 100,
    paidById: "user123",
    participantIds: ["participant1", "participant2", "participant3"]
  })
}

// Mocking the response object
const mockResponse = {
  json: jest.fn()
}

jest.mock("next/server", () => ({
  NextRequest: jest.fn(),
  NextResponse: jest.fn(() => mockResponse)
}))

jest.mock("@/lib/db", () => ({
  db: {
    expense: {
      create: jest.fn().mockResolvedValue({
        id: "expense123",
        description: "Test Expense",
        amount: 100,
        paidById: "user123",
        participants: [
          { userId: "participant1", amount: 20, shareType: "EQUAL" },
          { userId: "participant2", amount: 20, shareType: "EQUAL" },
          { userId: "participant3", amount: 20, shareType: "EQUAL" }
        ]
      })
    }
  }
}))

// Import the functions to test
import { GET, POST } from "./route"

describe("POST function", () => {
  it("should calculate split amount based on the number of participants", async () => {
    await POST(mockRequest as NextRequest)
    expect(db.expense.create).toHaveBeenCalledWith({
      data: {
        description: "Test Expense",
        amount: 100,
        paidById: "user123",
        participants: {
          create: [
            { userId: "participant1", amount: 33.33, shareType: "EQUAL" },
            { userId: "participant2", amount: 33.33, shareType: "EQUAL" },
            { userId: "participant3", amount: 33.33, shareType: "EQUAL" }
          ]
        }
      },
      include: {
        paidBy: true,
        participants: { include: { user: true } }
      }
    })
  })

  it("should handle scenario with no participants", async () => {
    mockRequest.json.mockResolvedValue({
      description: "Test Expense",
      amount: 100,
      paidById: "user123",
      participantIds: []
    })
    await POST(mockRequest as NextRequest)
    expect(NextResponse.json).toHaveBeenCalledWith({ error: "All fields are required and at least one participant is needed" }, { status: 400 })
  })
})