"use client";

import React, { useState, useEffect } from "react";
import { Eye, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Types
type OrderStatus =
  | "INITIALIZED"
  | "CONFIRMED"
  | "READY_FOR_PICKUP"
  | "COMPLETED"
  | "CANCELLED"
  | "FAILED";

interface OrderItemDTO {
  dishId: number;
  dishName: string;
  quantity: number;
  price: number;
}

interface OrderDTO {
  id: number;
  customerId: number;
  customerName: string;
  customerEmail: string;
  canteenId: number;
  canteenName: string;
  totalAmount: number;
  status: OrderStatus;
  items: OrderItemDTO[];
  createdAt: string;
  updatedAt: string;
}

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  INITIALIZED: { label: "Initialized", className: "bg-gray-100 text-gray-700" },
  CONFIRMED: { label: "Preparing", className: "bg-blue-100 text-blue-700" },
  READY_FOR_PICKUP: { label: "Ready", className: "bg-orange-100 text-orange-700" },
  COMPLETED: { label: "Completed", className: "bg-green-100 text-green-700" },
  CANCELLED: { label: "Cancelled", className: "bg-red-100 text-red-700" },
  FAILED: { label: "Failed", className: "bg-red-200 text-red-800" },
};

const statusTabs: { value: string; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "INITIALIZED", label: "Initialized" },
  { value: "CONFIRMED", label: "Preparing" },
  { value: "READY_FOR_PICKUP", label: "Ready for Pickup" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "FAILED", label: "Failed" },
];

const statusTransitions: Record<OrderStatus, OrderStatus[]> = {
  INITIALIZED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["READY_FOR_PICKUP", "CANCELLED"],
  READY_FOR_PICKUP: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
  FAILED: [],
};

