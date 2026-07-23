"use client";

import React, {useState, useEffect, useCallback} from "react";
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
import {useAuth} from "@/lib/auth-context";
import {CanteenAdminDTO} from "@/lib/canteen";
import {toast} from "sonner";
import apiClient from "@/lib/api/client";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import Link from "next/link";

// Types
interface OrderDTO {
  id: number;
  userName: string;
  canteenName: string;
  orderDate : string;
  totalAmount: number;
  orderStatus: OrderStatus;
}

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

interface CanteenStatsDTO{
  revenue:number;
  orderCount:number;
}

interface MonthlyRevenueDTO{
  month: string;
  revenue: number;
}

interface OrderStatusCountDTO{
  orderStatus: OrderStatus;
  orderCount: number;
}

type OrderStatus =
  | "INITIALIZED"
  | "CONFIRMED"
  | "READY_FOR_PICKUP"
  | "COMPLETED"
  | "CANCELLED"
  | "FAILED"
   | "REFUNDED";

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  INITIALIZED: { label: "Initialized", className: "bg-gray-100 text-gray-700" },
  CONFIRMED: { label: "Preparing", className: "bg-blue-100 text-blue-700" },
  READY_FOR_PICKUP: { label: "Ready", className: "bg-orange-100 text-orange-700" },
  COMPLETED: { label: "Completed", className: "bg-green-100 text-green-700" },
  CANCELLED: { label: "Cancelled", className: "bg-red-100 text-red-700" },
  FAILED: { label: "Failed", className: "bg-red-200 text-red-800" },
  REFUNDED: { label: "Refunded", className: "bg-purple-100 text-purple-700" },
};

const statusColors: Record<OrderStatus, string> = {
  INITIALIZED: "#6B7280",
  CONFIRMED: "#3B82F6",
  READY_FOR_PICKUP: "#F97316",
  COMPLETED: "#22C55E",
  CANCELLED: "#EF4444",
  FAILED: "#991B1B",
  REFUNDED: "#A855F7",
};

function getThisMonthRange(){
  const now = new Date();
  const startDate = new Date(now.getFullYear(),now.getMonth(),1).toISOString();
  const endDate = now.toISOString();
  return {startDate,endDate};
}

