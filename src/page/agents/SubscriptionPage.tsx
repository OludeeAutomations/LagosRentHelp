// Create a new subscription page
// src/pages/agent/SubscriptionPage.tsx
import React from "react";
import { Link } from "react-router-dom";
import { CreditCard, CheckCircle, Star, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const SubscriptionPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Subscription Plans</h1>
        <p className="text-muted-foreground">
          Choose the plan that works best for you
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Basic Plan */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Basic</CardTitle>
            <CardDescription>For new agents</CardDescription>
            <div className="text-2xl font-bold">
              ₦5,000<span className="text-sm font-normal">/month</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />5 active
                listings
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Basic analytics
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Email support
              </li>
            </ul>
            <Button className="w-full mt-4">Subscribe</Button>
          </CardContent>
        </Card>

        {/* Premium Plan */}
        <Card className="border-2 border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Premium</CardTitle>
              <Badge variant="secondary" className="bg-primary">
                Popular
              </Badge>
            </div>
            <CardDescription>For professional agents</CardDescription>
            <div className="text-2xl font-bold">
              ₦10,000<span className="text-sm font-normal">/month</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Unlimited listings
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Advanced analytics
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Priority support
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Featured listings
              </li>
            </ul>
            <Button className="w-full mt-4 bg-primary">Subscribe</Button>
          </CardContent>
        </Card>

        {/* Enterprise Plan */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Enterprise</CardTitle>
            <CardDescription>For agencies</CardDescription>
            <div className="text-2xl font-bold">
              ₦25,000<span className="text-sm font-normal">/month</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Multiple agents
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Custom branding
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Dedicated support
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                API access
              </li>
            </ul>
            <Button className="w-full mt-4">Contact Sales</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Referral Program</CardTitle>
          <CardDescription>Earn free listing weeks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Star className="h-12 w-12 text-yellow-500" />
            <div>
              <h3 className="font-semibold">Get 1 free week per referral</h3>
              <p className="text-muted-foreground">
                Share your referral code with other agents. When they sign up
                using your code, you both get 1 free week of listing!
              </p>
              <Button variant="outline" className="mt-2" asChild>
                <Link to="/agent-dashboard/referral">
                  View Referral Program
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionPage;
