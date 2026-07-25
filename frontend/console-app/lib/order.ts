export type OrderStatus =
    | "INITIALIZED"
    | "CONFIRMED"
    | "READY_FOR_PICKUP"
    | "COMPLETED"
    | "CANCELLED"
    | "FAILED"
    | "REFUNDED";

export interface OrderItemDTO {
    dishId: number;
    dishName: string;
    quantity: number;
    pricePerUnit: number;
    subtotal: number;
}

export interface OrderDTO {
    id: number;
    userId: number;
    userName: string;
    canteenId: number;
    canteenName: string;
    totalAmount: number;
    orderStatus: OrderStatus;
    items: OrderItemDTO[];
    orderDate: string;
}

export const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
    INITIALIZED: { label: "Initialized", className: "bg-gray-100 text-gray-700" },
    CONFIRMED: { label: "Preparing", className: "bg-blue-100 text-blue-700" },
    READY_FOR_PICKUP: { label: "Ready", className: "bg-orange-100 text-orange-700" },
    COMPLETED: { label: "Completed", className: "bg-green-100 text-green-700" },
    CANCELLED: { label: "Cancelled", className: "bg-red-100 text-red-700" },
    FAILED: { label: "Failed", className: "bg-red-200 text-red-800" },
    REFUNDED: { label: "Refunded", className: "bg-blue-100 text-blue-700" },
};