// Mock Data
const generateMockOrders = (): OrderDTO[] => [
  {
    id: 1847,
    customerId: 342,
    customerName: "Emma O'Brien",
    customerEmail: "emma.obrien@ucd.ie",
    canteenId: 1,
    canteenName: "Pi Restaurant",
    totalAmount: 12.50,
    status: "READY_FOR_PICKUP",
    items: [
      { dishId: 1, dishName: "Classic Beef Burger", quantity: 1, price: 9.50 },
      { dishId: 4, dishName: "Garlic Butter Fries", quantity: 1, price: 3.00 },
    ],
    createdAt: "2024-11-15T12:30:00",
    updatedAt: "2024-11-15T12:35:00",
  },
  {
    id: 1846,
    customerId: 156,
    customerName: "Liam Murphy",
    customerEmail: "liam.murphy@ucdconnect.ie",
    canteenId: 2,
    canteenName: "Global Grill",
    totalAmount: 18.75,
    status: "CONFIRMED",
    items: [
      { dishId: 3, dishName: "Chicken Caesar Wrap", quantity: 2, price: 17.50 },
      { dishId: 6, dishName: "Iced Latte", quantity: 1, price: 4.20 },
    ],
    createdAt: "2024-11-15T12:25:00",
    updatedAt: "2024-11-15T12:28:00",
  },
  {
    id: 1845,
    customerId: 89,
    customerName: "Saoirse Kelly",
    customerEmail: "saoirse.kelly@ucd.ie",
    canteenId: 3,
    canteenName: "The Coffee Dock",
    totalAmount: 6.40,
    status: "COMPLETED",
    items: [
      { dishId: 7, dishName: "Fresh Lemonade", quantity: 2, price: 7.00 },
    ],
    createdAt: "2024-11-15T12:20:00",
    updatedAt: "2024-11-15T12:40:00",
  },
  {
    id: 1844,
    customerId: 567,
    customerName: "Cian Daly",
    customerEmail: "cian.daly@ucdconnect.ie",
    canteenId: 1,
    canteenName: "Pi Restaurant",
    totalAmount: 24.99,
    status: "INITIALIZED",
    items: [
      { dishId: 2, dishName: "Margherita Pizza", quantity: 2, price: 22.00 },
      { dishId: 11, dishName: "Green Smoothie", quantity: 1, price: 5.00 },
    ],
    createdAt: "2024-11-15T12:15:00",
    updatedAt: "2024-11-15T12:15:00",
  },
  {
    id: 1843,
    customerId: 78,
    customerName: "Niamh Byrne",
    customerEmail: "niamh.byrne@ucd.ie",
    canteenId: 4,
    canteenName: "O'Reilly Hall Cafe",
    totalAmount: 9.30,
    status: "COMPLETED",
    items: [
      { dishId: 8, dishName: "Chocolate Brownie", quantity: 2, price: 6.50 },
      { dishId: 6, dishName: "Iced Latte", quantity: 1, price: 4.20 },
    ],
    createdAt: "2024-11-15T12:10:00",
    updatedAt: "2024-11-15T12:25:00",
  },
  {
    id: 1842,
    customerId: 234,
    customerName: "Fiona Walsh",
    customerEmail: "fiona.walsh@ucd.ie",
    canteenId: 2,
    canteenName: "Global Grill",
    totalAmount: 15.50,
    status: "CANCELLED",
    items: [
      { dishId: 10, dishName: "Vegetable Curry Bowl", quantity: 1, price: 10.25 },
      { dishId: 12, dishName: "Coleslaw", quantity: 1, price: 2.95 },
    ],
    createdAt: "2024-11-15T12:05:00",
    updatedAt: "2024-11-15T12:12:00",
  },
  {
    id: 1841,
    customerId: 456,
    customerName: "Sean O'Sullivan",
    customerEmail: "sean.osullivan@ucdconnect.ie",
    canteenId: 1,
    canteenName: "Pi Restaurant",
    totalAmount: 32.50,
    status: "CONFIRMED",
    items: [
      { dishId: 1, dishName: "Classic Beef Burger", quantity: 3, price: 28.50 },
      { dishId: 6, dishName: "Iced Latte", quantity: 1, price: 4.20 },
    ],
    createdAt: "2024-11-15T12:00:00",
    updatedAt: "2024-11-15T12:03:00",
  },
  {
    id: 1840,
    customerId: 789,
    customerName: "Aoife McCarthy",
    customerEmail: "aoife.mccarthy@ucd.ie",
    canteenId: 3,
    canteenName: "The Coffee Dock",
    totalAmount: 8.50,
    status: "FAILED",
    items: [
      { dishId: 7, dishName: "Fresh Lemonade", quantity: 1, price: 3.50 },
      { dishId: 9, dishName: "Irish Apple Pie", quantity: 1, price: 5.50 },
    ],
    createdAt: "2024-11-15T11:55:00",
    updatedAt: "2024-11-15T11:57:00",
  },
];

