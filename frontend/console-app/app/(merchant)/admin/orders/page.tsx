"use client";

import React, {useState, useEffect, useCallback} from "react";
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
import {OrderDTO, OrderStatus, statusConfig} from "@/lib/order";
import {useAuth} from "@/lib/auth-context";
import apiClient from "@/lib/api/client";
import {CanteenAdminDTO} from "@/lib/canteen";

// Types

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

const statusTabs: { value: string; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "INITIALIZED", label: "Initialized" },
  { value: "CONFIRMED", label: "Preparing" },
  { value: "READY_FOR_PICKUP", label: "Ready for Pickup" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "FAILED", label: "Failed" },
  { value: "REFUNDED", label: "Refunded" },

];

const statusTransitions: Record<OrderStatus, OrderStatus[]> = {
  INITIALIZED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["READY_FOR_PICKUP", "CANCELLED"],
  READY_FOR_PICKUP: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
  FAILED: [],
  REFUNDED:[],
};


export default function OrderManagementPage() {
  const { isAdmin, isManager, canteenId: myCanteenId } = useAuth();
  const [selectedCanteenId, setSelectedCanteenId] = useState<number | null>(null);
  const effectiveCanteenId = isManager ? myCanteenId : selectedCanteenId;

  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [selectedOrder, setSelectedOrder] = useState<OrderDTO | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [canteenList, setCanteenList] = useState<CanteenAdminDTO[]>([])

  const pageSize = 10;


  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try{
      const url = effectiveCanteenId === null ? '/api/v1/orders/all' : `/api/v1/orders/canteens/${effectiveCanteenId}`;
      const statusParam = effectiveCanteenId === null ? 'orderStatus' : "status";
      const res = await apiClient.get(url,{
        params:{
          [statusParam]: activeStatus === 'ALL' ? undefined : activeStatus,
          page: currentPage,
          size: pageSize,
        }
      })
      setOrders(res.data.data.content);
      setTotalElements(res.data.data.totalElements);
      setTotalPages(res.data.data.totalPages);
    }catch{
      toast.error("Failed to load orders");
    }finally{
      setIsLoading(false);
    }

  },[activeStatus,currentPage]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(()=>{
    if(isAdmin){
      apiClient.get('/api/v1/canteens/admin-view').then(res=>setCanteenList(res.data.data));
    }
  },[isAdmin]);

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
    try{
      await apiClient.put(`/api/v1/orders/${orderId}/status`,null, { params: { status: newStatus } })
      toast.success(`Order #${orderId} status updated to ${statusConfig[newStatus].label}`);
      await fetchOrders();
    }catch{
      toast.error('Failed to update order status')
    }
  };

  const handleViewDetail = async (order: OrderDTO) => {
    try{
      const res = await apiClient.get(`/api/v1/orders/${order.id}`);
      setSelectedOrder(res.data.data);
      setIsDetailOpen(true)
    }catch{
      toast.error("Failed to load order details")
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Order Management</h1>
          <p className="text-muted-foreground">View and manage all campus orders</p>
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

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2 mt-2">
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
          ) : orders.length === 0 ? (
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
                  <TableHead>DATE/TIME</TableHead>
                  <TableHead>STATUS</TableHead>
                  <TableHead className="text-right">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} className="group">
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.userName}</p>
                      </div>
                    </TableCell>
                    <TableCell>{order.canteenName}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(order.totalAmount)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(order.orderDate)}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={order.orderStatus}
                        onValueChange={(value: OrderStatus) =>
                          handleStatusChange(order.id, value)
                        }
                      >
                        <SelectTrigger className="w-[140px] h-8 rounded-full border-0 bg-transparent p-0 focus:ring-0">
                          <Badge
                            variant="secondary"
                            className={cn(
                              "rounded-full font-medium cursor-pointer hover:opacity-80",
                              statusConfig[order.orderStatus].className
                            )}
                          >
                            {statusConfig[order.orderStatus].label}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {statusTransitions[order.orderStatus].map((status) => (
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
              Placed on {selectedOrder && formatDate(selectedOrder.orderDate)}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              {/* Customer Info */}
              <div className="rounded-xl bg-ucd-oatmeal p-4">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Customer</h4>
                <p className="font-medium">{selectedOrder.userName}</p>
              </div>

              {/* Order Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <Badge
                  className={cn(
                    "rounded-full",
                    statusConfig[selectedOrder.orderStatus].className
                  )}
                >
                  {statusConfig[selectedOrder.orderStatus].label}
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
                          Qty: {item.quantity} x {formatCurrency(item.pricePerUnit)}
                        </p>
                      </div>
                      <p className="font-medium text-ucd-coral">
                        {formatCurrency(item.quantity * item.pricePerUnit)}
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
