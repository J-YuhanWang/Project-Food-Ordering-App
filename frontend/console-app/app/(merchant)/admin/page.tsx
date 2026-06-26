"use client";

import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  Euro,
  Users,
  UtensilsCrossed,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Types
interface OrderDTO {
  id: number;
  customerId: number;
  customerName: string;
  canteenId: number;
  canteenName: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
}

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

interface RevenueStats {
  totalRevenue: number;
  monthlyBreakdown: { month: string; revenue: number }[];
}

interface CustomerCount {
  totalCustomers: number;
}

type OrderStatus =
  | "INITIALIZED"
  | "CONFIRMED"
  | "READY_FOR_PICKUP"
  | "COMPLETED"
  | "CANCELLED"
  | "FAILED";

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  INITIALIZED: { label: "Initialized", className: "bg-gray-100 text-gray-700" },
  CONFIRMED: { label: "Preparing", className: "bg-blue-100 text-blue-700" },
  READY_FOR_PICKUP: { label: "Ready", className: "bg-orange-100 text-orange-700" },
  COMPLETED: { label: "Completed", className: "bg-green-100 text-green-700" },
  CANCELLED: { label: "Cancelled", className: "bg-red-100 text-red-700" },
  FAILED: { label: "Failed", className: "bg-red-200 text-red-800" },
};

// Mock Data
const mockRevenueStats: RevenueStats = {
  totalRevenue: 45680.50,
  monthlyBreakdown: [
    { month: "Jan", revenue: 3200 },
    { month: "Feb", revenue: 4100 },
    { month: "Mar", revenue: 3800 },
    { month: "Apr", revenue: 5200 },
    { month: "May", revenue: 4800 },
    { month: "Jun", revenue: 5600 },
    { month: "Jul", revenue: 6100 },
    { month: "Aug", revenue: 4200 },
    { month: "Sep", revenue: 5400 },
    { month: "Oct", revenue: 5800 },
    { month: "Nov", revenue: 4890 },
  ],
};

const mockCustomerCount: CustomerCount = {
  totalCustomers: 1247,
};

const mockRecentOrders: OrderDTO[] = [
  {
    id: 1847,
    customerId: 342,
    customerName: "Emma O'Brien",
    canteenId: 1,
    canteenName: "Pi Restaurant",
    totalAmount: 12.50,
    status: "READY_FOR_PICKUP",
    createdAt: "2024-11-15T12:30:00",
  },
  {
    id: 1846,
    customerId: 156,
    customerName: "Liam Murphy",
    canteenId: 2,
    canteenName: "Global Grill",
    totalAmount: 18.75,
    status: "CONFIRMED",
    createdAt: "2024-11-15T12:25:00",
  },
  {
    id: 1845,
    customerId: 89,
    customerName: "Saoirse Kelly",
    canteenId: 3,
    canteenName: "The Coffee Dock",
    totalAmount: 6.40,
    status: "COMPLETED",
    createdAt: "2024-11-15T12:20:00",
  },
  {
    id: 1844,
    customerId: 567,
    customerName: "Cian Daly",
    canteenId: 1,
    canteenName: "Pi Restaurant",
    totalAmount: 24.99,
    status: "INITIALIZED",
    createdAt: "2024-11-15T12:15:00",
  },
  {
    id: 1843,
    customerId: 78,
    customerName: "Niamh Byrne",
    canteenId: 4,
    canteenName: "O'Reilly Hall Cafe",
    totalAmount: 9.30,
    status: "COMPLETED",
    createdAt: "2024-11-15T12:10:00",
  },
];

const orderStatusDistribution = [
  { name: "Completed", value: 45, color: "#22C55E" },
  { name: "Preparing", value: 12, color: "#3B82F6" },
  { name: "Ready", value: 8, color: "#F97316" },
  { name: "Initialized", value: 5, color: "#6B7280" },
  { name: "Cancelled", value: 3, color: "#EF4444" },
];

