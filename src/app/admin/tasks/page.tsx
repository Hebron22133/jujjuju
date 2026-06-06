'use client'

import React, { useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import AdminLayout from '@/components/layout/AdminLayout'
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/card'
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Modal } from '@/components/ui/modal'
import { Plus } from 'lucide-react'

interface Task {
  id: string
  title: string
  description: string
  level_id: string | null
  status: string
  created_at: string
}

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [createFormOpen, setCreateFormOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    level_id: '',
    title: '',
    description: '',
  })

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const supabase = createSupabaseBrowserClient()
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        setTasks(data || [])
      } catch (error) {
        console.error('Error fetching tasks:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [])

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('tasks')
        .insert([
          {
            level_id: formData.level_id || null,
            title: formData.title,
            description: formData.description,
            status: 'active',
          },
        ])
        .select()

      if (error) throw error

      setTasks([...(data || []), ...tasks])
      setCreateFormOpen(false)
      setFormData({ level_id: '', title: '', description: '' })
    } catch (error) {
      console.error('Error creating task:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Tasks Management</h1>
            <p className="text-muted-foreground mt-1">Create and manage tasks for users.</p>
          </div>
          <Button
            variant="default"
            onClick={() => setCreateFormOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus size={18} />
            Create New Task
          </Button>
        </div>

        {/* Tasks Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Tasks ({tasks.length})</h2>
              <Badge variant="info">{tasks.length} total</Badge>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            {loading ? (
              <div className="px-6 py-8 text-center text-muted-foreground">Loading tasks...</div>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Level</TableHeaderCell>
                    <TableHeaderCell>Title</TableHeaderCell>
                    <TableHeaderCell>Description</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Created</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tasks.length > 0 ? (
                    tasks.map(task => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">{task.level_id || 'All Levels'}</TableCell>
                        <TableCell className="font-medium">{task.title}</TableCell>
                        <TableCell>{task.description || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={task.status === 'active' ? 'success' : 'default'}>
                            {task.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(task.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No tasks found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Create Task Modal */}
      <Modal
        isOpen={createFormOpen}
        onClose={() => setCreateFormOpen(false)}
        title="Create New Task"
        className="max-w-md"
      >
        <form onSubmit={handleCreateTask} className="space-y-4 px-6 py-4">
          <Input
            label="Title"
            placeholder="Enter task title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            containerClassName="w-full"
          />

          <Input
            label="Description"
            placeholder="Enter task description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            containerClassName="w-full"
          />

          <Select
            label="Level"
            options={[
              { value: '', label: 'All Levels' },
              { value: '1', label: 'Level 1' },
              { value: '2', label: 'Level 2' },
              { value: '3', label: 'Level 3' },
              { value: '4', label: 'Level 4' },
            ]}
            value={formData.level_id}
            onChange={(e) => setFormData({ ...formData, level_id: e.target.value })}
            containerClassName="w-full"
          />

          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateFormOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="default" disabled={loading}>
              Create Task
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  )
}

