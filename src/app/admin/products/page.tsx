'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, ArrowLeft, Plus, Loader, Upload, Image as ImageIcon } from 'lucide-react'

interface Product {
  id: string
  title: string
  description: string
  price: number
  image_url: string | null
  created_at: string
}

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    checkAuth()
    fetchProducts()
  }, [])

  const checkAuth = () => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin/login')
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products')
      if (!response.ok) throw new Error('Failed to fetch products')
      const data = await response.json()
      setProducts(data.products || [])
    } catch (err) {
      setError('Failed to load products')
      console.error(err)
    } finally {
      setLoading(false)
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

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const formDataObj = new FormData()
      formDataObj.append('title', formData.title)
      formDataObj.append('description', formData.description)
      if (formData.price) {
        formDataObj.append('price', formData.price)
      }
      if (selectedFile) {
        formDataObj.append('image', selectedFile)
      }

      const response = await fetch('/api/admin/create-product', {
        method: 'POST',
        body: formDataObj,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create product')
      }

      setShowCreateForm(false)
      setFormData({ title: '', description: '', price: '' })
      setSelectedFile(null)
      setPreviewUrl(null)
      fetchProducts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product')
    } finally {
      setSubmitting(false)
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
            <h1 className="text-2xl font-bold text-slate-900">Manage Products</h1>
          </div>
          <Button onClick={() => setShowCreateForm(!showCreateForm)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus size={18} className="mr-2" />
            Add Product
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
          <Card className="mb-8 border border-indigo-200">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-b border-indigo-200">
              <h2 className="font-semibold text-slate-900">Add New Product</h2>
            </CardHeader>
            <CardBody className="p-6">
              <form onSubmit={handleCreateProduct} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Product Title</label>
                    <Input type="text" placeholder="e.g., Premium Handset" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Price (₦)</label>
                    <Input type="number" placeholder="e.g., 50000" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} step="0.01" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                  <textarea placeholder="Product details..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" rows={3} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Product Image</label>
                  <div className="flex items-center gap-4">
                    <label className="flex-1 flex items-center justify-center px-4 py-6 border-2 border-dashed border-slate-300 rounded-lg hover:border-indigo-500 cursor-pointer transition-colors">
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
                  <Button type="submit" disabled={submitting || !formData.title} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    {submitting ? <Loader className="inline animate-spin mr-2" /> : null}
                    Add Product
                  </Button>
                  <Button type="button" onClick={() => setShowCreateForm(false)} className="bg-slate-300 hover:bg-slate-400 text-slate-900">
                    Cancel
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader className="animate-spin text-indigo-600" size={32} />
            </div>
          ) : products.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-500">
              No products yet. Add your first product to get started.
            </div>
          ) : (
            products.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square overflow-hidden bg-slate-100">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="text-slate-400" size={48} />
                    </div>
                  )}
                </div>
                <CardBody className="p-4">
                  <h3 className="font-semibold text-slate-900 mb-1">{product.title}</h3>
                  {product.description && (
                    <p className="text-slate-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                  )}
                  {product.price && (
                    <p className="text-lg font-bold text-indigo-600">₦{product.price.toLocaleString()}</p>
                  )}
                </CardBody>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
