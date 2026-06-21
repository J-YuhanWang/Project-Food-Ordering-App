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

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED'

export interface OrderItemDTO {
  id: number
  dishId: number
  dishName: string
  dishImageUrl: string
  quantity: number
  pricePerUnit: number
  subtotal: number
  // Present only once the dish has been reviewed (order.hasReviewed === true).
  reviewRating?: number
  reviewComment?: string
}

export interface OrderDTO {
  id: number
  canteenName: string
  orderDate: string // "2024-10-24 12:45:00"
  totalAmount: number
  pickupCode: string
  orderStatus: OrderStatus
  paymentStatus: PaymentStatus
  hasReviewed: boolean
  items: OrderItemDTO[]
}

export interface PageOrderDTO {
  content: OrderDTO[]
  totalElements: number
  totalPages: number
  last: boolean
}

// Full mock dataset, ordered newest-first, shaped like the API content array.
const allOrders: OrderDTO[] = [
  {
    id: 4821,
    canteenName: 'Pi Restaurant',
    orderDate: '2024-10-24 12:45:00',
    totalAmount: 28.5,
    pickupCode: 'AB3F',
    orderStatus: 'READY_FOR_PICKUP',
    paymentStatus: 'PAID',
    hasReviewed: false,
    items: [
      {
        id: 1,
        dishId: 101,
        dishName: 'Margherita Pizza',
        dishImageUrl: '/dishes/margherita-pizza.png',
        quantity: 2,
        pricePerUnit: 9.5,
        subtotal: 19.0,
      },
      {
        id: 2,
        dishId: 104,
        dishName: 'Garlic Bread',
        dishImageUrl: '/dishes/garlic-bread.png',
        quantity: 1,
        pricePerUnit: 4.5,
        subtotal: 4.5,
      },
      {
        id: 3,
        dishId: 106,
        dishName: 'Italian Soda',
        dishImageUrl: '/dishes/italian-soda.png',
        quantity: 1,
        pricePerUnit: 3.0,
        subtotal: 3.0,
      },
    ],
  },
  {
    id: 4815,
    canteenName: 'Global Grill',
    orderDate: '2024-10-23 18:10:00',
    totalAmount: 13.0,
    pickupCode: 'K9Q2',
    orderStatus: 'CONFIRMED',
    paymentStatus: 'PAID',
    hasReviewed: false,
    items: [
      {
        id: 4,
        dishId: 201,
        dishName: 'Classic Cheeseburger',
        dishImageUrl: '/canteens/global-grill.png',
        quantity: 1,
        pricePerUnit: 8.5,
        subtotal: 8.5,
      },
      {
        id: 5,
        dishId: 202,
        dishName: 'Loaded Fries',
        dishImageUrl: '/dishes/garlic-bread.png',
        quantity: 1,
        pricePerUnit: 4.5,
        subtotal: 4.5,
      },
    ],
  },
  {
    id: 4790,
    canteenName: 'Pi Restaurant',
    orderDate: '2024-10-20 13:05:00',
    totalAmount: 24.5,
    pickupCode: 'TT71',
    orderStatus: 'INITIALIZED',
    paymentStatus: 'PENDING',
    hasReviewed: false,
    items: [
      {
        id: 6,
        dishId: 102,
        dishName: 'Spaghetti Carbonara',
        dishImageUrl: '/dishes/carbonara.png',
        quantity: 1,
        pricePerUnit: 11.0,
        subtotal: 11.0,
      },
      {
        id: 7,
        dishId: 103,
        dishName: 'Caesar Salad',
        dishImageUrl: '/dishes/caesar-salad.png',
        quantity: 1,
        pricePerUnit: 7.5,
        subtotal: 7.5,
      },
      {
        id: 8,
        dishId: 107,
        dishName: 'Tiramisu',
        dishImageUrl: '/dishes/tiramisu.png',
        quantity: 1,
        pricePerUnit: 5.5,
        subtotal: 5.5,
      },
    ],
  },
  {
    id: 4752,
    canteenName: 'The Green Bowl',
    orderDate: '2024-10-18 12:30:00',
    totalAmount: 22.0,
    pickupCode: 'M4XP',
    orderStatus: 'COMPLETED',
    paymentStatus: 'PAID',
    hasReviewed: false,
    items: [
      {
        id: 9,
        dishId: 301,
        dishName: 'Harvest Grain Bowl',
        dishImageUrl: '/canteens/green-bowl.png',
        quantity: 2,
        pricePerUnit: 8.0,
        subtotal: 16.0,
      },
      {
        id: 10,
        dishId: 302,
        dishName: 'Fresh Pressed Juice',
        dishImageUrl: '/dishes/italian-soda.png',
        quantity: 2,
        pricePerUnit: 3.0,
        subtotal: 6.0,
      },
    ],
  },
  {
    id: 4710,
    canteenName: 'Pi Restaurant',
    orderDate: '2024-10-15 19:20:00',
    totalAmount: 19.0,
    pickupCode: 'QW88',
    orderStatus: 'COMPLETED',
    paymentStatus: 'PAID',
    hasReviewed: true,
    items: [
      {
        id: 11,
        dishId: 108,
        dishName: 'Pepperoni Pizza',
        dishImageUrl: '/dishes/pepperoni-pizza.png',
        quantity: 1,
        pricePerUnit: 11.0,
        subtotal: 11.0,
        reviewRating: 5,
        reviewComment:
          'Crispy base, generous pepperoni and perfectly melted cheese. Easily the best pizza on campus.',
      },
      {
        id: 12,
        dishId: 104,
        dishName: 'Garlic Bread',
        dishImageUrl: '/dishes/garlic-bread.png',
        quantity: 1,
        pricePerUnit: 4.5,
        subtotal: 4.5,
        reviewRating: 4,
        reviewComment:
          'Warm and garlicky, though I would have loved a touch more butter.',
      },
      {
        id: 13,
        dishId: 109,
        dishName: 'Panna Cotta',
        dishImageUrl: '/dishes/panna-cotta.png',
        quantity: 1,
        pricePerUnit: 3.5,
        subtotal: 3.5,
        reviewRating: 5,
        reviewComment:
          'Silky smooth with a lovely berry coulis. The perfect way to finish lunch.',
      },
    ],
  },
  {
    id: 4688,
    canteenName: 'Bean Scene Cafe',
    orderDate: '2024-10-12 09:15:00',
    totalAmount: 9.5,
    pickupCode: 'ZP02',
    orderStatus: 'CANCELLED',
    paymentStatus: 'FAILED',
    hasReviewed: false,
    items: [
      {
        id: 14,
        dishId: 401,
        dishName: 'Flat White',
        dishImageUrl: '/canteens/bean-scene-cafe.png',
        quantity: 2,
        pricePerUnit: 3.25,
        subtotal: 6.5,
      },
      {
        id: 15,
        dishId: 402,
        dishName: 'Butter Croissant',
        dishImageUrl: '/dishes/garlic-bread.png',
        quantity: 1,
        pricePerUnit: 3.0,
        subtotal: 3.0,
      },
    ],
  },
  {
    id: 4650,
    canteenName: 'Noodle House',
    orderDate: '2024-10-08 17:40:00',
    totalAmount: 12.5,
    pickupCode: 'R5LN',
    orderStatus: 'FAILED',
    paymentStatus: 'FAILED',
    hasReviewed: false,
    items: [
      {
        id: 16,
        dishId: 501,
        dishName: 'Tonkotsu Ramen',
        dishImageUrl: '/canteens/noodle-house.png',
        quantity: 1,
        pricePerUnit: 12.5,
        subtotal: 12.5,
      },
    ],
  },
  {
    id: 4602,
    canteenName: 'The Green Bowl',
    orderDate: '2024-10-03 12:55:00',
    totalAmount: 16.0,
    pickupCode: 'GB44',
    orderStatus: 'COMPLETED',
    paymentStatus: 'PAID',
    hasReviewed: true,
    items: [
      {
        id: 17,
        dishId: 303,
        dishName: 'Mediterranean Bowl',
        dishImageUrl: '/canteens/green-bowl.png',
        quantity: 1,
        pricePerUnit: 8.5,
        subtotal: 8.5,
        reviewRating: 5,
        reviewComment:
          'Packed with fresh falafel, hummus and crunchy veg. Genuinely filling and healthy.',
      },
      {
        id: 18,
        dishId: 103,
        dishName: 'Caesar Salad',
        dishImageUrl: '/dishes/caesar-salad.png',
        quantity: 1,
        pricePerUnit: 7.5,
        subtotal: 7.5,
        reviewRating: 4,
        reviewComment:
          'Crisp romaine and a tangy dressing. A bit more parmesan would make it perfect.',
      },
    ],
  },
]

// Stands in for GET /api/v1/orders/{orderId}.
export function getOrderById(orderId: number): OrderDTO | undefined {
  return allOrders.find((o) => o.id === orderId)
}

// Stands in for GET /api/v1/orders/my-orders?page={page}&size={size}.
export function getOrdersPage(page = 0, size = 5): PageOrderDTO {
  const start = page * size
  const content = allOrders.slice(start, start + size)
  const totalPages = Math.ceil(allOrders.length / size)
  return {
    content,
    totalElements: allOrders.length,
    totalPages,
    last: page >= totalPages - 1,
  }
}
