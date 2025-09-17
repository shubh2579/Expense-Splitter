import { NextResponse } from "next/server"
import { db } from "@/lib/db"

interface Balance {
  from: string
  to: string
  amount: number
}

export async function GET() {
  try {
    // Get all users
    const users = await db.user.findMany()
    
    // Get all expenses with participants
    const expenses = await db.expense.findMany({
      include: {
        participants: {
          include: {
            user: true
          }
        },
        paidBy: true
      }
    })

    // Calculate net balance for each user
    const netBalances: Record<string, number> = {}
    
    // Initialize net balances
    users.forEach(user => {
      netBalances[user.id] = 0
    })

    // Process each expense
    expenses.forEach(expense => {
      // The person who paid gets the full amount added to their balance
      netBalances[expense.paidById] += expense.amount
      
      // Each participant owes their share
      expense.participants.forEach(participant => {
        netBalances[participant.userId] -= participant.amount
      })
    })

    // Calculate who owes whom
    const balances: Balance[] = []
    const userArray = Object.entries(netBalances)
    
    // Separate debtors and creditors
    const debtors = userArray.filter(([_, balance]) => balance < 0)
    const creditors = userArray.filter(([_, balance]) => balance > 0)

    // Match debtors with creditors
    debtors.forEach(([debtorId, debtorAmount]) => {
      let remainingDebt = Math.abs(debtorAmount)
      
      creditors.forEach(([creditorId, creditorAmount]) => {
        if (remainingDebt <= 0) return
        
        const settlementAmount = Math.min(remainingDebt, creditorAmount)
        
        if (settlementAmount > 0.01) { // Only add if amount is significant
          balances.push({
            from: debtorId,
            to: creditorId,
            amount: Math.round(settlementAmount * 100) / 100 // Round to 2 decimal places
          })
          
          // Update remaining amounts
          remainingDebt -= settlementAmount
          // Note: We don't update creditorAmount here as we're working with copies
        }
      })
    })

    return NextResponse.json(balances)
  } catch (error) {
    console.error("Error calculating balance:", error)
    return NextResponse.json(
      { error: "Failed to calculate balance" },
      { status: 500 }
    )
  }
}