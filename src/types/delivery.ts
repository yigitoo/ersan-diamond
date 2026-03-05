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
  lat?: number;
  lng?: number;
}

// Route optimization types
export interface RouteStop {
  deliveryId: string;
  recipientName: string;
  address: DeliveryAddress;
  status: DeliveryStatus;
  lat: number;
  lng: number;
  distanceFromPrev: number; // km
  cumulativeDistance: number; // km
  etaMinutes: number; // cumulative ETA from start
  durationMinutes?: number; // OSRM leg duration
  cumulativeDuration?: number; // cumulative OSRM duration
}

export interface RouteResult {
  courierId: string;
  courierName: string;
  origin: { lat: number; lng: number };
  stops: RouteStop[];
  totalDistanceKm: number;
  totalEtaMinutes: number;
  geometry?: [number, number][]; // Real road polyline [lat, lng][]
  trafficMultiplier?: number;
  routeSource: "osrm" | "haversine";
}

export interface CourierScore {
  courierId: string;
  courierName: string;
  score: number;
  activeCount: number;
  distanceToPickup: number;
  clusterDistance: number;
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
