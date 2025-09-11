// src/components/agent/AgentQuickActions.tsx
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface QuickAction {
  icon: LucideIcon;
  label: string;
  href: string;
  iconColor?: string;
  description?: string;
}

interface AgentQuickActionsProps {
  actions: QuickAction[];
}

const AgentQuickActions: React.FC<AgentQuickActionsProps> = ({ actions }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                asChild
                variant="outline"
                className="h-auto py-6 flex-col gap-2 text-center">
                <Link to={action.href}>
                  <Icon
                    className={`h-8 w-8 ${action.iconColor || "text-primary"}`}
                  />
                  <span className="font-medium">{action.label}</span>
                  {action.description && (
                    <span className="text-sm text-muted-foreground">
                      {action.description}
                    </span>
                  )}
                </Link>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentQuickActions;
