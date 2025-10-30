export interface ParkingSlot {
  slotNumber: number;
  isAvailable: boolean;
  lastUpdated?: Date;
  _id?: string;
}

export interface ParkingArea {
  _id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  address: string;
  totalSlots: number;
  slots: ParkingSlot[];
  availableSlots?: number;
  distance?: number;
  createdAt?: Date;
}

export interface ParkingSession {
  _id?: string;
  user: string;
  parkingArea: {
    _id: string;
    name: string;
    address: string;
    location?: {
      lat: number;
      lng: number;
    };
  };
  slotNumber: number;
  entryTime: Date;
  exitTime?: Date;
  duration?: number; // in minutes
  status: 'active' | 'completed';
}

export interface SlotUpdateEvent {
  parkingId: string;
  slotNumber: number;
  isAvailable: boolean;
  availableSlots: number;
  totalSlots: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface OccupancyStats {
  id: string;
  name: string;
  totalSlots: number;
  availableSlots: number;
  occupiedSlots: number;
  occupancyRate: string;
}

export interface OverallStats {
  totalParkingAreas: number;
  totalSlots: number;
  totalAvailable: number;
  totalOccupied: number;
}
