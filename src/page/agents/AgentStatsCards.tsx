// src/components/agent/AgentStatsCards.tsx
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LucideIcon } from "lucide-react";

interface StatCard {
  icon: LucideIcon;
  value: string | number;
  label: string;
  trend?: "up" | "down" | "neutral";
  iconColor?: string;
}

interface AgentStatsCardsProps {
  stats: StatCard[];
  isLoading?: boolean;
}

const AgentStatsCards: React.FC<AgentStatsCardsProps> = ({
  stats,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <Skeleton className="h-8 w-8 mb-4" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const trendIcon =
          stat.trend === "up" ? "↗" : stat.trend === "down" ? "↘" : "→";

        return (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Icon
                  className={`h-8 w-8 ${stat.iconColor || "text-primary"}`}
                />
                <span className="text-muted-foreground">{trendIcon}</span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {stat.value}
              </div>
              <div className="text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AgentStatsCards;
