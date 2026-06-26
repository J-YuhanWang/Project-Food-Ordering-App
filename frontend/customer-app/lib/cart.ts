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
  available: boolean
}

export interface CartDTO {
  id: number
  userId: number
  canteenId: number
  canteenName: string
  totalPrice: number
  totalQuantity: number
  items: CartItemDTO[]
}

export interface ResponseCartDTO {
  data: CartDTO
}

