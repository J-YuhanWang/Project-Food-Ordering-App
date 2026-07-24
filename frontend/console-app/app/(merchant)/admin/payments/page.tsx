"use client";

import React, {useState, useEffect, useCallback} from "react";
import {
  CreditCard,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  RotateCcw,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {useAuth} from "@/lib/auth-context";
import {CanteenAdminDTO} from "@/lib/canteen";
import apiClient from "@/lib/api/client";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

// Types
type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED" | "REFUND_PENDING";

interface PaymentDTO {
  id: number;
  userId: number;
  userName: string;
  orderId: number;
  canteenName: string;
  amount: number;
  paymentStatus: PaymentStatus;
  transactionId: string|null;
  createdAt: string;
  paymentDate: string;
}

interface PaymentStatsDTO {
  totalRevenue: number;
  successCount:number;
  failedCount:number;
}

const statusConfig: Record<PaymentStatus, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-yellow-100 text-yellow-700" },
  COMPLETED: { label: "Completed", className: "bg-green-100 text-green-700" },
  FAILED: { label: "Failed", className: "bg-red-100 text-red-700" },
  REFUND_PENDING: { label: "Refund Pending", className: "bg-orange-100 text-orange-700" },
  REFUNDED: { label: "Refunded", className: "bg-blue-100 text-blue-700" },
};

const statusTabs: { value: string; label: string; icon: React.ElementType }[] = [
  { value: "ALL", label: "All", icon: CreditCard },
  { value: "COMPLETED", label: "Completed", icon: CheckCircle },
  { value: "PENDING", label: "Pending", icon: AlertCircle },
  { value: "FAILED", label: "Failed", icon: XCircle },
  { value: "REFUNDED", label: "Refunded", icon: RotateCcw },
];


export default function PaymentsManagementPage() {
  const {isAdmin,isManager, canteenId:myCanteenId} = useAuth();
  const [selectedCanteenId,setSelectedCanteenId] = useState<number|null>(null);
  const effectiveCanteenId = isManager? myCanteenId:selectedCanteenId;
  const [canteenList,setCanteenList] = useState<CanteenAdminDTO[]>([]);
  const [stats,setStats] = useState<PaymentStatsDTO|null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  const [payments, setPayments] = useState<PaymentDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages,setTotalPages] = useState(0);
  const pageSize = 10;

  const fetchPayments = useCallback(async () => {
    setIsLoading(true);
    try{
      const url = effectiveCanteenId===null
      ? '/api/v1/payments/all'
          :`/api/v1/payments/canteen/${effectiveCanteenId}`
      const res = await apiClient.get(url, {params: {page: currentPage, size: pageSize}});
      setPayments(res.data.data.content)
      setTotalPages(res.data.data.totalPages)
    }catch {
      toast.error('Failed to load payments');
    } finally {
      setIsLoading(false);
    }
  },[effectiveCanteenId,currentPage]);


  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  useEffect(()=>{
    if(isAdmin){
      apiClient.get('/api/v1/canteens/admin-view').then(res=>setCanteenList(res.data.data));
    }
  },[isAdmin])

  const fetchStats = useCallback(async()=>{
    setIsStatsLoading(true);
    try{
      const res = await apiClient.get("/api/v1/payments/stats",{
        params:{canteenId:effectiveCanteenId ?? undefined},
      })
      setStats(res.data.data)
    }catch{
      toast.error("Failed to load payment stats");
    }finally {
      setIsStatsLoading(false);
    }
  },[effectiveCanteenId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const filteredPayments = payments.filter((payment) => {
    return activeStatus === "ALL"|| payment.paymentStatus === activeStatus;
  });

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

  const truncateTransactionId = (id: string | null) => {
    if(!id) return "-";
    return `${id.substring(0, 12)}...`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payments Management</h1>
          <p className="text-muted-foreground">Monitor and manage payment transactions</p>
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
      {/* Summary Metrics */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Total Revenue */}
        <Card className="rounded-3xl border-[#EAE5D9] bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(stats?.totalRevenue ?? 0)}</p>
                )}
                <div className="flex items-center gap-1 text-xs">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-green-500">All-time completed transactions</span>
                </div>
              </div>
              <div className="rounded-xl bg-green-100 p-3">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Successful Payments */}
        <Card className="rounded-3xl border-[#EAE5D9] bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Successful Payments</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">{stats?.successCount ?? 0}</p>
                )}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  Completed transactions
                </div>
              </div>
              <div className="rounded-xl bg-green-100 p-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Failed Payments */}
        <Card className="rounded-3xl border-[#EAE5D9] bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Failed Payments</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">{stats?.failedCount ?? 0}</p>
                )}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <XCircle className="h-3 w-3 text-red-500" />
                  Requires attention
                </div>
              </div>
              <div className="rounded-xl bg-red-100 p-3">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
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
                  "gap-2 rounded-xl",
                  activeStatus === tab.value
                    ? "bg-ucd-sage text-white hover:bg-ucd-sage/90"
                    : "border-[#EAE5D9] hover:border-ucd-sage hover:text-ucd-sage"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card className="rounded-3xl border-[#EAE5D9] bg-white shadow-sm">
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>
            Showing {filteredPayments.length} payment records
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-12 flex-1" />
                </div>
              ))}
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <CreditCard className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No payments found</h3>
              <p className="text-muted-foreground">Try adjusting your filter criteria</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[100px]">PAYMENT ID</TableHead>
                  <TableHead>ORDER ID</TableHead>
                  <TableHead>CUSTOMER</TableHead>
                  <TableHead className="text-right">AMOUNT</TableHead>
                  <TableHead>STATUS</TableHead>
                  <TableHead>TRANSACTION ID</TableHead>
                  <TableHead>DATE/TIME</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id} className="group">
                    <TableCell className="font-medium">#{payment.id}</TableCell>
                    <TableCell>
                      <span className="text-ucd-sage font-medium">#{payment.orderId}</span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{payment.userName}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium text-ucd-coral">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "rounded-full font-medium",
                          statusConfig[payment.paymentStatus].className
                        )}
                      >
                        {statusConfig[payment.paymentStatus].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 cursor-help">
                              <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                                {truncateTransactionId(payment.transactionId)}
                              </code>
                              <Info className="h-3 w-3 text-muted-foreground" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="font-mono text-xs">{payment.transactionId}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(payment.createdAt)}
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
              {Math.min((currentPage + 1) * pageSize, filteredPayments.length)} of{" "}
              {filteredPayments.length} payments
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
    </div>
  );
}
