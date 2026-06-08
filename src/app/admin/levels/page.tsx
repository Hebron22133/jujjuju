'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AlertCircle, ArrowLeft, Loader, Check } from 'lucide-react'

interface Level {
  id: number
  name: string
  entry_amount: number
  task_access_amount: number
  daily_commission: number
  duration_days: number
}

export default function LevelsPage() {
  const router = useRouter()
  const [levels, setLevels] = useState<Level[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValues, setEditValues] = useState<{ [key: number]: Partial<Level> }>({})
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState<number | null>(null)

  useEffect(() => {
    checkAuth()
    fetchLevels()
  }, [])

  const checkAuth = () => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin/login')
    }
  }

  const fetchLevels = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/levels')
      if (!response.ok) throw new Error('Failed to fetch levels')
      const data = await response.json()
      setLevels(data.levels || [])
      setError('')
    } catch (err) {
      setError('Failed to load levels')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (level: Level) => {
    setEditingId(level.id)
    setEditValues({
      ...editValues,
      [level.id]: { ...level }
    })
  }

  const handleInputChange = (levelId: number, field: keyof Level, value: string) => {
    setEditValues({
      ...editValues,
      [levelId]: {
        ...editValues[levelId],
        [field]: field === 'name' ? value : parseFloat(value) || 0
      }
    })
  }

  const handleSave = async (levelId: number) => {
    setSaving(true)
    try {
      const formData = new FormData()
      const values = editValues[levelId]
      formData.append('level_id', levelId.toString())
      formData.append('task_access_amount', (values.task_access_amount || 0).toString())
      formData.append('daily_commission', (values.daily_commission || 0).toString())
      formData.append('entry_amount', (values.entry_amount || 0).toString())

      const response = await fetch('/api/admin/levels', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Failed to update level')
      
      setSaveSuccess(levelId)
      setTimeout(() => setSaveSuccess(null), 2000)
      setEditingId(null)
      fetchLevels()
    } catch (err) {
      setError('Failed to save level')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditValues({})
  }

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
            <h1 className="text-2xl font-bold text-slate-900">Level Settings</h1>
          </div>
          <p className="text-sm text-slate-600">Manage level amounts and commissions</p>
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

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader className="animate-spin text-blue-600" size={32} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {levels.map((level) => (
              <Card key={level.id} className="relative">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-slate-200">
                  <h2 className="font-bold text-slate-900">
                    {editingId === level.id ? (
                      <input
                        type="text"
                        value={editValues[level.id]?.name || level.name}
                        onChange={(e) => handleInputChange(level.id, 'name', e.target.value)}
                        className="px-2 py-1 border border-slate-300 rounded"
                      />
                    ) : (
                      level.name
                    )}
                  </h2>
                </CardHeader>
                <CardBody className="p-4 space-y-4">
                  {/* Task Access Amount */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Amount for Level
                    </label>
                    {editingId === level.id ? (
                      <input
                        type="number"
                        value={editValues[level.id]?.task_access_amount || 0}
                        onChange={(e) => handleInputChange(level.id, 'task_access_amount', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                    ) : (
                      <p className="text-lg font-bold text-blue-600">
                        ₦{level.task_access_amount.toLocaleString()}
                      </p>
                    )}
                  </div>

                  {/* Daily Commission */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Daily Commission
                    </label>
                    {editingId === level.id ? (
                      <input
                        type="number"
                        value={editValues[level.id]?.daily_commission || 0}
                        onChange={(e) => handleInputChange(level.id, 'daily_commission', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                    ) : (
                      <p className="text-base font-semibold text-green-600">
                        ₦{level.daily_commission.toLocaleString()}
                      </p>
                    )}
                  </div>

                  {/* Entry Amount */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Entry Amount
                    </label>
                    {editingId === level.id ? (
                      <input
                        type="number"
                        value={editValues[level.id]?.entry_amount || 0}
                        onChange={(e) => handleInputChange(level.id, 'entry_amount', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                    ) : (
                      <p className="text-sm text-slate-600">
                        ₦{level.entry_amount.toLocaleString()}
                      </p>
                    )}
                  </div>

                  {/* Duration */}
                  <div className="text-sm text-slate-600">
                    <span className="font-semibold">Duration:</span> {level.duration_days} days
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    {editingId === level.id ? (
                      <>
                        <button
                          onClick={() => handleSave(level.id)}
                          disabled={saving}
                          className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 text-sm flex items-center justify-center gap-1"
                        >
                          {saving ? <Loader size={16} className="animate-spin" /> : <Check size={16} />}
                          Save
                        </button>
                        <button
                          onClick={handleCancel}
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg font-medium hover:bg-slate-50 text-sm"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleEdit(level)}
                        className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 text-sm"
                      >
                        Edit
                      </button>
                    )}
                  </div>

                  {/* Save Success Message */}
                  {saveSuccess === level.id && (
                    <p className="text-sm text-green-600 font-semibold">✓ Saved successfully</p>
                  )}
                </CardBody>
              </Card>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">💡 How Level Settings Work:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Amount for Level</strong>: The balance agents get when activated at this level</li>
            <li>• <strong>Daily Commission</strong>: Earnings per day agents at this level receive</li>
            <li>• <strong>Entry Amount</strong>: The payment required to access this level</li>
            <li>• When you change the amount, all active agents at that level will have their balance updated</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
