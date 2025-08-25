export interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}

export interface Order {
  id: string
  date: string
  total: number
  status: "processing" | "shipped" | "delivered"
  items: OrderItem[]
  shippingAddress: string
  trackingNumber?: string
}

export interface ShippingData {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface PaymentData {
  cardNumber: string
  expiryDate: string
  cvv: string
  cardName: string
}
