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
  location?: string
}

export interface ResponseListCanteenDTO {
  data: CanteenDTO[]
}