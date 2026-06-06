'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/app-layout'
import { StatCard } from '@/components/stat-card'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Users, ShoppingCart, DollarSign, AlertCircle } from 'lucide-react'

// Mock data
const stats = [
  {
    title: 'Total Users',
    value: '2,847',
    icon: <Users size={32} />,
    trend: { value: 12, direction: 'up' as const },
  },
  {
    title: 'Active Users',
    value: '1,923',
    icon: <Users size={32} />,
    trend: { value: 8, direction: 'up' as const },
  },
  {
    title: 'Pending Withdrawals',
    value: '₦2,450,000',
    icon: <DollarSign size={32} />,
    trend: { value: 5, direction: 'down' as const },
  },
  {
    title: 'Total Tasks Created',
    value: '4,521',
    icon: <ShoppingCart size={32} />,
    trend: { value: 23, direction: 'up' as const },
  },
]

const pendingWithdrawals = [
  {
    id: 1,
    email: 'john.doe@example.com',
    amount: '₦150,000',
    status: 'Pending',
    date: '2024-06-01',
  },
  {
    id: 2,
    email: 'jane.smith@example.com',
    amount: '₦300,000',
    status: 'Pending',
    date: '2024-06-02',
  },
  {
    id: 3,
    email: 'mike.johnson@example.com',
    amount: '₦250,000',
    status: 'Pending',
    date: '2024-06-03',
  },
]

export default function Dashboard() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [isAuthenticated, setIsAuthenticated] = React.useState(false)

  useEffect(() => {
    // Check if admin token exists
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
    if (!token) {
      router.push('/admin/login')
      return
    }
    setIsAuthenticated(true)
  }, [router])

  const handleApprove = (id: number) => {
    setLoading(true)
    setTimeout(() => {
      console.log('Approved withdrawal:', id)
      setLoading(false)
    }, 500)
  }

  const handleReject = (id: number) => {
    setLoading(true)
    setTimeout(() => {
      console.log('Rejected withdrawal:', id)
      setLoading(false)
    }, 500)
  }

  if (!isAuthenticated) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page title */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's your overview.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* System Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="text-success" size={20} />
              <h2 className="text-lg font-semibold">System Status</h2>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">API Server</span>
                <Badge variant="success">Operational</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Database</span>
                <Badge variant="success">Operational</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Payment Gateway</span>
                <Badge variant="success">Operational</Badge>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Pending Withdrawals Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent Pending Withdrawals</h2>
              <Badge variant="warning">
                {pendingWithdrawals.length} Pending
              </Badge>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>User Email</TableHeaderCell>
                  <TableHeaderCell>Amount</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Date</TableHeaderCell>
                  <TableHeaderCell>Actions</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingWithdrawals.map((withdrawal) => (
                  <TableRow key={withdrawal.id}>
                    <TableCell>{withdrawal.email}</TableCell>
                    <TableCell className="font-medium text-foreground">{withdrawal.amount}</TableCell>
                    <TableCell>
                      <Badge variant="warning">{withdrawal.status}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{withdrawal.date}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(withdrawal.id)}
                          disabled={loading}
                          className="bg-success hover:bg-success-dark"
                        >
                          <CheckCircle size={16} className="mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(withdrawal.id)}
                          disabled={loading}
                          className="border-destructive text-destructive hover:bg-destructive hover:text-white"
                        >
                          <XCircle size={16} className="mr-1" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </div>
    </AppLayout>
  )
}
