export type UniversalAvatarId =
  | 'avatar_1'
  | 'avatar_2'
  | 'avatar_3'
  | 'avatar_4'
  | 'avatar_5';

export interface DogAvatarConfig {
  id: UniversalAvatarId;
  label: string;
  breedTag: string;
  imageSrc: string;
}

export type UniversalStatus =
  | 'RECEIVED'
  | 'IN_HOTEL'
  | 'UPCOMING'
  | 'COMPLETE'
  | 'CANCEL'
  | 'OUTGOING';

export interface StatusConfig {
  id: UniversalStatus;
  label: string; // Exact user-facing label: 'Received', 'In hotel', 'Upcoming', 'Complete', 'Cancel', 'Outgoing'
  color: string; // text/border color
  bgColor: string; // light pill background
  badgeColor: string; // solid badge background
  icon: string; // visual symbol e.g. ✓, ●, ◷, ↗, ×
}

export interface Dog {
  id: string;
  name: string;
  avatarId: UniversalAvatarId;
  breed: string;
  dob?: string;
  age?: string;
  gender: 'Male' | 'Female' | 'Other';
  weightKg?: number;
  ownerName: string;
  ownerPhone: string;
  ownerEmail?: string;
  status: UniversalStatus;
  notes?: string;
  checkInDate: string; // YYYY-MM-DD or readable
  checkInTime?: string;
  checkOutDate: string; // YYYY-MM-DD or readable
  checkOutTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingService {
  id: string;
  label: string;
  icon: string;
}

export interface Booking {
  id: string;
  dogId: string;
  dog?: Dog;
  checkInDate: string;
  checkInTime?: string;
  checkOutDate: string;
  checkOutTime?: string;
  status: UniversalStatus;
  services: string[]; // IDs of selected services: bathing, grooming, etc.
  notes?: string;
  durationNights: number;
  createdAt: string;
  updatedAt: string;
}

export interface AccountSettings {
  adminName: string;
  adminAvatar: string;
  version: string;
  build: string;
  environment: string;
}

export interface RecentSearch {
  id: string;
  query: string;
  type: 'Dog name' | 'Owner name' | 'Phone number' | 'Date range' | 'General';
  timestamp: string;
}

export interface FilterState {
  searchQuery: string;
  statusFilter: UniversalStatus | 'ALL';
  dateRangeFilter: 'ALL' | 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'CUSTOM';
  customFromDate?: string;
  customToDate?: string;
}

export interface OwnerConflictDetails {
  existingOwnerId: string;
  existingName: string;
  existingPhone: string;
  existingEmail?: string;
  inputName: string;
}

export interface OverdueAttentionDog {
  bookingId: string;
  dogId: string;
  dogName: string;
  dogBreed: string;
  dogAvatarId: UniversalAvatarId;
  ownerName: string;
  ownerPhone: string;
  scheduledCheckOut: string;
  scheduledCheckOutFormatted: string;
  currentStatus: UniversalStatus;
  attention: {
    requiresAttention: boolean;
    attentionType: 'NONE' | 'OUTGOING_CONFIRMATION_REQUIRED' | 'OVERDUE_UNRESOLVED';
    isOverdue: boolean;
    overdueMinutes: number;
  };
}

export interface BackendSessionState {
  isConnected: boolean;
  isAuthenticating: boolean;
  staffEmail: string | null;
  hotelName: string | null;
  lastSyncAt: string | null;
  error: string | null;
}
