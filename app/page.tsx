'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
    if (token) {
      router.replace('/dashboard')
    } else {
      router.replace('/admin/login')
    }
    setIsReady(true)
  }, [router])

  return null
}
