// Maps strictly to the shopping cart API contracts:
//   GET    /api/v1/cart                                  -> ResponseCartDTO
//   DELETE /api/v1/cart                                  -> clearCart
//   PATCH  /api/v1/cart/items/{cartItemId}/increment     -> incrementItem
//   PATCH  /api/v1/cart/items/{cartItemId}/decrement     -> decrementItem
//   DELETE /api/v1/cart/items/{cartItemId}               -> removeItem

export interface CartItemDTO {
  id: number
  dishId: number
  dishName: string
  dishImageUrl: string
  quantity: number
  pricePerUnit: number
  subtotal: number
}

export interface CartDTO {
  id: number
  canteenName: string
  totalPrice: number
  totalQuantity: number
  items: CartItemDTO[]
}

export interface ResponseCartDTO {
  data: CartDTO
}

// Mock cart, shaped exactly like GET /api/v1/cart. Dublin/UCD campus context.
export const cartResponse: ResponseCartDTO = {
  data: {
    id: 9001,
    canteenName: 'Pi Restaurant',
    totalPrice: 33.0,
    totalQuantity: 4,
    items: [
      {
        id: 5001,
        dishId: 101,
        dishName: 'Margherita Pizza',
        dishImageUrl: '/dishes/margherita-pizza.png',
        quantity: 2,
        pricePerUnit: 9.5,
        subtotal: 19.0,
      },
      {
        id: 5002,
        dishId: 104,
        dishName: 'Garlic Bread',
        dishImageUrl: '/dishes/garlic-bread.png',
        quantity: 1,
        pricePerUnit: 4.5,
        subtotal: 4.5,
      },
      {
        id: 5003,
        dishId: 107,
        dishName: 'Tiramisu',
        dishImageUrl: '/dishes/tiramisu.png',
        quantity: 1,
        pricePerUnit: 5.5,
        subtotal: 5.5,
      },
      {
        id: 5004,
        dishId: 106,
        dishName: 'Italian Soda',
        dishImageUrl: '/dishes/italian-soda.png',
        quantity: 1,
        pricePerUnit: 3.0,
        subtotal: 3.0,
      },
    ],
  },
}

// Recomputes derived totals from the line items so the summary stays in sync
// after client-side increment / decrement / remove actions.
export function recomputeCart(cart: CartDTO): CartDTO {
  const items = cart.items.map((item) => ({
    ...item,
    subtotal: Number((item.pricePerUnit * item.quantity).toFixed(2)),
  }))
  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = Number(
    items.reduce((sum, i) => sum + i.subtotal, 0).toFixed(2),
  )
  return { ...cart, items, totalQuantity, totalPrice }
}
