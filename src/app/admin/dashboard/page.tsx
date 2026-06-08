'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { AlertCircle, Users, Briefcase, Image, LogOut, Package, DollarSign, CheckCircle2, Loader } from 'lucide-react'

export default function AdminDashboardPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalTasks: 0,
    pendingTasks: 0,
    pendingWithdrawals: 0,
    totalProducts: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    checkAuth()
    fetchStats()
  }, [])

  const checkAuth = () => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin/login')
    } else {
      setIsAuthenticated(true)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        setError('Failed to load dashboard data')
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err)
      setError('Error connecting to dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    router.push('/admin/login')
  }

  if (!isAuthenticated) {
    return null
  }

  const statCards = [
    {
      title: 'Total Agents',
      value: stats.totalUsers,
      icon: <Users size={24} />,
      color: 'from-blue-500 to-blue-600',
      lightColor: 'bg-blue-50 text-blue-600',
      link: '/admin/agents',
    },
    {
      title: 'Active Agents',
      value: stats.activeUsers,
      icon: <CheckCircle2 size={24} />,
      color: 'from-green-500 to-green-600',
      lightColor: 'bg-green-50 text-green-600',
      link: '/admin/agents',
    },
    {
      title: 'Total Tasks',
      value: stats.totalTasks,
      icon: <Briefcase size={24} />,
      color: 'from-purple-500 to-purple-600',
      lightColor: 'bg-purple-50 text-purple-600',
      link: '/admin/tasks',
    },
    {
      title: 'Pending Tasks',
      value: stats.pendingTasks,
      icon: <AlertCircle size={24} />,
      color: 'from-orange-500 to-orange-600',
      lightColor: 'bg-orange-50 text-orange-600',
      link: '/admin/tasks',
    },
    {
      title: 'Pending Withdrawals',
      value: stats.pendingWithdrawals,
      icon: <DollarSign size={24} />,
      color: 'from-red-500 to-red-600',
      lightColor: 'bg-red-50 text-red-600',
      link: '/admin/withdrawals',
    },
    {
      title: 'Products',
      value: stats.totalProducts,
      icon: <Package size={24} />,
      color: 'from-indigo-500 to-indigo-600',
      lightColor: 'bg-indigo-50 text-indigo-600',
      link: '/admin/products',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-black/40 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">J</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Jumia Admin</h1>
              <p className="text-xs text-slate-400">Management Dashboard</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-slate-200 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-lg transition-all hover:border-red-500/60"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="mb-8 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex gap-3 backdrop-blur">
            <AlertCircle className="text-red-400 flex-shrink-0" size={20} />
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome back!</h2>
          <p className="text-slate-400">Here's your dashboard overview</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader className="animate-spin text-orange-500 mb-4" size={40} />
            <p className="text-slate-300">Loading dashboard data...</p>
          </div>
        )}

        {!loading && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {statCards.map((card) => (
                <button
                  key={card.title}
                  onClick={() => router.push(card.link)}
                  className="group"
                >
                  <Card className="h-full bg-slate-800/50 backdrop-blur border-slate-700/50 hover:border-slate-600 hover:bg-slate-800/70 transition-all hover:shadow-2xl hover:shadow-orange-500/10 cursor-pointer">
                    <CardBody className="p-6">
                      <div className="flex items-start justify-between mb-6">
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${card.color} text-white flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-transform`}>
                          {card.icon}
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${card.lightColor}`}>
                          Active
                        </div>
                      </div>
                      <h3 className="text-sm font-medium text-slate-400 mb-2">{card.title}</h3>
                      <p className="text-4xl font-bold text-white">{card.value}</p>
                      <p className="text-xs text-slate-500 mt-3 group-hover:text-slate-400">Click to view details →</p>
                    </CardBody>
                  </Card>
                </button>
              ))}
            </div>

            {/* Quick Actions Section */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur border border-slate-700/50 rounded-xl p-8 shadow-xl">
              <h3 className="text-xl font-bold text-white mb-6">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                <Button
                  onClick={() => router.push('/admin/agents')}
                  className="w-full bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all py-6"
                >
                  <Users size={20} className="mr-2" />
                  Manage Agents
                </Button>
                <Button
                  onClick={() => router.push('/admin/tasks')}
                  className="w-full bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all py-6"
                >
                  <Briefcase size={20} className="mr-2" />
                  Create Tasks
                </Button>
                <Button
                  onClick={() => router.push('/admin/products')}
                  className="w-full bg-gradient-to-br from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all py-6"
                >
                  <Package size={20} className="mr-2" />
                  Add Products
                </Button>
                <Button
                  onClick={() => router.push('/admin/withdrawals')}
                  className="w-full bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all py-6"
                >
                  <DollarSign size={20} className="mr-2" />
                  Approvals
                </Button>
                <Button
                  onClick={() => router.push('/admin/activations')}
                  className="w-full bg-gradient-to-br from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all py-6"
                >
                  <CheckCircle2 size={20} className="mr-2" />
                  Activations
                </Button>
                <Button
                  onClick={() => router.push('/admin/levels')}
                  className="w-full bg-gradient-to-br from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all py-6"
                >
                  <DollarSign size={20} className="mr-2" />
                  Levels
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
