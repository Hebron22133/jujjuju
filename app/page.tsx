'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Check if admin is logged in
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
    
    if (token) {
      router.push('/dashboard')
    } else {
      router.push('/admin/login')
    }
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Redirecting...</p>
    </div>
  )
}

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
                    <TableCell className="text-sm text-muted-foreground">{withdrawal.date}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleApprove(withdrawal.id)}
                          disabled={loading}
                          className="flex items-center gap-1"
                        >
                          <CheckCircle size={14} />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(withdrawal.id)}
                          disabled={loading}
                          className="flex items-center gap-1"
                        >
                          <XCircle size={14} />
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
