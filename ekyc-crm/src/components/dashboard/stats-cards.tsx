"use client"

import { Users, UserPlus, Clock, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface StatsProps {
  stats: {
    totalCustomers: number
    monthlyOnboarded: number
    pendingReview: number
    highRisk: number
  }
}

const statCards = [
  {
    key: "totalCustomers" as const,
    title: "Total Customers",
    icon: Users,
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    change: "+12.5%",
    trending: "up" as const,
  },
  {
    key: "monthlyOnboarded" as const,
    title: "Monthly Onboarded",
    icon: UserPlus,
    iconBg: "bg-green-100 dark:bg-green-900/30",
    iconColor: "text-green-600 dark:text-green-400",
    change: "+8.2%",
    trending: "up" as const,
  },
  {
    key: "pendingReview" as const,
    title: "Pending Review",
    icon: Clock,
    iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
    iconColor: "text-yellow-600 dark:text-yellow-400",
    change: "-3.1%",
    trending: "down" as const,
  },
  {
    key: "highRisk" as const,
    title: "High Risk",
    icon: AlertTriangle,
    iconBg: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-600 dark:text-red-400",
    change: "+2.4%",
    trending: "up" as const,
  },
]

export function StatsCards({ stats }: StatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((card) => {
        const Icon = card.icon
        const value = stats[card.key]
        const isUp = card.trending === "up"

        return (
          <Card key={card.key}>
            <CardContent className="flex items-center gap-4">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${card.iconBg}`}>
                <Icon className={`h-6 w-6 ${card.iconColor}`} />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{value.toLocaleString()}</span>
                  <span
                    className={`flex items-center gap-0.5 text-xs font-medium ${
                      isUp && card.key !== "highRisk"
                        ? "text-green-600 dark:text-green-400"
                        : card.key === "pendingReview" && !isUp
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {isUp ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {card.change}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
