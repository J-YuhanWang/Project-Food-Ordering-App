// Maps strictly to the ResponseListCanteenDTO / CanteenDTO API contract.

export type DayOfWeek =
  | 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'

export interface CanteenScheduleDTO{
  id: number
  dayOfWeek: DayOfWeek
  openingTime?: string
  closingTime?: string
  closed: boolean
}

export interface HolidayScheduleDTO{
  id: number
  specificDate: string
  openingTime?: string
  closingTime?: string
  closed: boolean
  description?: string
}

export interface CanteenDTO {
  id: number
  name: string
  canteenType: string
  description: string
  imageUrl: string
  open: boolean
  todayOpeningTime?: string
  todayClosingTime?: string
  schedules?: CanteenScheduleDTO[]
  holidays?: HolidayScheduleDTO[]
  prepTimeMinutes?: number
}

export interface ResponseListCanteenDTO {
  data: CanteenDTO[]
}

// Mock payload shaped exactly like GET /api/v1/canteens would return.
export const canteensResponse: ResponseListCanteenDTO = {
  data: [
    {
      id: 1,
      name: 'Pi Restaurant',
      canteenType: 'RESTAURANT',
      description: 'Best wood-fired pizza on the UCD campus.',
      imageUrl: '/canteens/pi-restaurant.png',
      open: true,
    },
    {
      id: 2,
      name: 'The Global Grill',
      canteenType: 'GRILL',
      description: 'Juicy gourmet burgers, loaded fries and more.',
      imageUrl: '/canteens/global-grill.png',
      open: true,
    },
    {
      id: 3,
      name: 'Green Bowl',
      canteenType: 'HEALTHY',
      description: 'Fresh salads, grain bowls and cold-pressed juices.',
      imageUrl: '/canteens/green-bowl.png',
      open: true,
    },
    {
      id: 4,
      name: 'Bean Scene',
      canteenType: 'CAFE',
      description: 'Specialty coffee, fresh pastries and quiet corners.',
      imageUrl: '/canteens/bean-scene-cafe.png',
      open: false,
    },
    {
      id: 5,
      name: 'Noodle House',
      canteenType: 'ASIAN',
      description: 'Steaming ramen, dumplings and rice bowls.',
      imageUrl: '/canteens/noodle-house.png',
      open: true,
    },
    {
      id: 6,
      name: 'Sweet Spot',
      canteenType: 'BAKERY',
      description: 'Cakes, donuts and treats baked fresh daily.',
      imageUrl: '/canteens/sweet-spot.png',
      open: false,
    },
  ],
}
