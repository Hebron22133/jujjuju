'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, ArrowLeft, Plus, Loader, Upload, Image as ImageIcon } from 'lucide-react'

interface Task {
  id: string
  title: string
  description: string
  amount: number
  status: string
  commission_rate: number
  level_id: number | null
  image_url: string | null
  created_at: string
}

interface Level {
  id: number
  name: string
  task_access_amount: number
}

export default function TasksPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [levels, setLevels] = useState<Level[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    commissionRate: '1.2',
    priority: 'medium',
    levelId: '',
  })

  useEffect(() => {
    checkAuth()
    fetchTasks()
    fetchLevels()
  }, [])

  const checkAuth = () => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin/login')
    }
  }

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/admin/tasks')
      if (!response.ok) throw new Error('Failed to fetch tasks')
      const data = await response.json()
      setTasks(data.tasks || [])
    } catch (err) {
      setError('Failed to load tasks')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchLevels = async () => {
    try {
      const response = await fetch('/api/admin/levels')
      if (response.ok) {
        const data = await response.json()
        setLevels(data.levels || [])
      }
    } catch (err) {
      console.error('Failed to fetch levels:', err)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      if (!formData.levelId) {
        throw new Error('Please select a level for this task')
      }

      const formDataObj = new FormData()
      formDataObj.append('title', formData.title)
      formDataObj.append('description', formData.description)
      formDataObj.append('amount', formData.amount)
      formDataObj.append('commissionRate', formData.commissionRate)
      formDataObj.append('priority', formData.priority)
      formDataObj.append('levelId', formData.levelId)
      if (selectedFile) {
        formDataObj.append('image', selectedFile)
      }

      const response = await fetch('/api/admin/create-task', {
        method: 'POST',
        body: formDataObj,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create task')
      }

      setShowCreateForm(false)
      setFormData({ title: '', description: '', amount: '', commissionRate: '1.2', priority: 'medium', levelId: '' })
      setSelectedFile(null)
      setPreviewUrl(null)
      fetchTasks()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task')
    } finally {
      setSubmitting(false)
    }
  }

  const getLevelName = (levelId: number | null) => {
    if (!levelId) return 'Unassigned'
    const level = levels.find(l => l.id === levelId)
    return level?.name || `Level ${levelId}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned':
        return 'bg-green-100 text-green-700'
      case 'completed':
        return 'bg-blue-100 text-blue-700'
      case 'cancelled':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/admin/dashboard')} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold text-slate-900">Manage Tasks</h1>
          </div>
          <Button onClick={() => setShowCreateForm(!showCreateForm)} className="bg-purple-600 hover:bg-purple-700 text-white">
            <Plus size={18} className="mr-2" />
            Create Task
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {showCreateForm && (
          <Card className="mb-8 border border-purple-200">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200">
              <h2 className="font-semibold text-slate-900">Create Task for Level</h2>
            </CardHeader>
            <CardBody className="p-6">
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Select Level</label>
                    <select value={formData.levelId} onChange={(e) => setFormData({ ...formData, levelId: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" required>
                      <option value="">-- Select a level --</option>
                      {levels.map(level => (
                        <option key={level.id} value={level.id}>{level.name} (₦{level.task_access_amount.toLocaleString()})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Task Title</label>
                    <Input type="text" placeholder="e.g., Process order #12345" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Amount (₦)</label>
                    <Input type="number" placeholder="e.g., 5000" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} step="0.01" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Commission Rate (%)</label>
                    <Input type="number" value={formData.commissionRate} onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })} step="0.01" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                  <textarea placeholder="Task details..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" rows={3} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
                  <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Task Image</label>
                  <div className="flex items-center gap-4">
                    <label className="flex-1 flex items-center justify-center px-4 py-6 border-2 border-dashed border-slate-300 rounded-lg hover:border-purple-500 cursor-pointer transition-colors">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Upload size={20} />
                        <span>Click to upload image</span>
                      </div>
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                    {previewUrl && (
                      <div className="w-24 h-24 rounded-lg overflow-hidden bg-slate-100">
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={submitting || !formData.title || !formData.amount || !formData.levelId} className="bg-purple-600 hover:bg-purple-700 text-white">
                    {submitting ? <Loader className="inline animate-spin mr-2" size={18} /> : null}
                    Create Task
                  </Button>
                  <Button type="button" onClick={() => setShowCreateForm(false)} className="bg-slate-300 hover:bg-slate-400 text-slate-900">
                    Cancel
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-4">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader className="animate-spin text-purple-600" size={32} />
            </div>
          ) : tasks.length === 0 ? (
            <Card>
              <CardBody className="text-center py-12 text-slate-500">
                No tasks yet. Create your first task to get started.
              </CardBody>
            </Card>
          ) : (
            <Card>
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-slate-200">
                <h2 className="font-semibold text-slate-900">All Tasks ({tasks.length})</h2>
              </CardHeader>
              <CardBody className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Title</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Level</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Amount</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Commission</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Status</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map((task) => (
                        <tr key={task.id} className="border-b border-slate-200 hover:bg-slate-50">
                          <td className="px-6 py-4 text-sm text-slate-900">
                            <div className="font-medium">{task.title}</div>
                            {task.description && <div className="text-xs text-slate-600">{task.description.substring(0, 50)}...</div>}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <Badge className="bg-blue-100 text-blue-700">{getLevelName(task.level_id)}</Badge>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-700">₦{task.amount.toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm text-slate-700">{task.commission_rate}%</td>
                          <td className="px-6 py-4 text-sm">
                            <Badge className={getStatusColor(task.status)}>
                              {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {new Date(task.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">💡 How Level-Based Tasks Work:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Create a task and assign it to a specific level</li>
            <li>• All agents at that level will automatically see and can work on the task</li>
            <li>• No need to assign tasks individually to each agent</li>
            <li>• Tasks show in the agent's dashboard under their level</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
