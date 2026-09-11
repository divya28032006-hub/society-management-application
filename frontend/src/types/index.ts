export type UserRole = 'resident' | 'admin' | 'security';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  flatNumber?: string;
  wing?: string;
  isActive: boolean;
  profilePicture?: string;
  society?: string | Society;
  createdAt?: string;
  updatedAt?: string;
}

export interface Society {
  _id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  totalFlats: number;
  totalWings: number;
  amenities: string[];
  contactEmail: string;
  contactPhone: string;
}

export interface Announcement {
  _id: string;
  title: string;
  content: string;
  category: 'general' | 'maintenance' | 'emergency' | 'event' | 'admin';
  pinned: boolean;
  author: User;
  society: string;
  createdAt: string;
  updatedAt: string;
}

export interface Complaint {
  _id: string;
  title: string;
  description: string;
  category: 'plumbing' | 'electrical' | 'carpentry' | 'security' | 'cleanliness' | 'noise' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected';
  createdBy: User;
  assignedTo?: User;
  society: string;
  images?: string[];
  comments: {
    _id: string;
    user: User;
    text: string;
    createdAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface EventAttendee {
  user: User;
  status: 'going' | 'maybe' | 'not_going';
  registeredAt: string;
}

export interface EventItem {
  _id: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  organizer: User;
  maxAttendees?: number;
  attendees: EventAttendee[];
  isVirtual: boolean;
  meetingLink?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Facility {
  _id: string;
  name: string;
  description: string;
  capacity: number;
  availableSlots: number;
  bookingFee?: number;
  isActive: boolean;
  image?: string;
  operatingHours?: { start: string; end: string };
  amenities?: string[];
}

export interface Booking {
  _id: string;
  facility: Facility;
  user: User;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;    // backend stores notes (mapped from 'purpose' on creation)
  status: 'pending' | 'booked' | 'cancelled' | 'completed'; // must match BookingStatus enum
  totalAmount: number;
  createdAt: string;
}

export interface Visitor {
  _id: string;
  name: string;
  phone: string;
  purpose: string;
  hostFlat: string;
  hostName?: string;
  hostResident?: User;
  entryTime?: string;
  exitTime?: string;
  status: 'pending' | 'pre_approved' | 'approved' | 'checked_in' | 'checked_out' | 'rejected'; // matches backend VisitorStatus enum
  vehicleNumber?: string;
  createdAt: string;
}

export interface EmergencyContact {
  _id: string;
  name: string;
  designation: string;
  phone: string;
  email?: string;
  address?: string;
  priority: number;
  isActive: boolean;
}

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: 'announcement' | 'complaint' | 'visitor' | 'booking' | 'payment' | 'general';
  recipient: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  status: string;
  message?: string;
  data?: T;
  results?: number;
  total?: number;
}
