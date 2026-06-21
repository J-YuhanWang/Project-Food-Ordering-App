"use client";

import React, { useState, useEffect } from "react";
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

// Types
type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";

interface PaymentDTO {
  id: number;
  orderId: number;
  customerId: number;
  customerName: string;
  customerEmail: string;
  amount: number;
  status: PaymentStatus;
  transactionId: string;
  createdAt: string;
  updatedAt: string;
}

const statusConfig: Record<PaymentStatus, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-yellow-100 text-yellow-700" },
  COMPLETED: { label: "Completed", className: "bg-green-100 text-green-700" },
  FAILED: { label: "Failed", className: "bg-red-100 text-red-700" },
  REFUNDED: { label: "Refunded", className: "bg-blue-100 text-blue-700" },
};

const statusTabs: { value: string; label: string; icon: React.ElementType }[] = [
  { value: "ALL", label: "All", icon: CreditCard },
  { value: "COMPLETED", label: "Completed", icon: CheckCircle },
  { value: "PENDING", label: "Pending", icon: AlertCircle },
  { value: "FAILED", label: "Failed", icon: XCircle },
  { value: "REFUNDED", label: "Refunded", icon: RotateCcw },
];

// Mock Data
const mockPayments: PaymentDTO[] = [
  {
    id: 5001,
    orderId: 1847,
    customerId: 342,
    customerName: "Emma O'Brien",
    customerEmail: "emma.obrien@ucd.ie",
    amount: 12.50,
    status: "COMPLETED",
    transactionId: "TXN_7F8A9B2C3D4E5F",
    createdAt: "2024-11-15T12:30:15",
    updatedAt: "2024-11-15T12:30:20",
  },
  {
    id: 5002,
    orderId: 1846,
    customerId: 156,
    customerName: "Liam Murphy",
    customerEmail: "liam.murphy@ucdconnect.ie",
    amount: 18.75,
    status: "COMPLETED",
    transactionId: "TXN_1A2B3C4D5E6F7G",
    createdAt: "2024-11-15T12:25:10",
    updatedAt: "2024-11-15T12:25:15",
  },
  {
    id: 5003,
    orderId: 1845,
    customerId: 89,
    customerName: "Saoirse Kelly",
    customerEmail: "saoirse.kelly@ucd.ie",
    amount: 6.40,
    status: "COMPLETED",
    transactionId: "TXN_8H9I0J1K2L3M4N",
    createdAt: "2024-11-15T12:20:05",
    updatedAt: "2024-11-15T12:20:10",
  },
  {
    id: 5004,
    orderId: 1844,
    customerId: 567,
    customerName: "Cian Daly",
    customerEmail: "cian.daly@ucdconnect.ie",
    amount: 24.99,
    status: "PENDING",
    transactionId: "TXN_5O6P7Q8R9S0T1U",
    createdAt: "2024-11-15T12:15:00",
    updatedAt: "2024-11-15T12:15:00",
  },
  {
    id: 5005,
    orderId: 1843,
    customerId: 78,
    customerName: "Niamh Byrne",
    customerEmail: "niamh.byrne@ucd.ie",
    amount: 9.30,
    status: "COMPLETED",
    transactionId: "TXN_2V3W4X5Y6Z7A8B",
    createdAt: "2024-11-15T12:10:30",
    updatedAt: "2024-11-15T12:10:35",
  },
  {
    id: 5006,
    orderId: 1842,
    customerId: 234,
    customerName: "Fiona Walsh",
    customerEmail: "fiona.walsh@ucd.ie",
    amount: 15.50,
    status: "REFUNDED",
    transactionId: "TXN_9C0D1E2F3G4H5I",
    createdAt: "2024-11-15T12:05:00",
    updatedAt: "2024-11-15T12:15:00",
  },
  {
    id: 5007,
    orderId: 1841,
    customerId: 456,
    customerName: "Sean O'Sullivan",
    customerEmail: "sean.osullivan@ucdconnect.ie",
    amount: 32.50,
    status: "COMPLETED",
    transactionId: "TXN_6J7K8L9M0N1O2P",
    createdAt: "2024-11-15T12:00:15",
    updatedAt: "2024-11-15T12:00:20",
  },
  {
    id: 5008,
    orderId: 1840,
    customerId: 789,
    customerName: "Aoife McCarthy",
    customerEmail: "aoife.mccarthy@ucd.ie",
    amount: 8.50,
    status: "FAILED",
    transactionId: "TXN_3Q4R5S6T7U8V9W",
    createdAt: "2024-11-15T11:55:00",
    updatedAt: "2024-11-15T11:57:30",
  },
  {
    id: 5009,
    orderId: 1839,
    customerId: 111,
    customerName: "Declan Fitzpatrick",
    customerEmail: "declan.fitzpatrick@ucd.ie",
    amount: 22.25,
    status: "COMPLETED",
    transactionId: "TXN_0X1Y2Z3A4B5C6D",
    createdAt: "2024-11-15T11:50:00",
    updatedAt: "2024-11-15T11:50:10",
  },
  {
    id: 5010,
    orderId: 1838,
    customerId: 222,
    customerName: "Grainne Quinlivan",
    customerEmail: "grainne.quinlivan@ucdconnect.ie",
    amount: 19.80,
    status: "PENDING",
    transactionId: "TXN_7E8F9G0H1I2J3K",
    createdAt: "2024-11-15T11:45:00",
    updatedAt: "2024-11-15T11:45:00",
  },
  {
    id: 5011,
    orderId: 1837,
    customerId: 333,
    customerName: "Eoin McGuinness",
    customerEmail: "eoin.mcguinness@ucd.ie",
    amount: 45.00,
    status: "REFUNDED",
    transactionId: "TXN_4L5M6N7O8P9Q0R",
    createdAt: "2024-11-15T11:40:00",
    updatedAt: "2024-11-15T11:55:00",
  },
  {
    id: 5012,
    orderId: 1836,
    customerId: 444,
    customerName: "Sorcha O'Donnell",
    customerEmail: "sorcha.odonnell@ucdconnect.ie",
    amount: 11.25,
    status: "FAILED",
    transactionId: "TXN_1S2T3U4V5W6X7Y",
    createdAt: "2024-11-15T11:35:00",
    updatedAt: "2024-11-15T11:36:00",
  },
];

