import { Dog, Booking, AccountSettings, RecentSearch } from '../types/index';

const STORAGE_KEYS = {
  DOGS: 'oscar_dog_hotel_dogs',
  BOOKINGS: 'oscar_dog_hotel_bookings',
  SETTINGS: 'oscar_dog_hotel_settings',
  RECENT_SEARCHES: 'oscar_dog_hotel_recent_searches',
  BOOKING_DRAFT: 'oscar_dog_hotel_booking_draft'
};

export const INITIAL_SETTINGS: AccountSettings = {
  adminName: 'MD Sakib',
  adminAvatar: '/assets/user_avatar.png',
  version: '1.0.0',
  build: '20260913',
  environment: 'Production'
};

export const INITIAL_DOGS: Dog[] = [
  {
    id: 'dog_1',
    name: 'Bruno',
    avatarId: 'avatar_1',
    breed: 'Golden Retriever',
    age: '3 yrs',
    gender: 'Male',
    weightKg: 28,
    ownerName: 'John Miller',
    ownerPhone: '+357 99 123456',
    ownerEmail: 'john.miller@example.com',
    status: 'IN_HOTEL',
    notes: 'Friendly, enjoys morning walks in the garden. Requires dry food twice a day.',
    checkInDate: '2026-09-12',
    checkInTime: '10:15 AM',
    checkOutDate: '2026-09-15',
    checkOutTime: '10:00 AM',
    createdAt: '2026-09-10T08:00:00Z',
    updatedAt: '2026-09-12T10:15:00Z'
  },
  {
    id: 'dog_2',
    name: 'Luna',
    avatarId: 'avatar_2',
    breed: 'Beagle',
    age: '3 yrs',
    gender: 'Female',
    weightKg: 12,
    ownerName: 'Sarah Johnson',
    ownerPhone: '+357 96 654321',
    ownerEmail: 'sarah.j@example.com',
    status: 'UPCOMING',
    notes: 'Calm and loves chew toys. Bring sensitive stomach kibble.',
    checkInDate: '2026-09-14',
    checkInTime: '11:00 AM',
    checkOutDate: '2026-09-17',
    checkOutTime: '12:00 PM',
    createdAt: '2026-09-11T09:30:00Z',
    updatedAt: '2026-09-11T09:30:00Z'
  },
  {
    id: 'dog_3',
    name: 'Max',
    avatarId: 'avatar_3',
    breed: 'Labrador Retriever',
    age: '1 yr',
    gender: 'Male',
    weightKg: 25,
    ownerName: 'David Brown',
    ownerPhone: '+357 97 112233',
    ownerEmail: 'david.b@example.com',
    status: 'OUTGOING',
    notes: 'Energetic puppy, likes fetch and social play.',
    checkInDate: '2026-09-10',
    checkInTime: '09:00 AM',
    checkOutDate: '2026-09-12',
    checkOutTime: '01:30 PM',
    createdAt: '2026-09-08T10:00:00Z',
    updatedAt: '2026-09-12T13:30:00Z'
  },
  {
    id: 'dog_4',
    name: 'Buddy',
    avatarId: 'avatar_4',
    breed: 'Shih Tzu',
    age: '4 yrs',
    gender: 'Male',
    weightKg: 8,
    ownerName: 'Michael Davis',
    ownerPhone: '+357 95 667788',
    ownerEmail: 'michael.d@example.com',
    status: 'CANCEL',
    notes: 'Cancelled due to owner travel reschedule.',
    checkInDate: '2026-09-12',
    checkInTime: '02:00 PM',
    checkOutDate: '2026-09-12',
    checkOutTime: '06:00 PM',
    createdAt: '2026-09-09T14:00:00Z',
    updatedAt: '2026-09-12T14:00:00Z'
  },
  {
    id: 'dog_5',
    name: 'Bella',
    avatarId: 'avatar_5',
    breed: 'Yorkshire Terrier',
    age: '2 yrs',
    gender: 'Female',
    weightKg: 6,
    ownerName: 'Emily Wilson',
    ownerPhone: '+357 99 889900',
    ownerEmail: 'emily.w@example.com',
    status: 'RECEIVED',
    notes: 'Just arrived for weekend boarding. Prefers indoor rest.',
    checkInDate: '2026-09-12',
    checkInTime: '03:20 PM',
    checkOutDate: '2026-09-14',
    checkOutTime: '10:00 AM',
    createdAt: '2026-09-10T12:00:00Z',
    updatedAt: '2026-09-12T15:20:00Z'
  },
  {
    id: 'dog_6',
    name: 'Rocky',
    avatarId: 'avatar_1',
    breed: 'Siberian Husky',
    age: '3 yrs',
    gender: 'Male',
    weightKg: 22,
    ownerName: 'Daniel Lee',
    ownerPhone: '+357 96 445566',
    ownerEmail: 'daniel.l@example.com',
    status: 'COMPLETE',
    notes: 'Stay completed successfully. Owner picked up on time.',
    checkInDate: '2026-09-05',
    checkInTime: '09:00 AM',
    checkOutDate: '2026-09-10',
    checkOutTime: '11:00 AM',
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: '2026-09-10T11:00:00Z'
  },
  {
    id: 'dog_7',
    name: 'Daisy',
    avatarId: 'avatar_2',
    breed: 'Cocker Spaniel',
    age: '2 yrs',
    gender: 'Female',
    weightKg: 14,
    ownerName: 'Elena Taylor',
    ownerPhone: '+357 99 334455',
    ownerEmail: 'elena.t@example.com',
    status: 'IN_HOTEL',
    notes: 'Friendly spaniel, loves cuddles and grooming.',
    checkInDate: '2026-09-11',
    checkInTime: '08:30 AM',
    checkOutDate: '2026-09-16',
    checkOutTime: '10:00 AM',
    createdAt: '2026-09-08T11:00:00Z',
    updatedAt: '2026-09-11T08:30:00Z'
  },
  {
    id: 'dog_8',
    name: 'Milo',
    avatarId: 'avatar_3',
    breed: 'French Bulldog',
    age: '2 yrs',
    gender: 'Male',
    weightKg: 11,
    ownerName: 'Alexander Smith',
    ownerPhone: '+357 97 556677',
    ownerEmail: 'alex.s@example.com',
    status: 'RECEIVED',
    notes: 'Requires air conditioning, short walks only.',
    checkInDate: '2026-09-12',
    checkInTime: '09:15 AM',
    checkOutDate: '2026-09-15',
    checkOutTime: '05:00 PM',
    createdAt: '2026-09-11T16:00:00Z',
    updatedAt: '2026-09-12T09:15:00Z'
  },
  {
    id: 'dog_9',
    name: 'Cooper',
    avatarId: 'avatar_4',
    breed: 'Poodle',
    age: '5 yrs',
    gender: 'Male',
    weightKg: 9,
    ownerName: 'Sophia Martin',
    ownerPhone: '+357 96 223344',
    ownerEmail: 'sophia.m@example.com',
    status: 'UPCOMING',
    notes: 'Hypoallergenic diet, scheduled for special grooming.',
    checkInDate: '2026-09-15',
    checkInTime: '02:00 PM',
    checkOutDate: '2026-09-18',
    checkOutTime: '11:00 AM',
    createdAt: '2026-09-12T11:00:00Z',
    updatedAt: '2026-09-12T11:00:00Z'
  },
  {
    id: 'dog_10',
    name: 'Bailey',
    avatarId: 'avatar_5',
    breed: 'Pomeranian',
    age: '1 yr',
    gender: 'Female',
    weightKg: 4,
    ownerName: 'Lucas White',
    ownerPhone: '+357 95 998877',
    ownerEmail: 'lucas.w@example.com',
    status: 'IN_HOTEL',
    notes: 'Sweet and small, kept in the quiet puppy wing.',
    checkInDate: '2026-09-12',
    checkInTime: '08:00 AM',
    checkOutDate: '2026-09-16',
    checkOutTime: '02:00 PM',
    createdAt: '2026-09-10T14:00:00Z',
    updatedAt: '2026-09-12T08:00:00Z'
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'booking_1',
    dogId: 'dog_1',
    checkInDate: '2026-09-12',
    checkInTime: '10:15 AM',
    checkOutDate: '2026-09-15',
    checkOutTime: '10:00 AM',
    status: 'IN_HOTEL',
    services: ['bathing', 'extra_walks'],
    notes: 'Full stay with morning walks',
    durationNights: 3,
    createdAt: '2026-09-10T08:00:00Z',
    updatedAt: '2026-09-12T10:15:00Z'
  },
  {
    id: 'booking_2',
    dogId: 'dog_2',
    checkInDate: '2026-09-14',
    checkInTime: '11:00 AM',
    checkOutDate: '2026-09-17',
    checkOutTime: '12:00 PM',
    status: 'UPCOMING',
    services: ['special_food'],
    notes: 'Brought own kibble',
    durationNights: 3,
    createdAt: '2026-09-11T09:30:00Z',
    updatedAt: '2026-09-11T09:30:00Z'
  },
  {
    id: 'booking_3',
    dogId: 'dog_3',
    checkInDate: '2026-09-10',
    checkInTime: '09:00 AM',
    checkOutDate: '2026-09-12',
    checkOutTime: '01:30 PM',
    status: 'OUTGOING',
    services: ['training', 'extra_walks'],
    notes: 'Pick up scheduled at 1:30 PM',
    durationNights: 2,
    createdAt: '2026-09-08T10:00:00Z',
    updatedAt: '2026-09-12T13:30:00Z'
  },
  {
    id: 'booking_4',
    dogId: 'dog_4',
    checkInDate: '2026-09-12',
    checkInTime: '02:00 PM',
    checkOutDate: '2026-09-12',
    checkOutTime: '06:00 PM',
    status: 'CANCEL',
    services: [],
    notes: 'Cancelled reservation',
    durationNights: 0,
    createdAt: '2026-09-09T14:00:00Z',
    updatedAt: '2026-09-12T14:00:00Z'
  },
  {
    id: 'booking_5',
    dogId: 'dog_5',
    checkInDate: '2026-09-12',
    checkInTime: '03:20 PM',
    checkOutDate: '2026-09-14',
    checkOutTime: '10:00 AM',
    status: 'RECEIVED',
    services: ['grooming'],
    notes: 'Checked in for weekend',
    durationNights: 2,
    createdAt: '2026-09-10T12:00:00Z',
    updatedAt: '2026-09-12T15:20:00Z'
  },
  {
    id: 'booking_6',
    dogId: 'dog_6',
    checkInDate: '2026-09-05',
    checkInTime: '09:00 AM',
    checkOutDate: '2026-09-10',
    checkOutTime: '11:00 AM',
    status: 'COMPLETE',
    services: ['bathing', 'training'],
    notes: 'Previous reservation, completed',
    durationNights: 5,
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: '2026-09-10T11:00:00Z'
  },
  {
    id: 'booking_7',
    dogId: 'dog_7',
    checkInDate: '2026-09-11',
    checkInTime: '08:30 AM',
    checkOutDate: '2026-09-16',
    checkOutTime: '10:00 AM',
    status: 'IN_HOTEL',
    services: ['grooming', 'extra_walks'],
    notes: '5 night stay',
    durationNights: 5,
    createdAt: '2026-09-08T11:00:00Z',
    updatedAt: '2026-09-11T08:30:00Z'
  },
  {
    id: 'booking_8',
    dogId: 'dog_8',
    checkInDate: '2026-09-12',
    checkInTime: '09:15 AM',
    checkOutDate: '2026-09-15',
    checkOutTime: '05:00 PM',
    status: 'RECEIVED',
    services: ['medication'],
    notes: 'Ear drops at 12 PM',
    durationNights: 3,
    createdAt: '2026-09-11T16:00:00Z',
    updatedAt: '2026-09-12T09:15:00Z'
  },
  {
    id: 'booking_9',
    dogId: 'dog_9',
    checkInDate: '2026-09-15',
    checkInTime: '02:00 PM',
    checkOutDate: '2026-09-18',
    checkOutTime: '11:00 AM',
    status: 'UPCOMING',
    services: ['grooming', 'special_food'],
    notes: 'Arrival on Tuesday',
    durationNights: 3,
    createdAt: '2026-09-12T11:00:00Z',
    updatedAt: '2026-09-12T11:00:00Z'
  },
  {
    id: 'booking_10',
    dogId: 'dog_10',
    checkInDate: '2026-09-12',
    checkInTime: '08:00 AM',
    checkOutDate: '2026-09-16',
    checkOutTime: '02:00 PM',
    status: 'IN_HOTEL',
    services: ['extra_walks'],
    notes: 'Puppy care package',
    durationNights: 4,
    createdAt: '2026-09-10T14:00:00Z',
    updatedAt: '2026-09-12T08:00:00Z'
  }
];

