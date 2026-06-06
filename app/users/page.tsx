'use client'

import React, { useState } from 'react'
import { AppLayout } from '@/components/app-layout'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Modal } from '@/components/ui/modal'
import { Search, Edit, Power, PowerOff } from 'lucide-react'

interface User {
  id: number
  email: string
  level: string
  mainBalance: string
  commissionBalance: string
  status: 'active' | 'inactive'
  lastLogin: string
}

const mockUsers: User[] = [
  {
    id: 1,
    email: 'john.doe@example.com',
    level: 'Level 2',
    mainBalance: '₦50,000',
    commissionBalance: '₦5,200',
    status: 'active',
    lastLogin: '2024-06-04 14:23',
  },
  {
    id: 2,
    email: 'jane.smith@example.com',
    level: 'Level 3',
    mainBalance: '₦120,500',
    commissionBalance: '₦12,800',
    status: 'active',
    lastLogin: '2024-06-04 09:15',
  },
  {
    id: 3,
    email: 'mike.johnson@example.com',
    level: 'Level 1',
    mainBalance: '₦25,000',
    commissionBalance: '₦2,100',
    status: 'inactive',
    lastLogin: '2024-05-28 16:45',
  },
  {
    id: 4,
    email: 'sarah.williams@example.com',
    level: 'Level 4',
    mainBalance: '₦250,000',
    commissionBalance: '₦28,500',
    status: 'active',
    lastLogin: '2024-06-04 11:30',
  },
  {
    id: 5,
    email: 'david.brown@example.com',
    level: 'Level 2',
    mainBalance: '₦75,000',
    commissionBalance: '₦8,400',
    status: 'active',
    lastLogin: '2024-06-03 13:22',
  },
]

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<number[]>([])
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

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

  const handleSelectUser = (id: number) => {
    setSelectedUsers(prev =>
      prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]
    )
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setIsModalOpen(true)
  }

  const handleToggleStatus = (id: number) => {
    setLoading(true)
    setTimeout(() => {
      setUsers(prev =>
        prev.map(u =>
          u.id === id
            ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' }
            : u
        )
      )
      setLoading(false)
    }, 500)
  }

  const handleSaveUser = () => {
    setLoading(true)
    setTimeout(() => {
      if (editingUser) {
        setUsers(prev =>
          prev.map(u => (u.id === editingUser.id ? editingUser : u))
        )
      }
      setIsModalOpen(false)
      setEditingUser(null)
      setLoading(false)
    }, 500)
  }

  return (
    <AppLayout>
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
                className="pl-10"
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
                  <TableHeaderCell>User Level</TableHeaderCell>
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
                      <TableCell>{user.level}</TableCell>
                      <TableCell className="font-medium text-foreground">{user.mainBalance}</TableCell>
                      <TableCell className="font-medium text-foreground">{user.commissionBalance}</TableCell>
                      <TableCell>
                        <Badge variant={user.status === 'active' ? 'success' : 'inactive'}>
                          {user.status === 'active' ? 'Active' : 'Inactive'}
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
                            variant={user.status === 'active' ? 'destructive' : 'default'}
                            onClick={() => handleToggleStatus(user.id)}
                            disabled={loading}
                            className="flex items-center gap-1"
                          >
                            {user.status === 'active' ? (
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
        title="Edit User"
      >
        {editingUser && (
          <div className="space-y-4 px-6 py-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <p className="text-sm bg-secondary p-2 rounded text-foreground">{editingUser.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Current Level</label>
              <p className="text-sm bg-secondary p-2 rounded text-foreground">{editingUser.level}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Main Balance</label>
                <p className="text-sm bg-secondary p-2 rounded text-foreground">{editingUser.mainBalance}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Commission Balance</label>
                <p className="text-sm bg-secondary p-2 rounded text-foreground">{editingUser.commissionBalance}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Status</label>
              <p className="text-sm">
                <Badge variant={editingUser.status === 'active' ? 'success' : 'inactive'}>
                  {editingUser.status === 'active' ? 'Active' : 'Inactive'}
                </Badge>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Last Login</label>
              <p className="text-sm bg-secondary p-2 rounded text-foreground">{editingUser.lastLogin}</p>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingUser(null)
                }}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleSaveUser}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </AppLayout>
  )
}
