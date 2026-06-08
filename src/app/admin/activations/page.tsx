'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, ArrowLeft, Loader, RefreshCw } from 'lucide-react'

interface Agent {
  id: string
  email: string
  balance: number
  is_activated: boolean
  tier_level: number
  created_at: string
}

export default function ActivationsPage() {
  const router = useRouter()
  const [inactiveAgents, setInactiveAgents] = useState<Agent[]>([])
  const [activeAgents, setActiveAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
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
      const agents = data.agents || []
      setInactiveAgents(agents.filter((a: Agent) => !a.is_activated))
      setActiveAgents(agents.filter((a: Agent) => a.is_activated))
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

  const handleActivate = async (userId: string) => {
    setActionLoading(userId)
    try {
      const response = await fetch('/api/admin/activate-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      })

      if (!response.ok) throw new Error('Failed to activate agent')
      fetchAgents()
    } catch (err) {
      setError('Failed to activate agent')
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeactivate = async (userId: string) => {
    setActionLoading(userId)
    try {
      const response = await fetch('/api/admin/deactivate-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      })

      if (!response.ok) throw new Error('Failed to deactivate agent')
      fetchAgents()
    } catch (err) {
      setError('Failed to deactivate agent')
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  const filteredInactive = inactiveAgents.filter((agent) =>
    agent.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredActive = activeAgents.filter((agent) =>
    agent.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/admin/dashboard')} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold text-slate-900">Activations</h1>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="mb-8">
          <Input
            type="text"
            placeholder="Search agents by email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-96"
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader className="animate-spin text-green-600" size={32} />
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4 text-orange-600">
                Pending Activation ({filteredInactive.length})
              </h2>
              {filteredInactive.length === 0 ? (
                <Card>
                  <CardBody className="text-center py-8 text-slate-500">
                    {searchTerm ? 'No inactive agents match your search' : 'All agents are activated!'}
                  </CardBody>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredInactive.map((agent) => (
                    <Card key={agent.id} className="hover:shadow-lg transition-shadow">
                      <CardBody className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                          <div>
                            <p className="text-sm text-slate-600">Email</p>
                            <p className="font-semibold text-slate-900">{agent.email}</p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600">Balance</p>
                            <p className="font-semibold text-slate-900">₦{agent.balance.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600">Tier</p>
                            <Badge className="bg-blue-100 text-blue-700">Tier {agent.tier_level}</Badge>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600">Status</p>
                            <Badge className="bg-orange-100 text-orange-700">Inactive</Badge>
                          </div>
                          <div>
                            <Button
                              onClick={() => handleActivate(agent.id)}
                              disabled={actionLoading === agent.id}
                              className="w-full bg-green-600 hover:bg-green-700 text-white"
                            >
                              {actionLoading === agent.id ? (
                                <Loader className="inline animate-spin" size={16} />
                              ) : (
                                'Activate'
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

            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-4 text-green-600">
                Active Agents ({filteredActive.length})
              </h2>
              {filteredActive.length === 0 ? (
                <Card>
                  <CardBody className="text-center py-8 text-slate-500">
                    No active agents
                  </CardBody>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredActive.map((agent) => (
                    <Card key={agent.id} className="opacity-75 hover:shadow-lg transition-shadow">
                      <CardBody className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                          <div>
                            <p className="text-sm text-slate-600">Email</p>
                            <p className="font-semibold text-slate-900">{agent.email}</p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600">Balance</p>
                            <p className="font-semibold text-slate-900">₦{agent.balance.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600">Tier</p>
                            <Badge className="bg-blue-100 text-blue-700">Tier {agent.tier_level}</Badge>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600">Status</p>
                            <Badge className="bg-green-100 text-green-700">Active</Badge>
                          </div>
                          <div>
                            <Button
                              onClick={() => handleDeactivate(agent.id)}
                              disabled={actionLoading === agent.id}
                              className="w-full bg-red-600 hover:bg-red-700 text-white"
                            >
                              {actionLoading === agent.id ? (
                                <Loader className="inline animate-spin" size={16} />
                              ) : (
                                'Deactivate'
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
          </>
        )}
      </div>
    </div>
  )
}
