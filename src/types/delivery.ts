export type DeliveryStatus = "PENDING" | "ASSIGNED" | "PICKED_UP" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";
export type DeliveryPriority = "NORMAL" | "HIGH" | "URGENT";
export type DeliveryTimeSlot = "MORNING" | "AFTERNOON" | "EVENING" | "FLEXIBLE";

export interface DeliveryAddress {
  label: string;
  street: string;
  district?: string;
  city: string;
  country: string;
  postalCode?: string;
  notes?: string;
}

export interface DeliveryStatusEntry {
  status: DeliveryStatus;
  timestamp: Date;
  note?: string;
  userId: string;
}

export interface CourierLocation {
  lat: number;
  lng: number;
  updatedAt: Date;
}

export interface IDelivery {
  _id: string;
  productId: string;
  saleId?: string;
  courierId?: string;
  createdById: string;
  status: DeliveryStatus;
  priority: DeliveryPriority;
  scheduledDate: Date;
  timeSlot: DeliveryTimeSlot;
  recipientName: string;
  recipientPhone: string;
  recipientEmail?: string;
  pickupAddress: DeliveryAddress;
  deliveryAddress: DeliveryAddress;
  adminNotes: string;
  courierNotes: string;
  specialInstructions: string;
  courierLocation?: CourierLocation;
  statusHistory: DeliveryStatusEntry[];
  deliveredAt?: Date;
  proofOfDelivery?: string;
  createdAt: Date;
  updatedAt: Date;
}