function getLast12MonthsRange() {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1).toISOString();
  const endDate = now.toISOString();
  return { startDate, endDate };
}


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
  //mycanteenId: for manager
  const {isAdmin,isManager, canteenId:myCanteenId} = useAuth();

  //selectedCanteenId: for admin
  const [selectedCanteenId,setSelectedCanteenId] = useState<number|null>(null);
  const effectiveCanteenId = isManager ?  myCanteenId : selectedCanteenId;

  const [canteenList,setCanteenList] = useState<CanteenAdminDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [customerCount, setCustomerCount] = useState<number|null>(null);
  const [totalMenuItems,setTotalMenuItems] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenueDTO[]>([]);
  const [statusDistribution,setStatusDistribution] = useState<OrderStatusCountDTO[]>([]);
  const [recentOrders, setRecentOrders] = useState<OrderDTO[]>([]);


  const fetchData = useCallback(async() =>{
    setIsLoading(true);
    try{
      const {startDate,endDate} = getThisMonthRange();
      const { startDate: monthlyStart, endDate: monthlyEnd } = getLast12MonthsRange();
      //admin's view:
      if(effectiveCanteenId===null){
        const [orderRes, revenueRes,customerRes,dishCountRes,monthlyRes,statusRes] = await Promise.all([
            apiClient.get('/api/v1/orders/all',{params : {page:0, size:5}}),
            apiClient.get('/api/v1/orders/admin/stats/revenue', { params : { startDate, endDate}}),
            apiClient.get('/api/v1/orders/admin/stats/customers/count'),
            apiClient.get('/api/v1/dishes/count'),
            apiClient.get('/api/v1/orders/stats/revenue/monthly',{ params: {startDate,endDate}}),
            apiClient.get('/api/v1/orders/stats/status-distribution',{params : {startDate, endDate}}),
        ]);
        setRecentOrders(orderRes.data.data.content);
        setTotalOrders(orderRes.data.data.totalElements);
        setTotalRevenue(revenueRes.data.data);
        setCustomerCount(customerRes.data.data);
        setTotalMenuItems(dishCountRes.data.data);
        setMonthlyRevenue(monthlyRes.data.data);
        setStatusDistribution(statusRes.data.data);
      }else{ // manager's view
        const [orderRes,statsRes,dishesRes,monthlyRes,statusRes] = await Promise.all([
            apiClient.get(`/api/v1/orders/canteens/${effectiveCanteenId}`,{params:{page:0,size:5}}),
            apiClient.get(`/api/v1/orders/canteens/${effectiveCanteenId}/stats`,{params:{startDate,endDate}}),
            apiClient.get(`/api/v1/canteens/${effectiveCanteenId}/dishes`),
            apiClient.get('/api/v1/orders/stats/revenue/monthly',{ params: { canteenId: effectiveCanteenId, startDate, endDate } }),
            apiClient.get('/api/v1/orders/stats/status-distribution',{ params: { canteenId: effectiveCanteenId, startDate, endDate } }),
        ]);
        setRecentOrders(orderRes.data.data.content);
        setTotalOrders(statsRes.data.data.orderCount);
        setTotalRevenue(statsRes.data.data.revenue);
        setCustomerCount(null);
        setTotalMenuItems(dishesRes.data.data.length);
        setMonthlyRevenue(monthlyRes.data.data);
        setStatusDistribution(statusRes.data.data);
      }
    }catch{
      toast.error('Failed to load dashboard data');
    }finally{
      setIsLoading(false);
    }
  },[effectiveCanteenId]);

  useEffect(()=>{
    fetchData()
  },[fetchData]);

  useEffect(()=>{
    if(isAdmin){
      apiClient.get('/api/v1/canteens/admin-view').then(res=>setCanteenList(res.data.data));
    }
  },[isAdmin])

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard Overview</h1>
          <p className="text-muted-foreground">Welcome back! Here is today&apos;s campus operations data.</p>
        </div>
        {isAdmin && (
            <Select value={selectedCanteenId?.toString() ?? "all"} onValueChange={(v) => setSelectedCanteenId(v === "all" ? null : parseInt(v))}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Canteens</SelectItem>
                {canteenList.map((c) => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
        )}
      </div>


      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Orders"
          value={totalOrders.toLocaleString()}
          icon={ShoppingCart}
          isLoading={isLoading}
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={Euro}
          isLoading={isLoading}
        />
        {customerCount !== null &&
          <StatCard
              title="Customers with Orders"
              value={customerCount.toLocaleString()}
              icon={Users}
              isLoading={isLoading}
          />
        }

        <StatCard
          title="Total Menu Items"
          value={totalMenuItems}
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
                <BarChart data={monthlyRevenue}>
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
                      data={statusDistribution.map((s) => ({
                        name: statusConfig[s.orderStatus].label,
                        value: s.orderCount,
                        color: statusColors[s.orderStatus],
                      }))}
                      cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                  >
                    {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={statusColors[entry.orderStatus]} />
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
              <CardDescription>
                {effectiveCanteenId === null ? "Latest 5 orders across all canteens" : "Latest 5 orders for this canteen"}
              </CardDescription>
            </div>
            <Button asChild variant="outline" className="rounded-xl border-ucd-sage text-ucd-sage hover:bg-ucd-sage/10">
              <Link href="/admin/orders">View All Orders</Link>
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
                    <TableCell>{order.userName}</TableCell>
                    <TableCell>{order.canteenName}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(order.totalAmount)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(order.orderDate)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "rounded-full font-medium",
                          statusConfig[order.orderStatus].className
                        )}
                      >
                        {statusConfig[order.orderStatus].label}
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
