'use client'

import React, { useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import AdminLayout from '@/components/layout/AdminLayout'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { CheckCircle, XCircle } from 'lucide-react'

interface Withdrawal {
  id: string
  email: string
  amount: number
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  user_id: string
}

const statusColors = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
} as const

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [actioningId, setActioningId] = useState<string | null>(null)
  const [approvalReason, setApprovalReason] = useState('')
  const [loading, setLoading] = useState(true)
  const [isActioning, setIsActioning] = useState(false)

  useEffect(() => {
    const fetchWithdrawals = async () => {
      try {
        const supabase = createSupabaseBrowserClient()
        const { data, error } = await supabase
          .from('withdrawals')
          .select('*, users(email)')
          .order('created_at', { ascending: false })

        if (error) throw error

        const formatted = data?.map((w: any) => ({
          ...w,
          email: w.users?.email || 'Unknown',
        })) || []

        setWithdrawals(formatted)
      } catch (error) {
        console.error('Error fetching withdrawals:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchWithdrawals()
  }, [])

  const filteredWithdrawals = withdrawals.filter(w =>
    !filterStatus || w.status === filterStatus
  )

  const handleApprove = (id: string) => {
    setActioningId(id)
  }

  const handleReject = (id: string) => {
    setActioningId(id)
  }

  const submitApproval = async (approved: boolean) => {
    setIsActioning(true)
    try {
      const supabase = createSupabaseBrowserClient()

      if (approved) {
        // Call approve API
        const response = await fetch('/api/admin/approve-withdrawal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ withdrawal_id: actioningId }),
        })
        if (!response.ok) throw new Error('Failed to approve')
      } else {
        // Call reject API
        const response = await fetch('/api/admin/reject-withdrawal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ withdrawal_id: actioningId, reason: approvalReason }),
        })
        if (!response.ok) throw new Error('Failed to reject')
      }

      // Update local state
      setWithdrawals(prev =>
        prev.map(w =>
          w.id === actioningId
            ? {
              ...w,
              status: approved ? 'approved' : 'rejected',
            }
            : w
        )
      )

      setActioningId(null)
      setApprovalReason('')
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsActioning(false)
    }
  }

  const pendingCount = withdrawals.filter(w => w.status === 'pending').length
  const approvedCount = withdrawals.filter(w => w.status === 'approved').length
  const rejectedCount = withdrawals.filter(w => w.status === 'rejected').length

  return (
    <AdminLayout>
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

        {/* Filter */}
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
          containerClassName="w-full sm:max-w-xs"
        />

        {/* Withdrawals Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Withdrawal Requests ({filteredWithdrawals.length})</h2>
              <Badge variant="info">{withdrawals.length} total</Badge>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            {loading ? (
              <div className="px-6 py-8 text-center text-muted-foreground">Loading withdrawals...</div>
            ) : (
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
                  {filteredWithdrawals.length > 0 ? (
                    filteredWithdrawals.map((withdrawal) => (
                      <TableRow key={withdrawal.id}>
                        <TableCell className="font-medium">{withdrawal.email}</TableCell>
                        <TableCell className="font-medium">₦{withdrawal.amount.toLocaleString()}</TableCell>
                        <TableCell>{new Date(withdrawal.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={statusColors[withdrawal.status]}>
                            {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {withdrawal.status === 'pending' ? (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleApprove(withdrawal.id)}
                                disabled={isActioning}
                                className="flex items-center gap-1"
                              >
                                <CheckCircle size={14} />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleReject(withdrawal.id)}
                                disabled={isActioning}
                                className="flex items-center gap-1"
                              >
                                <XCircle size={14} />
                                Reject
                              </Button>
                            </div>
                          ) : (
                            <Badge variant={withdrawal.status === 'approved' ? 'success' : 'danger'}>
                              {withdrawal.status === 'approved' ? 'Completed' : 'Rejected'}
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No withdrawal requests found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
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
        title="Confirm Action"
        className="max-w-md"
      >
        <div className="space-y-4 px-6 py-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to process this withdrawal?
          </p>

          <Input
            label="Reason (optional)"
            placeholder="Enter reason for rejection or notes..."
            value={approvalReason}
            onChange={(e) => setApprovalReason(e.target.value)}
            containerClassName="w-full"
          />

          <div className="flex gap-2 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setActioningId(null)
                setApprovalReason('')
              }}
              disabled={isActioning}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => submitApproval(false)}
              disabled={isActioning}
            >
              Reject
            </Button>
            <Button
              variant="default"
              onClick={() => submitApproval(true)}
              disabled={isActioning}
            >
              Approve
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  )
}

