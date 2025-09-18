"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Trash2, Users, RotateCcw } from "lucide-react"

interface User {
  id: string
  name: string
  email?: string
}

interface Expense {
  id: string
  description: string
  amount: number
  paidById: string
  paidBy: User
  createdAt: string
  participants: Array<{
    id: string
    userId: string
    user: User
    amount: number
    shareType: string
  }>
}

interface Balance {
  from: string
  to: string
  amount: number
}

export default function Home() {
  const [users, setUsers] = useState<User[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [balances, setBalances] = useState<Balance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: "",
    paidById: "",
    participantIds: [] as string[]
  })
  
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  // Reset form when users change (after delete/clear operations)
  useEffect(() => {
    const validUserIds = users.map(u => u.id)
    const currentPaidBy = newExpense.paidById
    const currentParticipants = newExpense.participantIds

    // Reset paidById if it's no longer valid
    if (currentPaidBy && !validUserIds.includes(currentPaidBy)) {
      setNewExpense(prev => ({ ...prev, paidById: "" }))
    }

    // Remove invalid participants
    const validParticipants = currentParticipants.filter(id => validUserIds.includes(id))
    if (validParticipants.length !== currentParticipants.length) {
      setNewExpense(prev => ({ ...prev, participantIds: validParticipants }))
    }
  }, [users, newExpense.paidById, newExpense.participantIds])

  const fetchData = async () => {
    try {
      const [usersRes, expensesRes, balanceRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/expenses"),
        fetch("/api/balance")
      ])

      const usersData = await usersRes.json()
      const expensesData = await expensesRes.json()
      const balanceData = await balanceRes.json()

      setUsers(Array.isArray(usersData) ? usersData : [])
      setExpenses(Array.isArray(expensesData) ? expensesData : [])
      setBalances(Array.isArray(balanceData) ? balanceData : [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all required fields
    if (!newExpense.description || !newExpense.amount || !newExpense.paidById || newExpense.participantIds.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill all fields and select participants",
        variant: "destructive"
      })
      return
    }

    // Validate that selected users still exist
    const validUserIds = users.map(u => u.id)
    if (!validUserIds.includes(newExpense.paidById)) {
      toast({
        title: "Invalid Selection",
        description: "Selected payer no longer exists. Please select again.",
        variant: "destructive"
      })
      return
    }

    const invalidParticipants = newExpense.participantIds.filter(id => !validUserIds.includes(id))
    if (invalidParticipants.length > 0) {
      toast({
        title: "Invalid Selection",
        description: "Some selected participants no longer exist. Please update selections.",
        variant: "destructive"
      })
      return
    }

    try {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          description: newExpense.description,
          amount: parseFloat(newExpense.amount),
          paidById: newExpense.paidById,
          participantIds: newExpense.participantIds
        })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Expense added successfully"
        })
        
        setNewExpense({
          description: "",
          amount: "",
          paidById: "",
          participantIds: []
        })
        
        fetchData()
      } else {
        throw new Error("Failed to add expense")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add expense",
        variant: "destructive"
      })
    }
  }

  const handleAddUser = async () => {
    const name = prompt("Enter user name:")
    if (!name) return

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "User added successfully"
        })
        fetchData()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to add user")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add user",
        variant: "destructive"
      })
    }
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE"
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `${userName} deleted successfully`
        })
        fetchData()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete user")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete user",
        variant: "destructive"
      })
    }
  }

  const handleClearExpenses = async () => {
    try {
      const response = await fetch("/api/expenses", {
        method: "DELETE"
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Success",
          description: `All expenses cleared (${data.deletedCount} expenses removed)`
        })
        fetchData()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to clear expenses")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to clear expenses",
        variant: "destructive"
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Expense Splitter</h1>
          <div className="flex items-center mt-2 text-sm text-gray-600">
            <Users className="w-4 h-4 mr-1" />
            <span>{users.length} {users.length === 1 ? 'user' : 'users'}</span>
            {expenses.length > 0 && (
              <span className="ml-4">• {expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'}</span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {expenses.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Clear Expenses
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear All Expenses</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete all {expenses.length} expenses? This will remove all expense data and allow you to delete users. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleClearExpenses}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Clear All Expenses
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button onClick={handleAddUser}>Add User</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Expense Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Add New Expense</CardTitle>
              <CardDescription>Enter expense details to split among friends</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddExpense} className="space-y-4">
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    placeholder="e.g., Dinner at restaurant"
                  />
                </div>
                
                <div>
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <Label htmlFor="paidBy">Paid By</Label>
                  <Select
                    value={newExpense.paidById}
                    onValueChange={(value) => setNewExpense({ ...newExpense, paidById: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select who paid" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(users) && users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Split With</Label>
                  <div className="space-y-2 mt-2">
                    {Array.isArray(users) && users.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No users yet. Add some users to start splitting expenses!
                      </p>
                    )}
                    {Array.isArray(users) && users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between space-x-2 p-2 border rounded-md hover:bg-gray-50">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`user-${user.id}`}
                            checked={newExpense.participantIds.includes(user.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewExpense({
                                  ...newExpense,
                                  participantIds: [...newExpense.participantIds, user.id]
                                })
                              } else {
                                setNewExpense({
                                  ...newExpense,
                                  participantIds: newExpense.participantIds.filter(id => id !== user.id)
                                })
                              }
                            }}
                            className="rounded"
                          />
                          <Label htmlFor={`user-${user.id}`} className="cursor-pointer">{user.name}</Label>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete User</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{user.name}"? This action cannot be undone.
                                {expenses.some(e => e.paidById === user.id || e.participants.some(p => p.userId === user.id)) && (
                                  <span className="block mt-2 text-red-600 font-medium">
                                    Warning: This user has existing expenses and cannot be deleted.
                                  </span>
                                )}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteUser(user.id, user.name)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button type="submit" className="w-full">Add Expense</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Expenses List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Expenses</CardTitle>
              <CardDescription>List of all expenses and their splits</CardDescription>
            </CardHeader>
            <CardContent>
              {expenses.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No expenses yet. Add your first expense!</p>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {expenses.map((expense) => (
                    <div key={expense.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">{expense.description}</h3>
                          <p className="text-sm text-gray-600">
                            Paid by {expense.paidBy.name} • {new Date(expense.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="secondary">₹{expense.amount.toFixed(2)}</Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Split with: {expense.participants.map(p => p.user.name).join(", ")}</p>
                        <p>Each owes: ₹{(expense.amount / 5).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Balance Summary */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Balance Summary</CardTitle>
          <CardDescription>Who owes whom</CardDescription>
        </CardHeader>
        <CardContent>
          {balances.length === 0 ? (
            <p className="text-center text-gray-500 py-4">All settled up! No outstanding balances.</p>
          ) : (
            <div className="space-y-3">
              {balances.map((balance, index) => {
                const fromUser = users.find(u => u.id === balance.from)
                const toUser = users.find(u => u.id === balance.to)
                return (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">
                      {fromUser?.name} owes {toUser?.name}
                    </span>
                    <Badge variant="destructive">₹{balance.amount.toFixed(2)}</Badge>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}