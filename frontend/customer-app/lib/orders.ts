// Maps strictly to the order API contracts:
//   GET   /api/v1/orders/my-orders?page={page}&size={size}  -> PageOrderDTO
//   PATCH /api/v1/orders/{orderId}/status?newStatus={status} -> updateOrderStatus

export type OrderStatus =
  | 'INITIALIZED'
  | 'CONFIRMED'
  | 'READY_FOR_PICKUP'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'FAILED'
  | 'REFUNDED'

export type PaymentStatus =
    |'PENDING'
    | 'COMPLETED'
    | 'FAILED'
    | 'REFUND_PENDING'
    | 'REFUNDED'

export interface OrderItemDTO {
  id: number
  dishId: number
  dishName: string
  dishImageUrl?: string
  quantity: number
  pricePerUnit: number
  subtotal: number
}

export interface OrderDTO {
  id: number
  userId: number
  userName: string
  canteenId: number
  canteenName: string
  orderDate: string // "2024-10-24 12:45:00"
  totalAmount: number
  pickupCode?: string
  orderStatus: OrderStatus
  paymentStatus: PaymentStatus
  hasReviewed?: boolean
  items: OrderItemDTO[]
}

export interface PageOrderDTO {
  content: OrderDTO[]
  totalElements: number
  totalPages: number
  number: number
  size: number
  first: boolean
  last: boolean
}

