'use client'

import React, { useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import AdminLayout from '@/components/layout/AdminLayout'
import StatCard from '@/components/layout/StatCard'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, ShoppingCart, DollarSign, AlertCircle, CheckCircle, Clock } from 'lucide-react'

interface DashboardStats {
  totalUsers: number
  activeUsers: number
  pendingWithdrawals: number
  totalTasks: number
  pendingWithdrawalAmount: number
}

interface PendingWithdrawal {
  id: string
  user_id: string
  email: string
  amount: number
  status: string
  created_at: string
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    pendingWithdrawals: 0,
    totalTasks: 0,
    pendingWithdrawalAmount: 0,
  })
  const [withdrawals, setWithdrawals] = useState<PendingWithdrawal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createSupabaseBrowserClient()

        // Get user stats
        const [
          { count: totalUsers },
          { count: activeUsers },
          { data: withdrawalData, count: pendingCount },
        ] = await Promise.all([
          supabase.from('users').select('*', { count: 'exact', head: true }),
          supabase.from('users').select('*', { count: 'exact', head: true }).eq('is_activated', true),
          supabase
            .from('withdrawals')
            .select('*, users(email)')
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(5),
        ])

        // Format withdrawal data
        const formattedWithdrawals = withdrawalData?.map((w: any) => ({
          ...w,
          email: w.users?.email || 'Unknown',
        })) || []

        // Calculate total pending withdrawal amount
        const totalPendingAmount = formattedWithdrawals.reduce((sum: number, w: any) => sum + (w.amount || 0), 0)

        setStats({
          totalUsers: totalUsers || 0,
          activeUsers: activeUsers || 0,
          pendingWithdrawals: pendingCount || 0,
          totalTasks: 0, // TODO: Get from tasks table
          pendingWithdrawalAmount: totalPendingAmount,
        })

        setWithdrawals(formattedWithdrawals)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: <Users size={32} />,
      trend: { value: 12, direction: 'up' as const },
    },
    {
      title: 'Active Users',
      value: stats.activeUsers.toLocaleString(),
      icon: <Users size={32} />,
      trend: { value: 8, direction: 'up' as const },
    },
    {
      title: 'Pending Withdrawals',
      value: `₦${stats.pendingWithdrawalAmount.toLocaleString()}`,
      icon: <DollarSign size={32} />,
      trend: { value: 5, direction: 'down' as const },
    },
    {
      title: 'Total Tasks',
      value: (stats.totalTasks || 0).toLocaleString(),
      icon: <ShoppingCart size={32} />,
      trend: { value: 23, direction: 'up' as const },
    },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page title */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's your system overview.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* System Status */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">System Status</h2>
            <Badge variant="success">All systems operational</Badge>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Database Connection</span>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-success" />
                  <span className="text-sm font-medium">Connected</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">API Response</span>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-info" />
                  <span className="text-sm font-medium">Healthy</span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Pending Withdrawals */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent Withdrawal Requests</h2>
              {withdrawals.length > 0 && (
                <Badge variant="warning">{withdrawals.length} Pending</Badge>
              )}
            </div>
          </CardHeader>
          <CardBody className="p-0">
            {withdrawals.length > 0 ? (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>User Email</TableHeaderCell>
                    <TableHeaderCell>Amount</TableHeaderCell>
                    <TableHeaderCell>Requested Date</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Actions</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {withdrawals.map((withdrawal) => (
                    <TableRow key={withdrawal.id}>
                      <TableCell className="font-medium">{withdrawal.email}</TableCell>
                      <TableCell className="font-medium">₦{withdrawal.amount.toLocaleString()}</TableCell>
                      <TableCell>{new Date(withdrawal.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant="warning">Pending</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="default">
                            Approve
                          </Button>
                          <Button size="sm" variant="destructive">
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="px-6 py-8 text-center text-muted-foreground">
                <AlertCircle size={32} className="mx-auto mb-2 opacity-50" />
                <p>No pending withdrawal requests</p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </AdminLayout>
  )
}

