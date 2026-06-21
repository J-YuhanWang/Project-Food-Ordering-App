// Maps strictly to the menu page API contracts:
//   GET /api/v1/canteens/{canteenId}        -> CanteenDetailDTO
//   GET /api/v1/canteens/{canteenId}/dishes -> ResponseListDishDTO

export interface CanteenDetailDTO {
  id: number
  name: string
  canteenType: string
  description: string
  imageUrl: string
  isOpen: boolean
  todayOpeningTime: string // e.g. "09:00"
  todayClosingTime: string // e.g. "21:00"
  prepTimeMinutes: number
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
  userName: string
  rating: number
  comment: string
  createdAt: string // e.g. "2024-04-19"
  // display-only enrichment (not part of the strict payload)
  userRole?: string
}

export interface ResponseListReviewDTO {
  data: ReviewDTO[]
}

// Ordered category labels derived from the foodCategory field.
export const MENU_CATEGORIES = [
  'All',
  'Main Course',
  'Sides',
  'Drinks',
  'Desserts',
] as const

// Mock canteen detail, shaped exactly like GET /api/v1/canteens/{canteenId}.
export const canteenDetail: CanteenDetailDTO = {
  id: 1,
  name: 'Pi Restaurant',
  canteenType: 'Italian',
  description: 'Best wood-fired pizza and fresh pasta on the UCD campus.',
  imageUrl: '/canteens/pi-restaurant.png',
  isOpen: true,
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

// Mock reviews keyed by dish id, shaped like GET /api/v1/reviews/dish/{dishId}.
const reviewsByDish: Record<number, ReviewDTO[]> = {
  101: [
    {
      id: 1,
      userName: 'Aoife Byrne',
      userRole: 'Arts Student',
      rating: 5,
      comment:
        'Genuinely the best pizza on campus. The crust is perfectly charred and the basil is fresh. I get this at least twice a week!',
      createdAt: '2024-04-19',
    },
    {
      id: 2,
      userName: 'Liam Murphy',
      userRole: 'PhD Researcher',
      rating: 5,
      comment:
        'Authentic Neapolitan style. Light, fluffy and not greasy at all. Highly recommend.',
      createdAt: '2024-04-12',
    },
    {
      id: 3,
      userName: 'Saoirse Kelly',
      userRole: 'Engineering Student',
      rating: 4,
      comment:
        'Really tasty and great value. Took a couple of minutes longer than expected at lunch rush but worth the wait.',
      createdAt: '2024-03-30',
    },
    {
      id: 4,
      userName: 'Daniel O\u2019Connor',
      userRole: 'Lecturer',
      rating: 5,
      comment: 'Melts in your mouth. The mozzarella is top quality.',
      createdAt: '2024-03-21',
    },
    {
      id: 5,
      userName: 'Niamh Walsh',
      userRole: 'Business Student',
      rating: 4,
      comment: 'Solid classic margherita. Would love a slightly bigger size option.',
      createdAt: '2024-03-08',
    },
  ],
  107: [
    {
      id: 6,
      userName: 'Conor Doyle',
      userRole: 'PhD Researcher',
      rating: 5,
      comment: 'Best tiramisu I have had outside of Italy. Strong coffee flavour, not too sweet.',
      createdAt: '2024-04-17',
    },
    {
      id: 7,
      userName: 'Emma Ryan',
      userRole: 'Science Student',
      rating: 5,
      comment: 'Absolutely divine. The perfect end to a meal here.',
      createdAt: '2024-04-02',
    },
  ],
}

// Returns reviews for a dish — stands in for GET /api/v1/reviews/dish/{dishId}.
export function getReviewsByDish(dishId: number): ResponseListReviewDTO {
  return { data: reviewsByDish[dishId] ?? [] }
}