export default function PaymentsManagementPage() {
  const [payments, setPayments] = useState<PaymentDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setPayments(mockPayments);
    setIsLoading(false);
  };

  // Calculate metrics
  const totalRevenue = payments
    .filter((p) => p.status === "COMPLETED")
    .reduce((sum, p) => sum + p.amount, 0);

  const successfulPayments = payments.filter((p) => p.status === "COMPLETED").length;
  const failedPayments = payments.filter((p) => p.status === "FAILED").length;

  const filteredPayments = payments.filter((payment) => {
    if (activeStatus === "ALL") return true;
    return payment.status === activeStatus;
  });

  const totalPages = Math.ceil(filteredPayments.length / pageSize);
  const paginatedPayments = filteredPayments.slice(
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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncateTransactionId = (id: string) => {
    return `${id.substring(0, 12)}...`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Payments Management</h1>
        <p className="text-muted-foreground">Monitor and manage payment transactions</p>
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
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(totalRevenue)}</p>
                )}
                <div className="flex items-center gap-1 text-xs">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-green-500">+12.5% from last week</span>
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
                  <p className="text-2xl font-bold text-foreground">{successfulPayments}</p>
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
                  <p className="text-2xl font-bold text-foreground">{failedPayments}</p>
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
          ) : paginatedPayments.length === 0 ? (
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
                {paginatedPayments.map((payment) => (
                  <TableRow key={payment.id} className="group">
                    <TableCell className="font-medium">#{payment.id}</TableCell>
                    <TableCell>
                      <span className="text-ucd-sage font-medium">#{payment.orderId}</span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{payment.customerName}</p>
                        <p className="text-xs text-muted-foreground">{payment.customerEmail}</p>
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
                          statusConfig[payment.status].className
                        )}
                      >
                        {statusConfig[payment.status].label}
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
