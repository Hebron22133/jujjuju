'use client'

import React, { useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import AdminLayout from '@/components/layout/AdminLayout'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Modal } from '@/components/ui/modal'
import { Search, Edit, Power, PowerOff } from 'lucide-react'

interface User {
  id: string
  email: string
  level_id: string | null
  main_balance: number
  commission_balance: number
  is_activated: boolean
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const supabase = createSupabaseBrowserClient()
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        setUsers(data || [])
      } catch (error) {
        console.error('Error fetching users:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id))
    }
  }

  const handleSelectUser = (id: string) => {
    setSelectedUsers(prev =>
      prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]
    )
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setIsModalOpen(true)
  }

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    setLoading(true)
    try {
      const supabase = createSupabaseBrowserClient()
      const { error } = await supabase
        .from('users')
        .update({ is_activated: !currentStatus })
        .eq('id', id)

      if (error) throw error

      setUsers(prev =>
        prev.map(u =>
          u.id === id
            ? { ...u, is_activated: !currentStatus }
            : u
        )
      )
    } catch (error) {
      console.error('Error toggling user status:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page title */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage and monitor all users in the system.</p>
        </div>

        {/* Search and filters */}
        <Card>
          <CardBody className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Search users by email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                containerClassName="w-full"
              />
            </div>
          </CardBody>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Users ({filteredUsers.length})</h2>
              {selectedUsers.length > 0 && (
                <Badge variant="info">{selectedUsers.length} selected</Badge>
              )}
            </div>
          </CardHeader>
          <CardBody className="p-0">
            {loading ? (
              <div className="px-6 py-8 text-center text-muted-foreground">Loading users...</div>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell className="w-12">
                      <Checkbox
                        checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                        onChange={handleSelectAll}
                      />
                    </TableHeaderCell>
                    <TableHeaderCell>Email</TableHeaderCell>
                    <TableHeaderCell>Level</TableHeaderCell>
                    <TableHeaderCell>Main Balance</TableHeaderCell>
                    <TableHeaderCell>Commission Balance</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Actions</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                      <TableRow key={user.id}>
                        <TableCell className="w-12">
                          <Checkbox
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => handleSelectUser(user.id)}
                          />
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.level_id || 'Unassigned'}</TableCell>
                        <TableCell className="font-medium text-foreground">₦{user.main_balance.toLocaleString()}</TableCell>
                        <TableCell className="font-medium text-foreground">₦{user.commission_balance.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={user.is_activated ? 'success' : 'inactive'}>
                            {user.is_activated ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(user)}
                              className="flex items-center gap-1"
                            >
                              <Edit size={14} />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant={user.is_activated ? 'destructive' : 'default'}
                              onClick={() => handleToggleStatus(user.id, user.is_activated)}
                              disabled={loading}
                              className="flex items-center gap-1"
                            >
                              {user.is_activated ? (
                                <>
                                  <PowerOff size={14} />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <Power size={14} />
                                  Activate
                                </>
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Edit User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingUser(null)
        }}
        title="User Details"
      >
        {editingUser && (
          <div className="space-y-4 px-6 py-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <p className="text-sm bg-secondary p-2 rounded text-foreground">{editingUser.email}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Main Balance</label>
                <p className="text-sm bg-secondary p-2 rounded text-foreground">₦{editingUser.main_balance.toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Commission Balance</label>
                <p className="text-sm bg-secondary p-2 rounded text-foreground">₦{editingUser.commission_balance.toLocaleString()}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Status</label>
              <p className="text-sm">
                <Badge variant={editingUser.is_activated ? 'success' : 'inactive'}>
                  {editingUser.is_activated ? 'Active' : 'Inactive'}
                </Badge>
              </p>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingUser(null)
                }}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  )
}

