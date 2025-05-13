
export interface Car {
  available: boolean
  brand: string
  carModel: string
  carType: string
  description: string
  fuelType: string
  image: string
  mileage: string
  pricePerDay: number
  vin: string
  yearOfManufacture: number
}

export interface Reservation {
  car: Car | null;
  form: ReservationForm;
  status?: 'pending' | 'confirmed';
}
export interface ReservationForm {
  name: string;
  email: string;
  phone: string;
  driverLicense: string;
  startDate: string;
  rentalPeriod: number;
}