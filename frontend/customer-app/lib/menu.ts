// Maps strictly to the menu page API contracts:
//   GET /api/v1/canteens/{canteenId}        -> CanteenDetailDTO
//   GET /api/v1/canteens/{canteenId}/dishes -> ResponseListDishDTO

export interface CanteenDetailDTO {
  id: number
  name: string
  canteenType: string
  description: string
  imageUrl: string
  open: boolean
  todayOpeningTime?: string // e.g. "09:00"
  todayClosingTime?: string // e.g. "21:00"
  prepTimeMinutes?: number
  location?: string
  // display-only enrichment (not part of the strict payload)
  tags?: string[]
  averageRating?: number
}

export interface DishDTO {
  id: number
  name: string
  description: string
  price: number
  imageUrl: string
  foodCategory: string
  averageRating: number
  reviewCount: number
  available: boolean
  canteenLocation?: string
}

export interface ResponseListDishDTO {
  data: DishDTO[]
}

// Maps to GET /api/v1/reviews/dish/{dishId} -> ResponseListReviewDTO
export interface ReviewDTO {
  id: number
  userId?:number
  userName?: string
  userAvatarUrl?: string
  dishId?:number
  dishName?:string
  dishImageUrl?:string
  rating: number
  comment: string
  orderId?:number
  createdAt?: string // e.g. "2026-06-22 14:30:00"
}
export interface ReviewPage{
  content: ReviewDTO[]
  totalElements: number
  totalPages: number
  number: number
  size: number
  first: boolean
  last: boolean
}

export interface ResponseReviewPageDTO {
  data: ReviewPage[]
}
