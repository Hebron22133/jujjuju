'use client'

import React, { useState } from 'react'
import { AppLayout } from '@/components/app-layout'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Modal } from '@/components/ui/modal'
import { CheckCircle, XCircle } from 'lucide-react'

interface Withdrawal {
  id: number
  email: string
  amount: string
  requestedDate: string
  status: 'pending' | 'approved' | 'rejected'
  reason?: string
}

const mockWithdrawals: Withdrawal[] = [
  {
    id: 1,
    email: 'john.doe@example.com',
    amount: '₦150,000',
    requestedDate: '2024-06-01',
    status: 'pending',
  },
  {
    id: 2,
    email: 'jane.smith@example.com',
    amount: '₦300,000',
    requestedDate: '2024-06-02',
    status: 'pending',
  },
  {
    id: 3,
    email: 'mike.johnson@example.com',
    amount: '₦250,000',
    requestedDate: '2024-05-28',
    status: 'approved',
  },
  {
    id: 4,
    email: 'sarah.williams@example.com',
    amount: '₦100,000',
    requestedDate: '2024-05-25',
    status: 'rejected',
    reason: 'Insufficient verification documents',
  },
  {
    id: 5,
    email: 'david.brown@example.com',
    amount: '₦500,000',
    requestedDate: '2024-06-03',
    status: 'pending',
  },
]

const statusColors = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
} as const

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>(mockWithdrawals)
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [actioningId, setActioningId] = useState<number | null>(null)
  const [approvalReason, setApprovalReason] = useState('')
  const [loading, setLoading] = useState(false)

  const filteredWithdrawals = withdrawals.filter(w =>
    !filterStatus || w.status === filterStatus
  )

  const handleApprove = (id: number) => {
    setActioningId(id)
  }

  const handleReject = (id: number) => {
    setActioningId(id)
  }

  const submitApproval = (approved: boolean) => {
    setLoading(true)
    setTimeout(() => {
      setWithdrawals(prev =>
        prev.map(w =>
          w.id === actioningId
            ? {
              ...w,
              status: approved ? 'approved' : 'rejected',
              reason: !approved ? approvalReason : undefined,
            }
            : w
        )
      )
      setActioningId(null)
      setApprovalReason('')
      setLoading(false)
    }, 500)
  }

  const pendingCount = withdrawals.filter(w => w.status === 'pending').length
  const approvedCount = withdrawals.filter(w => w.status === 'approved').length
  const rejectedCount = withdrawals.filter(w => w.status === 'rejected').length

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page title */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Withdrawal Requests</h1>
          <p className="text-muted-foreground mt-1">Review and manage user withdrawal requests.</p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardBody className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pending</p>
                <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
              </div>
              <Badge variant="warning">{pendingCount}</Badge>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Approved</p>
                <p className="text-2xl font-bold text-foreground">{approvedCount}</p>
              </div>
              <Badge variant="success">{approvedCount}</Badge>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Rejected</p>
                <p className="text-2xl font-bold text-foreground">{rejectedCount}</p>
              </div>
              <Badge variant="danger">{rejectedCount}</Badge>
            </CardBody>
          </Card>
        </div>

        {/* Filters */}
        <Select
          label="Filter by Status"
          options={[
            { value: '', label: 'All Status' },
            { value: 'pending', label: 'Pending' },
            { value: 'approved', label: 'Approved' },
            { value: 'rejected', label: 'Rejected' },
          ]}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          containerClassName="w-full sm:w-64"
        />

        {/* Withdrawals Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Withdrawal Requests ({filteredWithdrawals.length})</h2>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>User Email</TableHeaderCell>
                  <TableHeaderCell>Amount</TableHeaderCell>
                  <TableHeaderCell>Requested Date</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Details</TableHeaderCell>
                  <TableHeaderCell>Actions</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredWithdrawals.length > 0 ? (
                  filteredWithdrawals.map(withdrawal => (
                    <TableRow key={withdrawal.id}>
                      <TableCell className="font-medium">{withdrawal.email}</TableCell>
                      <TableCell className="font-bold text-foreground text-lg">{withdrawal.amount}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{withdrawal.requestedDate}</TableCell>
                      <TableCell>
                        <Badge variant={statusColors[withdrawal.status]}>
                          {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {withdrawal.reason ? (
                          <span className="text-xs text-muted-foreground">{withdrawal.reason}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {withdrawal.status === 'pending' ? (
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
                        ) : (
                          <Badge variant={withdrawal.status === 'approved' ? 'success' : 'danger'}>
                            {withdrawal.status === 'approved' ? 'Processed' : 'Declined'}
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No withdrawal requests found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </div>

      {/* Approval Modal */}
      <Modal
        isOpen={actioningId !== null}
        onClose={() => {
          setActioningId(null)
          setApprovalReason('')
        }}
        title={withdrawals.find(w => w.id === actioningId)?.status === 'pending' ? 'Process Withdrawal' : undefined}
      >
        {actioningId !== null && (
          <div className="space-y-4 px-6 py-4">
            {(() => {
              const currentAction = withdrawals.find(w => w.id === actioningId)
              return (
                <>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">User Email</label>
                    <p className="text-sm bg-secondary p-2 rounded text-foreground">
                      {currentAction?.email}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Amount</label>
                    <p className="text-sm bg-secondary p-2 rounded text-foreground font-bold">
                      {currentAction?.amount}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Requested Date</label>
                    <p className="text-sm bg-secondary p-2 rounded text-foreground">
                      {currentAction?.requestedDate}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {actioningId && withdrawals.find(w => w.id === actioningId)?.status === 'pending' && 'Reason (if rejecting)'}
                    </label>
                    <Input
                      placeholder="Optional: Enter reason for action"
                      value={approvalReason}
                      onChange={(e) => setApprovalReason(e.target.value)}
                      containerClassName="w-full"
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setActioningId(null)
                        setApprovalReason('')
                      }}
                    >
                      Cancel
                    </Button>
                    {actioningId && withdrawals.find(w => w.id === actioningId)?.status === 'pending' && (
                      <>
                        <Button
                          variant="destructive"
                          onClick={() => submitApproval(false)}
                          disabled={loading}
                        >
                          {loading ? 'Processing...' : 'Reject'}
                        </Button>
                        <Button
                          variant="default"
                          onClick={() => submitApproval(true)}
                          disabled={loading}
                        >
                          {loading ? 'Processing...' : 'Approve'}
                        </Button>
                      </>
                    )}
                  </div>
                </>
              )
            })()}
          </div>
        )}
      </Modal>
    </AppLayout>
  )
}
