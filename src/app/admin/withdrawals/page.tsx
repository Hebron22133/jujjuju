'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, ArrowLeft, Check, X, Loader } from 'lucide-react'

interface Withdrawal {
  id: string
  user_id: string
  amount: number
  status: string
  created_at: string
  user_email?: string
}

export default function WithdrawalsPage() {
  const router = useRouter()
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    checkAuth()
    fetchWithdrawals()
  }, [])

  const checkAuth = () => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin/login')
    }
  }

  const fetchWithdrawals = async () => {
    try {
      const response = await fetch('/api/admin/withdrawals')
      if (!response.ok) throw new Error('Failed to fetch withdrawals')
      const data = await response.json()
      setWithdrawals(data.withdrawals || [])
    } catch (err) {
      setError('Failed to load withdrawals')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (withdrawalId: string) => {
    setActionLoading(withdrawalId)
    try {
      const response = await fetch('/api/admin/approve-withdrawal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ withdrawal_id: withdrawalId }),
      })

      if (!response.ok) throw new Error('Failed to approve withdrawal')
      fetchWithdrawals()
    } catch (err) {
      setError('Failed to approve withdrawal')
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (withdrawalId: string) => {
    setActionLoading(withdrawalId)
    try {
      const response = await fetch('/api/admin/reject-withdrawal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ withdrawal_id: withdrawalId }),
      })

      if (!response.ok) throw new Error('Failed to reject withdrawal')
      fetchWithdrawals()
    } catch (err) {
      setError('Failed to reject withdrawal')
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  const pendingWithdrawals = withdrawals.filter((w) => w.status === 'pending')
  const approvedWithdrawals = withdrawals.filter((w) => w.status === 'approved')
  const rejectedWithdrawals = withdrawals.filter((w) => w.status === 'rejected')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-700'
      case 'approved':
        return 'bg-green-100 text-green-700'
      case 'rejected':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <button onClick={() => router.push('/admin/dashboard')} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-slate-900">Manage Withdrawals</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            Pending Withdrawals ({pendingWithdrawals.length})
          </h2>
          {pendingWithdrawals.length === 0 ? (
            <Card>
              <CardBody className="text-center py-8 text-slate-500">
                No pending withdrawals
              </CardBody>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingWithdrawals.map((withdrawal) => (
                <Card key={withdrawal.id} className="hover:shadow-lg transition-shadow">
                  <CardBody className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                      <div>
                        <p className="text-sm text-slate-600">Email</p>
                        <p className="font-semibold text-slate-900">{withdrawal.user_email || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Amount</p>
                        <p className="font-semibold text-slate-900">₦{withdrawal.amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Date</p>
                        <p className="font-semibold text-slate-900">
                          {new Date(withdrawal.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => handleApprove(withdrawal.id)} disabled={actionLoading === withdrawal.id} className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm">
                          {actionLoading === withdrawal.id ? (
                            <Loader className="inline animate-spin" size={16} />
                          ) : (
                            <>
                              <Check size={16} className="mr-1" />
                              Approve
                            </>
                          )}
                        </Button>
                        <Button onClick={() => handleReject(withdrawal.id)} disabled={actionLoading === withdrawal.id} className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm">
                          {actionLoading === withdrawal.id ? (
                            <Loader className="inline animate-spin" size={16} />
                          ) : (
                            <>
                              <X size={16} className="mr-1" />
                              Reject
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </div>

        {approvedWithdrawals.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              Approved Withdrawals ({approvedWithdrawals.length})
            </h2>
            <div className="space-y-4">
              {approvedWithdrawals.map((withdrawal) => (
                <Card key={withdrawal.id} className="opacity-75">
                  <CardBody className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                      <div>
                        <p className="text-sm text-slate-600">Email</p>
                        <p className="font-semibold text-slate-900">{withdrawal.user_email || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Amount</p>
                        <p className="font-semibold text-slate-900">₦{withdrawal.amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Date</p>
                        <p className="font-semibold text-slate-900">
                          {new Date(withdrawal.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <Badge className="bg-green-100 text-green-700">Approved</Badge>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        )}

        {rejectedWithdrawals.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              Rejected Withdrawals ({rejectedWithdrawals.length})
            </h2>
            <div className="space-y-4">
              {rejectedWithdrawals.map((withdrawal) => (
                <Card key={withdrawal.id} className="opacity-75">
                  <CardBody className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                      <div>
                        <p className="text-sm text-slate-600">Email</p>
                        <p className="font-semibold text-slate-900">{withdrawal.user_email || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Amount</p>
                        <p className="font-semibold text-slate-900">₦{withdrawal.amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Date</p>
                        <p className="font-semibold text-slate-900">
                          {new Date(withdrawal.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <Badge className="bg-red-100 text-red-700">Rejected</Badge>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