// Stat Card Component
function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  isLoading,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: "up" | "down";
  trendValue?: string;
  isLoading?: boolean;
}) {
  return (
    <Card className="rounded-3xl border-[#EAE5D9] bg-white shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-2xl font-bold text-foreground">{value}</p>
            )}
            {trend && trendValue && (
              <div className="flex items-center gap-1 text-xs">
                {trend === "up" ? (
                  <ArrowUpRight className="h-3 w-3 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-500" />
                )}
                <span className={trend === "up" ? "text-green-500" : "text-red-500"}>
                  {trendValue}
                </span>
              </div>
            )}
          </div>
          <div className="rounded-xl bg-ucd-sage/10 p-3">
            <Icon className="h-6 w-6 text-ucd-sage" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [totalOrders, setTotalOrders] = useState(0);
  const [revenueStats, setRevenueStats] = useState<RevenueStats | null>(null);
  const [customerCount, setCustomerCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState<OrderDTO[]>([]);

  useEffect(() => {
    // Simulate API calls
    const fetchData = async () => {
      setIsLoading(true);

      // Simulate delay for realistic loading state
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Mock API responses
      setTotalOrders(4568);
      setRevenueStats(mockRevenueStats);
      setCustomerCount(mockCustomerCount.totalCustomers);
      setRecentOrders(mockRecentOrders);

      setIsLoading(false);
    };

    fetchData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IE", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-IE", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome back! Here is today's campus operations data.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Orders"
          value={totalOrders.toLocaleString()}
          icon={ShoppingCart}
          trend="up"
          trendValue="12% from last month"
          isLoading={isLoading}
        />
        <StatCard
          title="Total Revenue"
          value={revenueStats ? formatCurrency(revenueStats.totalRevenue) : "€0"}
          icon={Euro}
          trend="up"
          trendValue="8.2% from last month"
          isLoading={isLoading}
        />
        <StatCard
          title="Active Users"
          value={customerCount.toLocaleString()}
          icon={Users}
          trend="up"
          trendValue="23 new this week"
          isLoading={isLoading}
        />
        <StatCard
          title="Total Menu Items"
          value={156}
          icon={UtensilsCrossed}
          isLoading={isLoading}
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Revenue Bar Chart */}
        <Card className="rounded-3xl border-[#EAE5D9] bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-ucd-sage" />
              Monthly Revenue Trend
            </CardTitle>
            <CardDescription>Revenue performance over the past months</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-[300px] items-center justify-center">
                <Skeleton className="h-[250px] w-full" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockRevenueStats.monthlyBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EAE5D9" />
                  <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
                  <YAxis stroke="#6B7280" fontSize={12} tickFormatter={(v) => `€${v}`} />
                  <Tooltip
                    formatter={(value: number) => [`€${value}`, "Revenue"]}
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #EAE5D9",
                      borderRadius: "12px",
                    }}
                  />
                  <Bar dataKey="revenue" fill="#8DA249" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Order Status Pie Chart */}
        <Card className="rounded-3xl border-[#EAE5D9] bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
            <CardDescription>Breakdown of order statuses today</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-[300px] items-center justify-center">
                <Skeleton className="h-[250px] w-full" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={orderStatusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {orderStatusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #EAE5D9",
                      borderRadius: "12px",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Table */}
      <Card className="rounded-3xl border-[#EAE5D9] bg-white shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest 5 orders across all canteens</CardDescription>
            </div>
            <Button variant="outline" className="rounded-xl border-ucd-sage text-ucd-sage hover:bg-ucd-sage/10">
              View All Orders
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-12 flex-1" />
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[80px]">Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Canteen</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Date/Time</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id} className="group">
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{order.canteenName}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(order.totalAmount)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "rounded-full font-medium",
                          statusConfig[order.status].className
                        )}
                      >
                        {statusConfig[order.status].label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