export const INITIAL_SEARCHES: RecentSearch[] = [
  {
    id: 'search_1',
    query: 'Bruno',
    type: 'Dog name',
    timestamp: 'Today, 10:30 AM'
  },
  {
    id: 'search_2',
    query: 'John Miller',
    type: 'Owner name',
    timestamp: 'Today, 09:15 AM'
  },
  {
    id: 'search_3',
    query: '+357 99 123456',
    type: 'Phone number',
    timestamp: 'Sep 11, 2026'
  },
  {
    id: 'search_4',
    query: 'Sep 12 – Sep 15, 2026',
    type: 'Date range',
    timestamp: 'Sep 10, 2026'
  },
  {
    id: 'search_5',
    query: 'Luna',
    type: 'Dog name',
    timestamp: 'Sep 10, 2026'
  }
];

class StorageService {
  getDogs(): Dog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DOGS);
      if (!data) {
        this.saveDogs(INITIAL_DOGS);
        return INITIAL_DOGS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_DOGS;
    }
  }

  saveDogs(dogs: Dog[]): void {
    localStorage.setItem(STORAGE_KEYS.DOGS, JSON.stringify(dogs));
  }

  getBookings(): Booking[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
      if (!data) {
        this.saveBookings(INITIAL_BOOKINGS);
        return INITIAL_BOOKINGS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_BOOKINGS;
    }
  }

  saveBookings(bookings: Booking[]): void {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
  }

  getSettings(): AccountSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) {
        this.saveSettings(INITIAL_SETTINGS);
        return INITIAL_SETTINGS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_SETTINGS;
    }
  }

  saveSettings(settings: AccountSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  getRecentSearches(): RecentSearch[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES);
      if (!data) {
        this.saveRecentSearches(INITIAL_SEARCHES);
        return INITIAL_SEARCHES;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_SEARCHES;
    }
  }

  saveRecentSearches(searches: RecentSearch[]): void {
    localStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(searches));
  }

  exportData(): string {
    const data = {
      dogs: this.getDogs(),
      bookings: this.getBookings(),
      settings: this.getSettings(),
      recentSearches: this.getRecentSearches(),
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }

  getBookingDraft<T>(): T | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BOOKING_DRAFT);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  saveBookingDraft<T>(draft: T | null): void {
    if (draft === null) {
      localStorage.removeItem(STORAGE_KEYS.BOOKING_DRAFT);
    } else {
      localStorage.setItem(STORAGE_KEYS.BOOKING_DRAFT, JSON.stringify(draft));
    }
  }

  clearBookingDraft(): void {
    localStorage.removeItem(STORAGE_KEYS.BOOKING_DRAFT);
  }

  resetToDefault(): void {
    // Disabled in production to safeguard database integrity
    console.warn('[STORAGE] Demo reset is disabled in production.');
  }
}

export const storageService = new StorageService();
