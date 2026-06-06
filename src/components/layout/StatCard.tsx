import React from 'react'
import { Card, CardBody } from '@/components/ui/card'

interface StatCardProps {
  title: string
  value: string | number
  icon?: React.ReactNode
  trend?: {
    value: number
    direction: 'up' | 'down'
  }
}

export default function StatCard({ title, value, icon, trend }: StatCardProps) {
  return (
    <Card>
      <CardBody className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {trend && (
            <p className={`text-xs mt-2 font-medium ${trend.direction === 'up' ? 'text-success' : 'text-destructive'}`}>
              {trend.direction === 'up' ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        {icon && (
          <div className="text-primary opacity-20">
            {icon}
          </div>
        )}
      </CardBody>
    </Card>
  )
}
