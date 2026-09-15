/**
 * Oscar Dog Hotel API Service Layer
 * Connects the mobile frontend to the Node.js / PostgreSQL REST API (v1)
 */

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000/api/v1';

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export class ApiError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly details?: any;

  constructor(status: number, code: string, message: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// Token storage helpers
const TOKEN_STORAGE_KEY = 'oscar_access_token';
const REFRESH_TOKEN_STORAGE_KEY = 'oscar_refresh_token';

export const tokenStorage = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  },
  setToken(token: string) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  },
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
  },
  setRefreshToken(token: string) {
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, token);
  },
  clear() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  }
};

/**
 * Universal fetch wrapper with Bearer token injection and standardized error extraction
 */
async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = tokenStorage.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorCode = data?.error?.code || 'HTTP_ERROR';
      const errorMessage = data?.error?.message || `Request failed with status ${res.status}`;
      const details = data?.error?.details;
      throw new ApiError(res.status, errorCode, errorMessage, details);
    }

    return data.data !== undefined ? data.data : data;
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(0, 'NETWORK_ERROR', err.message || 'Failed to connect to backend server');
  }
}

export const api = {
  // Auth endpoints
  auth: {
    async login(email = 'admin@oscardoghotel.com', password = 'OscarHotel2026!') {
      const data = await apiRequest<{
        accessToken: string;
        refreshToken: string;
        account: {
          id: string;
          email: string;
          displayName: string;
          hotelName: string;
        };
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      if (data?.accessToken) {
        tokenStorage.setToken(data.accessToken);
        if (data.refreshToken) tokenStorage.setRefreshToken(data.refreshToken);
      }
      return data;
    },

    async getAccount() {
      return apiRequest<{
        id: string;
        email: string;
        displayName: string;
        hotelName: string;
        avatarUrl?: string;
        lastLoginAt?: string;
      }>('/auth/me');
    },

    async logout() {
      try {
        await apiRequest('/auth/logout', { method: 'POST' });
      } finally {
        tokenStorage.clear();
      }
    }
  },

  // Dogs endpoints
  dogs: {
    async listDogs(params?: {
      search?: string;
      status?: string;
      archived?: boolean;
      page?: number;
      pageSize?: number;
    }) {
      const query = new URLSearchParams();
      if (params?.search) query.append('search', params.search);
      if (params?.status && params.status !== 'ALL') query.append('status', params.status);
      if (params?.archived) query.append('archived', 'true');
      if (params?.page) query.append('page', params.page.toString());
      if (params?.pageSize) query.append('pageSize', params.pageSize.toString());

      const qs = query.toString();
      return apiRequest<any[]>(`/dogs${qs ? `?${qs}` : ''}`);
    },

    async getDogById(id: string) {
      return apiRequest<any>(`/dogs/${id}`);
    },

    async createDog(data: {
      name: string;
      breed: string;
      dateOfBirth?: string;
      gender: string;
      weightKg?: number | null;
      avatarId: string;
      specialNotes?: string;
      ownerName: string;
      ownerPhone: string;
      ownerEmail?: string;
      confirmExistingOwnerId?: string;
    }) {
      return apiRequest<any>('/dogs', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },

    async updateDog(id: string, updates: Partial<{
      name: string;
      breed: string;
      dateOfBirth: string;
      gender: string;
      weightKg: number;
      avatarId: string;
      specialNotes: string;
      ownerId: string;
    }>) {
      return apiRequest<any>(`/dogs/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates)
      });
    },

    async archiveDog(id: string, reason?: string) {
      return apiRequest<{ success: boolean; isArchived: boolean; message: string }>(`/dogs/${id}/archive`, {
        method: 'POST',
        body: JSON.stringify({ reason })
      });
    },

    async restoreDog(id: string) {
      return apiRequest<{ success: boolean; isArchived: boolean; message: string }>(`/dogs/${id}/restore`, {
        method: 'POST'
      });
    }
  },

  // Bookings endpoints
  bookings: {
    async listBookings(params?: {
      status?: string;
      dogId?: string;
      fromDate?: string;
      toDate?: string;
      page?: number;
      pageSize?: number;
    }) {
      const query = new URLSearchParams();
      if (params?.status && params.status !== 'ALL') query.append('status', params.status);
      if (params?.dogId) query.append('dogId', params.dogId);
      if (params?.fromDate) query.append('fromDate', params.fromDate);
      if (params?.toDate) query.append('toDate', params.toDate);
      if (params?.page) query.append('page', params.page.toString());
      if (params?.pageSize) query.append('pageSize', params.pageSize.toString());

      const qs = query.toString();
      return apiRequest<any[]>(`/bookings${qs ? `?${qs}` : ''}`);
    },

    async getBookingById(id: string) {
      return apiRequest<any>(`/bookings/${id}`);
    },

    async createBooking(data: {
      dogId: string;
      checkInAt: string;
      checkOutAt: string;
      status?: string;
      services?: string[];
      notes?: string;
    }) {
      return apiRequest<any>('/bookings', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },

    async updateBooking(id: string, data: {
      checkInAt?: string;
      checkOutAt?: string;
      services?: string[];
      notes?: string | null;
    }) {
      return apiRequest<any>(`/bookings/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      });
    },

    async extendBooking(id: string, newCheckOutAt: string, notes?: string) {
      return apiRequest<any>(`/bookings/${id}/extend`, {
        method: 'POST',
        body: JSON.stringify({ newCheckOutAt, notes })
      });
    },

    async updateBookingStatus(id: string, status: string, effectiveAt: string = new Date().toISOString(), notes?: string) {
      return apiRequest<any>(`/bookings/${id}/status`, {
        method: 'POST',
        body: JSON.stringify({ status, effectiveAt, notes })
      });
    },

    async confirmOutgoing(id: string) {
      return apiRequest<any>(`/bookings/${id}/confirm-outgoing`, {
        method: 'POST'
      });
    }
  },

  // Dashboard metrics & attention
  dashboard: {
    async getDashboardMetrics() {
      return apiRequest<{
        stats: {
          totalDogs: number;
          inHotelCount: number;
          upcomingCount: number;
          outgoingCount: number;
          completeCount: number;
          cancelCount: number;
          receivedCount: number;
          todayCheckIn: number;
          todayCheckOut: number;
          overdueAttentionCount: number;
        };
        overdueAttentionList: Array<{
          bookingId: string;
          dogId: string;
          dogName: string;
          dogBreed: string;
          dogAvatarId: string;
          ownerName: string;
          ownerPhone: string;
          scheduledCheckOut: string;
          scheduledCheckOutFormatted: string;
          currentStatus: string;
          attention: {
            requiresAttention: boolean;
            attentionType: 'NONE' | 'OUTGOING_CONFIRMATION_REQUIRED' | 'OVERDUE_UNRESOLVED';
            isOverdue: boolean;
            overdueMinutes: number;
          };
        }>;
        todayCheckInOut: any[];
      }>('/dashboard');
    },

    async getStats() {
      return apiRequest<any>('/dashboard/stats');
    },

    async getAttention() {
      return apiRequest<any[]>('/dashboard/attention');
    }
  },

  // Registries
  registries: {
    async getAvatars() {
      return apiRequest<Array<{ id: string; label: string; breedTag: string; imageUrl: string }>>('/avatars');
    },
    async getStatuses() {
      return apiRequest<Array<{ id: string; label: string; color: string; bgColor: string; badgeColor: string; icon: string }>>('/statuses');
    }
  },

  // Backups
  backups: {
    async getHealth() {
      return apiRequest<{
        status: 'HEALTHY' | 'NEEDS_ATTENTION';
        healthy: boolean;
        totalSuccessfulBackups: number;
        lastBackup: any;
        retentionDaysConfigured: number;
      }>('/backups/status');
    },

    async triggerBackup() {
      return apiRequest<{ message: string; backup: { id: string; identifier: string; size: number } }>('/backups/trigger', {
        method: 'POST'
      });
    }
  }
};
