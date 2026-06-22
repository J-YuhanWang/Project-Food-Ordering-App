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


// Mock canteen detail, shaped exactly like GET /api/v1/canteens/{canteenId}.
export const canteenDetail: CanteenDetailDTO = {
  id: 1,
  name: 'Pi Restaurant',
  canteenType: 'Italian',
  description: 'Best wood-fired pizza and fresh pasta on the UCD campus.',
  imageUrl: '/canteens/pi-restaurant.png',
  open: true,
  todayOpeningTime: '09:00',
  todayClosingTime: '21:00',
  prepTimeMinutes: 15,
  location: 'Student Centre, UCD Belfield',
  tags: ['Italian', 'Top Rated'],
  averageRating: 4.8,
}

// Mock dishes, shaped exactly like GET /api/v1/canteens/{canteenId}/dishes.
export const dishesResponse: ResponseListDishDTO = {
  data: [
    {
      id: 101,
      name: 'Margherita Pizza',
      description:
        'Wood-fired pizza with San Marzano tomato, fresh mozzarella and basil.',
      price: 9.5,
      imageUrl: '/dishes/margherita-pizza.png',
      foodCategory: 'Main Course',
      averageRating: 4.8,
      reviewCount: 120,
      available: true,
    },
    {
      id: 102,
      name: 'Pepperoni Pizza',
      description:
        'Crispy base loaded with spicy pepperoni and bubbling mozzarella.',
      price: 11.0,
      imageUrl: '/dishes/pepperoni-pizza.png',
      foodCategory: 'Main Course',
      averageRating: 4.7,
      reviewCount: 98,
      available: true,
    },
    {
      id: 103,
      name: 'Spaghetti Carbonara',
      description:
        'Classic Roman pasta with pancetta, egg, pecorino and black pepper.',
      price: 10.5,
      imageUrl: '/dishes/carbonara.png',
      foodCategory: 'Main Course',
      averageRating: 4.6,
      reviewCount: 76,
      available: true,
    },
    {
      id: 104,
      name: 'Garlic Bread',
      description:
        'Oven-toasted ciabatta brushed with garlic butter and herbs.',
      price: 4.5,
      imageUrl: '/dishes/garlic-bread.png',
      foodCategory: 'Sides',
      averageRating: 4.5,
      reviewCount: 54,
      available: true,
    },
    {
      id: 105,
      name: 'Caesar Salad',
      description:
        'Crisp romaine, parmesan shavings, croutons and creamy Caesar dressing.',
      price: 6.5,
      imageUrl: '/dishes/caesar-salad.png',
      foodCategory: 'Sides',
      averageRating: 4.4,
      reviewCount: 41,
      available: true,
    },
    {
      id: 106,
      name: 'Italian Soda',
      description: 'Sparkling soda with fruit syrup over ice — choose your flavour.',
      price: 3.0,
      imageUrl: '/dishes/italian-soda.png',
      foodCategory: 'Drinks',
      averageRating: 4.3,
      reviewCount: 29,
      available: true,
    },
    {
      id: 107,
      name: 'Tiramisu',
      description:
        'Espresso-soaked ladyfingers layered with mascarpone and cocoa.',
      price: 5.5,
      imageUrl: '/dishes/tiramisu.png',
      foodCategory: 'Desserts',
      averageRating: 4.9,
      reviewCount: 134,
      available: true,
    },
    {
      id: 108,
      name: 'Panna Cotta',
      description: 'Silky vanilla cream set with a bright seasonal berry sauce.',
      price: 5.0,
      imageUrl: '/dishes/panna-cotta.png',
      foodCategory: 'Desserts',
      averageRating: 4.6,
      reviewCount: 62,
      available: true,
    },
    {
      id: 109,
      name: 'Calzone (Sold Out)',
      description: 'Folded pizza stuffed with ricotta, mozzarella and ham.',
      price: 10.0,
      imageUrl: '/dishes/pepperoni-pizza.png',
      foodCategory: 'Main Course',
      averageRating: 4.5,
      reviewCount: 33,
      available: false,
    },
  ],
}

// Look up a single dish by its id — stands in for GET /api/v1/canteens/{canteenId}/dishes/{dishId}.
export function getDishById(dishId: number): DishDTO | undefined {
  return dishesResponse.data.find((d) => d.id === dishId)
}