export default function OrderManagementPage() {
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedOrder, setSelectedOrder] = useState<OrderDTO | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const pageSize = 10;

  useEffect(() => {
    fetchOrders();
  }, [activeStatus, currentPage, sortDirection]);

  const fetchOrders = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const allOrders = generateMockOrders();
    let filtered = allOrders;

    if (activeStatus !== "ALL") {
      filtered = allOrders.filter((o) => o.status === activeStatus);
    }

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortDirection === "desc" ? dateB - dateA : dateA - dateB;
    });

    setOrders(filtered);
    setTotalElements(filtered.length);
    setIsLoading(false);
  };

  const filteredOrders = orders.filter((order) => {
    if (activeStatus === "ALL") return true;
    return order.status === activeStatus;
  });

  const totalPages = Math.ceil(totalElements / pageSize);
  const paginatedOrders = filteredOrders.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

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
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: newStatus, updatedAt: new Date().toISOString() } : o
      )
    );
    toast.success(`Order #${orderId} status updated to ${statusConfig[newStatus].label}`);
  };

  const handleViewDetail = (order: OrderDTO) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Order Management</h1>
        <p className="text-muted-foreground">View and manage all campus orders</p>
      </div>

      {/* Status Filter Tabs */}
      <Card className="rounded-3xl border-[#EAE5D9] bg-white shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {statusTabs.map((tab) => (
              <Button
                key={tab.value}
                variant={activeStatus === tab.value ? "default" : "outline"}
                onClick={() => {
                  setActiveStatus(tab.value);
                  setCurrentPage(0);
                }}
                className={cn(
                  "rounded-xl",
                  activeStatus === tab.value
                    ? "bg-ucd-sage text-white hover:bg-ucd-sage/90"
                    : "border-[#EAE5D9] hover:border-ucd-sage hover:text-ucd-sage"
                )}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="rounded-3xl border-[#EAE5D9] bg-white shadow-sm">
        <CardHeader>
          <CardTitle>Orders</CardTitle>
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
          ) : paginatedOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <p className="text-muted-foreground">No orders found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[100px]">ORDER ID</TableHead>
                  <TableHead>CUSTOMER</TableHead>
                  <TableHead>CANTEEN</TableHead>
                  <TableHead className="text-right">AMOUNT</TableHead>
                  <TableHead>
                    <button
                      onClick={() => setSortDirection(sortDirection === "desc" ? "asc" : "desc")}
                      className="flex items-center gap-1 hover:text-foreground"
                    >
                      DATE/TIME
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead>STATUS</TableHead>
                  <TableHead className="text-right">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrders.map((order) => (
                  <TableRow key={order.id} className="group">
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>{order.canteenName}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(order.totalAmount)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        onValueChange={(value: OrderStatus) =>
                          handleStatusChange(order.id, value)
                        }
                      >
                        <SelectTrigger className="w-[140px] h-8 rounded-full border-0 bg-transparent p-0 focus:ring-0">
                          <Badge
                            variant="secondary"
                            className={cn(
                              "rounded-full font-medium cursor-pointer hover:opacity-80",
                              statusConfig[order.status].className
                            )}
                          >
                            {statusConfig[order.status].label}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {statusTransitions[order.status].map((status) => (
                            <SelectItem key={status} value={status}>
                              {statusConfig[status].label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetail(order)}
                        className="rounded-lg text-ucd-sage hover:bg-ucd-sage/10"
                      >
                        <Eye className="mr-1 h-4 w-4" />
                        Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {currentPage * pageSize + 1} to{" "}
              {Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements} orders
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="rounded-xl"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="flex gap-1">
                {[...Array(Math.min(5, totalPages))].map((_, i) => (
                  <Button
                    key={i}
                    variant={currentPage === i ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(i)}
                    className={cn(
                      "w-8 h-8 rounded-lg",
                      currentPage === i && "bg-ucd-sage hover:bg-ucd-sage/90"
                    )}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage >= totalPages - 1}
                className="rounded-xl"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Order #{selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              Placed on {selectedOrder && formatDate(selectedOrder.createdAt)}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              {/* Customer Info */}
              <div className="rounded-xl bg-ucd-oatmeal p-4">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Customer</h4>
                <p className="font-medium">{selectedOrder.customerName}</p>
                <p className="text-sm text-muted-foreground">{selectedOrder.customerEmail}</p>
              </div>

              {/* Order Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <Badge
                  className={cn(
                    "rounded-full",
                    statusConfig[selectedOrder.status].className
                  )}
                >
                  {statusConfig[selectedOrder.status].label}
                </Badge>
              </div>

              {/* Canteen */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Canteen</span>
                <span className="text-sm">{selectedOrder.canteenName}</span>
              </div>

              <Separator />

              {/* Order Items */}
              <div>
                <h4 className="text-sm font-medium mb-3">Order Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border border-[#EAE5D9] p-3"
                    >
                      <div>
                        <p className="font-medium">{item.dishName}</p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity} x {formatCurrency(item.price)}
                        </p>
                      </div>
                      <p className="font-medium text-ucd-coral">
                        {formatCurrency(item.quantity * item.price)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Total */}
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold">Total</span>
                <span className="text-lg font-bold text-ucd-coral">
                  {formatCurrency(selectedOrder.totalAmount)}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
