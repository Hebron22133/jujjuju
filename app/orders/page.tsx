'use client'

import React, { useState } from 'react'
import { AppLayout } from '@/components/app-layout'
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/card'
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Modal } from '@/components/ui/modal'
import { Plus, Eye, Edit, Trash2, ChevronDown } from 'lucide-react'

interface Order {
  id: number
  title: string
  amount: string
  commissionRate: number
  assignedTo: string
  status: 'pending' | 'assigned' | 'completed' | 'cancelled'
  completionDate?: string
  createdDate: string
}

const mockOrders: Order[] = [
  {
    id: 1,
    title: 'Website Redesign Project',
    amount: '₦150,000',
    commissionRate: 10,
    assignedTo: 'John Doe',
    status: 'completed',
    completionDate: '2024-06-01',
    createdDate: '2024-05-20',
  },
  {
    id: 2,
    title: 'Mobile App Development',
    amount: '₦500,000',
    commissionRate: 15,
    assignedTo: 'Jane Smith',
    status: 'assigned',
    createdDate: '2024-05-28',
  },
  {
    id: 3,
    title: 'Content Writing - 50 Articles',
    amount: '₦75,000',
    commissionRate: 8,
    assignedTo: 'Unassigned',
    status: 'pending',
    createdDate: '2024-06-02',
  },
  {
    id: 4,
    title: 'Brand Identity Design',
    amount: '₦200,000',
    commissionRate: 12,
    assignedTo: 'Mike Johnson',
    status: 'assigned',
    createdDate: '2024-05-15',
  },
  {
    id: 5,
    title: 'Database Migration',
    amount: '₦300,000',
    commissionRate: 20,
    assignedTo: 'Sarah Williams',
    status: 'cancelled',
    createdDate: '2024-05-10',
  },
]

const mockUsers = [
  { value: 'john-doe', label: 'John Doe' },
  { value: 'jane-smith', label: 'Jane Smith' },
  { value: 'mike-johnson', label: 'Mike Johnson' },
  { value: 'sarah-williams', label: 'Sarah Williams' },
]

const statusColors = {
  pending: 'warning',
  assigned: 'info',
  completed: 'success',
  cancelled: 'danger',
} as const

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders)
  const [createFormOpen, setCreateFormOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [filterUser, setFilterUser] = useState<string>('')
  const [loading, setLoading] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    commissionRate: '',
    assignedTo: '',
  })

  const filteredOrders = orders.filter(order => {
    const statusMatch = !filterStatus || order.status === filterStatus
    const userMatch = !filterUser || order.assignedTo.toLowerCase().includes(filterUser.toLowerCase())
    return statusMatch && userMatch
  })

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    setTimeout(() => {
      const newOrder: Order = {
        id: orders.length + 1,
        title: formData.title,
        amount: formData.amount,
        commissionRate: parseFloat(formData.commissionRate),
        assignedTo: formData.assignedTo || 'Unassigned',
        status: 'pending',
        createdDate: new Date().toISOString().split('T')[0],
      }

      setOrders([...orders, newOrder])
      setCreateFormOpen(false)
      setFormData({ title: '', amount: '', commissionRate: '', assignedTo: '' })
      setLoading(false)
    }, 500)
  }

  const handleDeleteOrder = (id: number) => {
    setLoading(true)
    setTimeout(() => {
      setOrders(orders.filter(o => o.id !== id))
      setLoading(false)
    }, 500)
  }

  const handleStatusChange = (id: number, newStatus: Order['status']) => {
    setLoading(true)
    setTimeout(() => {
      setOrders(orders.map(o =>
        o.id === id
          ? {
            ...o,
            status: newStatus,
            completionDate: newStatus === 'completed' ? new Date().toISOString().split('T')[0] : undefined,
          }
          : o
      ))
      setLoading(false)
    }, 500)
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Orders/Tasks Management</h1>
            <p className="text-muted-foreground mt-1">Create and manage tasks for users.</p>
          </div>
          <Button
            variant="default"
            onClick={() => setCreateFormOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus size={18} />
            Create New Order
          </Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Filter by Status"
            options={[
              { value: '', label: 'All Status' },
              { value: 'pending', label: 'Pending' },
              { value: 'assigned', label: 'Assigned' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            containerClassName="w-full"
          />
          <Input
            placeholder="Filter by assigned user..."
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            containerClassName="w-full"
          />
        </div>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Orders ({filteredOrders.length})</h2>
              <Badge variant="info">{orders.length} total</Badge>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Order Title</TableHeaderCell>
                  <TableHeaderCell>Amount</TableHeaderCell>
                  <TableHeaderCell>Commission Rate</TableHeaderCell>
                  <TableHeaderCell>Assigned To</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Completion Date</TableHeaderCell>
                  <TableHeaderCell>Actions</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map(order => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.title}</TableCell>
                      <TableCell className="font-medium text-foreground">{order.amount}</TableCell>
                      <TableCell>{order.commissionRate}%</TableCell>
                      <TableCell>{order.assignedTo}</TableCell>
                      <TableCell>
                        <Badge variant={statusColors[order.status]}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {order.completionDate || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex items-center gap-1"
                          >
                            <Eye size={14} />
                            View
                          </Button>
                          <div className="relative group">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex items-center gap-1"
                            >
                              <ChevronDown size={14} />
                              Status
                            </Button>
                            <div className="absolute top-full right-0 mt-1 bg-card border border-border rounded shadow-lg hidden group-hover:block z-10">
                              {(['pending', 'assigned', 'completed', 'cancelled'] as const).map(status => (
                                <button
                                  key={status}
                                  onClick={() => handleStatusChange(order.id, status)}
                                  className="block w-full text-left px-4 py-2 text-sm hover:bg-secondary first:rounded-t last:rounded-b"
                                >
                                  {status.charAt(0).toUpperCase() + status.slice(1)}
                                </button>
                              ))}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteOrder(order.id)}
                            disabled={loading}
                            className="flex items-center gap-1"
                          >
                            <Trash2 size={14} />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No orders found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </div>

      {/* Create Order Modal */}
      <Modal
        isOpen={createFormOpen}
        onClose={() => setCreateFormOpen(false)}
        title="Create New Order"
        className="max-w-md"
      >
        <form onSubmit={handleCreateOrder} className="space-y-4 px-6 py-4">
          <Input
            label="Order Title"
            placeholder="e.g., Website Redesign"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <Input
            label="Amount (₦)"
            placeholder="e.g., 150000"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
          />

          <Input
            label="Commission Rate (%)"
            placeholder="e.g., 10"
            type="number"
            step="0.1"
            value={formData.commissionRate}
            onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
            required
          />

          <Select
            label="Assign to User"
            options={[{ value: '', label: 'Leave Unassigned' }, ...mockUsers]}
            value={formData.assignedTo}
            onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
          />

          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateFormOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Order'}
            </Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  )
}
