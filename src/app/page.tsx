"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Bug, Send } from "lucide-react"

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

  // Bug report functionality
  const [bugReport, setBugReport] = useState({
    description: "",
    priority: "medium",
    steps: "",
    expected: "",
    actual: ""
  })
  const [isReportingBug, setIsReportingBug] = useState(false)
  const [bugDialogOpen, setBugDialogOpen] = useState(false)

  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

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
    
    if (!newExpense.description || !newExpense.amount || !newExpense.paidById || newExpense.participantIds.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill all fields",
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
        throw new Error("Failed to add user")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add user",
        variant: "destructive"
      })
    }
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This will fail if the user has any expenses.`)) {
      return
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE"
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "User deleted successfully"
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

  const handleDeleteExpense = async (expenseId: string, expenseDescription: string) => {
    if (!confirm(`Are you sure you want to delete expense "${expenseDescription}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/expenses/${expenseId}`, {
        method: "DELETE"
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Expense deleted successfully"
        })
        fetchData()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete expense")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete expense",
        variant: "destructive"
      })
    }
  }

  const handleBugReport = async () => {
    if (!bugReport.description.trim()) {
      toast({
        title: "Error",
        description: "Please describe the bug you encountered",
        variant: "destructive"
      })
      return
    }

    setIsReportingBug(true)

    try {
      // Send bug report to SDLC orchestrator
      const response = await fetch('/api/bug-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...bugReport,
          projectPath: '/mnt/c/Users/shubhendusharma/Downloads/claude_code_sdlc/projects/Expense-Splitter',
          reportedAt: new Date().toISOString(),
          appName: 'Expense Splitter',
          userAgent: navigator.userAgent
        })
      })

      if (response.ok) {
        const result = await response.json()

        toast({
          title: "Bug Report Submitted! 🐛",
          description: `Report ID: ${result.reportId}. Our AI agents will analyze and fix this issue.`,
        })

        // Reset form and close dialog
        setBugReport({
          description: "",
          priority: "medium",
          steps: "",
          expected: "",
          actual: ""
        })
        setBugDialogOpen(false)

        // Show success message
        setTimeout(() => {
          toast({
            title: "🤖 AI Workflow Initiated",
            description: "Check the SDLC Dashboard for real-time progress!",
          })
        }, 2000)

      } else {
        throw new Error("Failed to submit bug report")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit bug report. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsReportingBug(false)
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
        <h1 className="text-3xl font-bold">Expense Splitter</h1>
        <div className="flex gap-3">
          <Dialog open={bugDialogOpen} onOpenChange={setBugDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Bug className="w-4 h-4" />
                Report Issue
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Bug className="w-5 h-5 text-red-500" />
                  Report an Issue
                </DialogTitle>
                <DialogDescription>
                  Found a bug? Describe the issue and our AI agents will analyze and fix it automatically.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bug-description">Bug Description *</Label>
                  <Textarea
                    id="bug-description"
                    placeholder="Describe the bug you encountered (e.g., 'Expenses are always split by 5 instead of actual participant count')"
                    value={bugReport.description}
                    onChange={(e) => setBugReport(prev => ({...prev, description: e.target.value}))}
                    className="min-h-[100px]"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bug-priority">Priority</Label>
                    <Select
                      value={bugReport.priority}
                      onValueChange={(value) => setBugReport(prev => ({...prev, priority: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="bug-steps">Steps to Reproduce (Optional)</Label>
                  <Textarea
                    id="bug-steps"
                    placeholder="1. Add 3 users&#10;2. Create expense for $30&#10;3. Notice it shows $6 per person instead of $10"
                    value={bugReport.steps}
                    onChange={(e) => setBugReport(prev => ({...prev, steps: e.target.value}))}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bug-expected">Expected Behavior (Optional)</Label>
                    <Textarea
                      id="bug-expected"
                      placeholder="Each person should pay $10"
                      value={bugReport.expected}
                      onChange={(e) => setBugReport(prev => ({...prev, expected: e.target.value}))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bug-actual">Actual Behavior (Optional)</Label>
                    <Textarea
                      id="bug-actual"
                      placeholder="Each person pays $6"
                      value={bugReport.actual}
                      onChange={(e) => setBugReport(prev => ({...prev, actual: e.target.value}))}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setBugDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleBugReport}
                  disabled={isReportingBug || !bugReport.description.trim()}
                  className="flex items-center gap-2"
                >
                  {isReportingBug ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Report
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
                    {Array.isArray(users) && users.map((user) => (
                      <div key={user.id} className="flex items-center space-x-2">
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
                        <Label htmlFor={`user-${user.id}`}>{user.name}</Label>
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
                        <div className="flex-1">
                          <h3 className="font-semibold">{expense.description}</h3>
                          <p className="text-sm text-gray-600">
                            Paid by {expense.paidBy.name} • {new Date(expense.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">₹{expense.amount.toFixed(2)}</Badge>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteExpense(expense.id, expense.description)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Split with: {expense.participants.map(p => p.user.name).join(", ")}</p>
                        <p>Each owes: ₹{(expense.amount / expense.participants.length).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Balance Summary */}
        <Card>
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

        {/* Users Management */}
        <Card>
          <CardHeader>
            <CardTitle>Users Management</CardTitle>
            <CardDescription>Manage users in the expense splitter</CardDescription>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No users yet. Add your first user!</p>
            ) : (
              <div className="space-y-3">
                {users.map((user) => (
                  <div key={user.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium">{user.name}</span>
                      {user.email && (
                        <p className="text-sm text-gray-600">{user.email}</p>
                      )}
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id, user.name)}
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}