'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, ArrowLeft, CheckCircle, XCircle, Loader, RefreshCw } from 'lucide-react'

interface Agent {
  id: string
  email: string
  balance: number
  is_activated: boolean
  tier_level: number
  created_at: string
}

export default function AgentsPage() {
  const router = useRouter()
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState(1)
  const [customAmount, setCustomAmount] = useState<string>('')
  const [activatingUserId, setActivatingUserId] = useState<string | null>(null)
  const [editingAgentId, setEditingAgentId] = useState<string | null>(null)
  const [editAmount, setEditAmount] = useState<string>('')
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    checkAuth()
    fetchAgents()
    
    // Start polling every 5 seconds for auto-refresh
    pollingIntervalRef.current = setInterval(() => {
      fetchAgents(true)
    }, 5000)

    // Cleanup polling on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [])

  const checkAuth = () => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin/login')
    }
  }

  const fetchAgents = async (isPolling = false) => {
    try {
      if (!isPolling) setLoading(true)
      const response = await fetch('/api/admin/agents')
      if (!response.ok) throw new Error('Failed to fetch agents')
      const data = await response.json()
      setAgents(data.agents || [])
      setLastUpdated(new Date())
      setError('')
    } catch (err) {
      setError('Failed to load agents')
      console.error(err)
    } finally {
      if (!isPolling) setLoading(false)
    }
  }

  const handleManualRefresh = async () => {
    setIsRefreshing(true)
    await fetchAgents(false)
    setIsRefreshing(false)
  }

  const toggleActivation = async (userId: string, currentStatus: boolean) => {
    if (currentStatus) {
      // Deactivating
      setActionLoading(userId)
      try {
        const response = await fetch('/api/admin/deactivate-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId }),
        })

        if (!response.ok) throw new Error('Failed to update agent status')
        fetchAgents()
      } catch (err) {
        setError('Failed to update agent status')
        console.error(err)
      } finally {
        setActionLoading(null)
      }
    } else {
      // Activating - show amount input
      setActivatingUserId(userId)
      setCustomAmount('')
    }
  }

  const confirmActivation = async () => {
    if (!activatingUserId || !customAmount) {
      setError('Please enter an amount')
      return
    }

    const amount = parseFloat(customAmount)
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount')
      return
    }

    // Determine level based on amount
    let level = 1
    if (amount >= 200000) level = 5
    else if (amount >= 100000) level = 4
    else if (amount >= 50000) level = 3
    else if (amount >= 10000) level = 2
    else level = 1

    setActionLoading(activatingUserId)
    try {
      const response = await fetch('/api/admin/activate-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: activatingUserId, level, amount }),
      })

      if (!response.ok) throw new Error('Failed to activate agent')
      fetchAgents()
      setActivatingUserId(null)
      setCustomAmount('')
      setError('')
    } catch (err) {
      setError('Failed to activate agent')
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  const updateAgentLevel = async () => {
    if (!editingAgentId || !editAmount) {
      setError('Please enter an amount')
      return
    }

    const amount = parseFloat(editAmount)
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount')
      return
    }

    // Determine level based on amount
    let level = 1
    if (amount >= 200000) level = 5
    else if (amount >= 100000) level = 4
    else if (amount >= 50000) level = 3
    else if (amount >= 10000) level = 2
    else level = 1

    setActionLoading(editingAgentId)
    try {
      const response = await fetch('/api/admin/update-agent-level', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: editingAgentId, level, amount }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update agent level')
      }
      
      fetchAgents()
      setEditingAgentId(null)
      setEditAmount('')
      setError('')
    } catch (err: any) {
      setError(err.message || 'Failed to update agent level')
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  const filteredAgents = agents.filter((agent) =>
    agent.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold text-slate-900">Manage Agents</h1>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-xs text-slate-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
              title="Manually refresh agents list"
            >
              <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <Input
            type="text"
            placeholder="Search agents by email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-96"
          />
        </div>

        {/* Agents Table */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-slate-200">
            <h2 className="font-semibold text-slate-900">All Agents ({filteredAgents.length})</h2>
          </CardHeader>
          <CardBody className="p-0">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader className="animate-spin text-blue-600" size={32} />
              </div>
            ) : filteredAgents.length === 0 ? (
              <div className="text-center py-12 text-slate-500">No agents found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Balance</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Tier</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAgents.map((agent) => (
                      <tr key={agent.id} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm text-slate-900">{agent.email}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">₦{agent.balance.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm">
                          <Badge className={`bg-blue-100 text-blue-700`}>Tier {agent.tier_level}</Badge>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {agent.is_activated ? (
                            <Badge className="bg-green-100 text-green-700">Active</Badge>
                          ) : (
                            <Badge className="bg-slate-100 text-slate-700">Inactive</Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => toggleActivation(agent.id, agent.is_activated)}
                              disabled={actionLoading === agent.id}
                              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                                agent.is_activated
                                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                  : 'bg-green-100 text-green-700 hover:bg-green-200'
                              } ${actionLoading === agent.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {actionLoading === agent.id ? (
                                <Loader className="inline animate-spin" size={16} />
                              ) : agent.is_activated ? (
                                'Deactivate'
                              ) : (
                                'Activate'
                              )}
                            </button>
                            {agent.is_activated && (
                              <button
                                onClick={() => setEditingAgentId(agent.id)}
                                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200"
                              >
                                Edit Level
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Amount Input Modal */}
        {activatingUserId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-slate-200">
                <h2 className="font-semibold text-slate-900">Activate Agent</h2>
              </CardHeader>
              <CardBody className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Amount Agent Paid (₦)
                    </label>
                    <Input
                      type="number"
                      placeholder="e.g., 4000, 10000, 50000"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value)
                        setError('')
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-slate-600 mt-2">
                      System will automatically set the appropriate level based on the amount
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-blue-900 mb-2">Level Mapping:</p>
                    <ul className="text-xs text-blue-800 space-y-1">
                      <li>• ₦0 - ₦9,999 → Level 1 (₦4,000)</li>
                      <li>• ₦10,000 - ₦49,999 → Level 2 (₦10,000)</li>
                      <li>• ₦50,000 - ₦99,999 → Level 3 (₦50,000)</li>
                      <li>• ₦100,000 - ₦199,999 → Level 4 (₦100,000)</li>
                      <li>• ₦200,000+ → Level 5 (₦200,000)</li>
                    </ul>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
                      <AlertCircle className="text-red-600 flex-shrink-0" size={18} />
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setActivatingUserId(null)
                      setCustomAmount('')
                      setError('')
                    }}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmActivation}
                    disabled={actionLoading === activatingUserId || !customAmount}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
                  >
                    {actionLoading === activatingUserId ? 'Activating...' : 'Activate'}
                  </button>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Edit Agent Level Modal */}
        {editingAgentId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b border-slate-200">
                <h2 className="font-semibold text-slate-900">Change Agent Level</h2>
              </CardHeader>
              <CardBody className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      New Amount (₦)
                    </label>
                    <Input
                      type="number"
                      placeholder="e.g., 4000, 10000, 50000"
                      value={editAmount}
                      onChange={(e) => {
                        setEditAmount(e.target.value)
                        setError('')
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <p className="text-xs text-slate-600 mt-2">
                      Enter the new amount to update the agent's level and balance
                    </p>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-purple-900 mb-2">Level Mapping:</p>
                    <ul className="text-xs text-purple-800 space-y-1">
                      <li>• ₦0 - ₦9,999 → Level 1</li>
                      <li>• ₦10,000 - ₦49,999 → Level 2</li>
                      <li>• ₦50,000 - ₦99,999 → Level 3</li>
                      <li>• ₦100,000 - ₦199,999 → Level 4</li>
                      <li>• ₦200,000+ → Level 5</li>
                    </ul>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
                      <AlertCircle className="text-red-600 flex-shrink-0" size={18} />
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setEditingAgentId(null)
                      setEditAmount('')
                      setError('')
                    }}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={updateAgentLevel}
                    disabled={actionLoading === editingAgentId || !editAmount}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50"
                  >
                    {actionLoading === editingAgentId ? 'Updating...' : 'Update'}
                  </button>
                </div>
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
