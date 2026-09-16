import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Dog,
  Booking,
  AccountSettings,
  RecentSearch,
  UniversalStatus,
  UniversalAvatarId,
  FilterState,
  BackendSessionState,
  OverdueAttentionDog
} from '../types';
import { storageService } from '../services/storage';
import { api, ApiError, UserSessionAccount } from '../services/api';
import { supabase } from '../services/supabase';

export type DeviceWidthMode = 'responsive' | 320 | 360 | 375 | 390 | 412 | 430 | 709;

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  dogs: Dog[];
  bookings: Booking[];
  settings: AccountSettings;
  recentSearches: RecentSearch[];
  currentRoute: string;
  selectedDogId: string | null;
  navigate: (route: string, dogId?: string) => void;
  goBack: () => void;

  // Backend Integration State
  backendSession: BackendSessionState;
  sessionAccount: UserSessionAccount | null;
  isAuthenticated: boolean;
  isLoadingSession: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  createAccount: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  overdueAttentionList: OverdueAttentionDog[];
  refreshData: () => Promise<void>;

  // CRUD Operations (Connected to REST API)
  addDog: (dogData: Omit<Dog, 'id' | 'createdAt' | 'updatedAt'>, confirmExistingOwnerId?: string) => Promise<Dog>;
  updateDog: (id: string, updates: Partial<Dog>) => Promise<void>;
  updateDogStatus: (id: string, newStatus: UniversalStatus, effectiveAt?: string, notes?: string) => Promise<void>;
  deleteDog: (id: string) => Promise<void>;
  archiveDog: (id: string, reason?: string) => Promise<void>;
  restoreDog: (id: string) => Promise<void>;

  addBooking: (bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Booking>;
  updateBookingStatus: (id: string, newStatus: UniversalStatus, effectiveAt?: string, notes?: string) => Promise<void>;
  extendBooking: (id: string, newCheckOutAt: string, notes?: string) => Promise<void>;
  confirmOutgoing: (id: string) => Promise<void>;

  updateSettings: (updates: Partial<AccountSettings>) => void;
  addRecentSearch: (query: string, type?: RecentSearch['type']) => void;
  clearRecentSearches: () => void;
  resetAllData: () => void;

  // Toast
  toast: ToastState;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;

  // Filtering
  filterState: FilterState;
  setFilterState: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;

  // Real-time Statistics
  stats: {
    totalDogs: number;
    inHotelCount: number;
    todayCheckIn: number;
    todayCheckOut: number;
    upcomingCount: number;
    completeCount: number;
    cancelCount: number;
    outgoingCount: number;
    receivedCount: number;
    overdueAttentionCount: number;
  };

  // Responsive Device Frame
  deviceWidth: DeviceWidthMode;
  setDeviceWidth: (w: DeviceWidthMode) => void;
  getDogById: (id: string) => Dog | undefined;
  getBookingById: (id: string) => Booking | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_FILTER_STATE: FilterState = {
  searchQuery: '',
  statusFilter: 'ALL',
  dateRangeFilter: 'ALL'
};

// Data mapper helpers
function mapBackendDogToFrontend(d: any): Dog {
  const avatarId = (d.avatarId || d.avatar_id || 'avatar_1') as UniversalAvatarId;
  const ownerName = d.owner?.name || d.owner_name || d.ownerName || 'Unknown Owner';
  const ownerPhone = d.owner?.phone || d.owner_phone || d.ownerPhone || '';
  const ownerEmail = d.owner?.email || d.owner_email || d.ownerEmail || '';
  const status = (d.currentStatus && d.currentStatus !== 'No active booking'
    ? d.currentStatus
    : d.status || 'RECEIVED') as UniversalStatus;

  const booking = d.currentBooking;
  const checkInDate = booking?.checkInLocal?.dateFormatted || booking?.checkInAt?.split('T')[0] || d.checkInDate || 'Sep 12, 2026';
  const checkInTime = booking?.checkInLocal?.timeFormatted || d.checkInTime || '10:00 AM';
  const checkOutDate = booking?.checkOutLocal?.dateFormatted || booking?.checkOutAt?.split('T')[0] || d.checkOutDate || 'Sep 15, 2026';
  const checkOutTime = booking?.checkOutLocal?.timeFormatted || d.checkOutTime || '12:00 PM';

  return {
    id: d.id,
    name: d.name,
    avatarId,
    breed: d.breed,
    dob: d.dateOfBirth || d.date_of_birth || d.dob,
    age: d.dateOfBirth ? `${Math.max(1, new Date().getFullYear() - new Date(d.dateOfBirth).getFullYear())} yrs` : (d.age || '2 yrs'),
    gender: d.gender || 'Male',
    weightKg: d.weightKg !== undefined ? d.weightKg : (d.weight_kg ? parseFloat(d.weight_kg) : undefined),
    ownerName,
    ownerPhone,
    ownerEmail,
    status,
    notes: d.specialNotes || d.special_notes || d.notes,
    checkInDate,
    checkInTime,
    checkOutDate,
    checkOutTime,
    createdAt: d.createdAt || d.created_at || new Date().toISOString(),
    updatedAt: d.updatedAt || d.updated_at || new Date().toISOString()
  };
}

function mapBackendBookingToFrontend(b: any): Booking {
  return {
    id: b.id,
    dogId: b.dogId || b.dog_id,
    checkInDate: b.checkInLocal?.dateFormatted || b.checkInAt?.split('T')[0] || b.check_in_at?.split('T')[0] || 'Sep 12, 2026',
    checkInTime: b.checkInLocal?.timeFormatted || '10:00 AM',
    checkOutDate: b.checkOutLocal?.dateFormatted || b.checkOutAt?.split('T')[0] || b.check_out_at?.split('T')[0] || 'Sep 15, 2026',
    checkOutTime: b.checkOutLocal?.timeFormatted || '12:00 PM',
    status: (b.currentStatus || b.current_status || b.status || 'UPCOMING') as UniversalStatus,
    services: Array.isArray(b.services) ? b.services : (typeof b.services === 'string' ? JSON.parse(b.services) : []),
    notes: b.notes,
    durationNights: b.duration?.nights || b.durationNights || 1,
    createdAt: b.createdAt || b.created_at || new Date().toISOString(),
    updatedAt: b.updatedAt || b.updated_at || new Date().toISOString()
  };
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dogs, setDogs] = useState<Dog[]>(() => storageService.getDogs());
  const [bookings, setBookings] = useState<Booking[]>(() => storageService.getBookings());
  const [settings, setSettings] = useState<AccountSettings>(() => storageService.getSettings());
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>(() => storageService.getRecentSearches());
  const [overdueAttentionList, setOverdueAttentionList] = useState<OverdueAttentionDog[]>([]);

  const [sessionAccount, setSessionAccount] = useState<UserSessionAccount | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoadingSession, setIsLoadingSession] = useState<boolean>(true);

  // Backend session state
  const [backendSession, setBackendSession] = useState<BackendSessionState>({
    isConnected: false,
    isAuthenticating: true,
    staffEmail: null,
    hotelName: 'Oscar Dog Hotel',
    lastSyncAt: null,
    error: null
  });

  // Routing with history stack
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return window.location.hash ? window.location.hash.slice(1) : '/dashboard';
  });
  const [selectedDogId, setSelectedDogId] = useState<string | null>(() => {
    const hash = window.location.hash.slice(1);
    if (hash.startsWith('/dogs/') && hash !== '/dogs/new') {
      return hash.replace('/dogs/', '');
    }
    return null;
  });
  const [historyStack, setHistoryStack] = useState<string[]>(['/dashboard']);

  // Toast
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: '',
    type: 'success'
  });

  const [filterState, setFilterState] = useState<FilterState>(INITIAL_FILTER_STATE);
  const [deviceWidth, setDeviceWidth] = useState<DeviceWidthMode>('responsive');

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3500);
  }, []);

  // Fetch / synchronize all data from the REST API
  const refreshData = useCallback(async () => {
    try {
      const [backendDogs, backendBookings, dashboardData] = await Promise.all([
        api.dogs.listDogs(),
        api.bookings.listBookings(),
        api.dashboard.getDashboardMetrics()
      ]);

      if (Array.isArray(backendDogs)) {
        const mappedDogs = backendDogs.map(mapBackendDogToFrontend);
        setDogs(mappedDogs);
        storageService.saveDogs(mappedDogs);
      }

      if (Array.isArray(backendBookings)) {
        const mappedBookings = backendBookings.map(mapBackendBookingToFrontend);
        setBookings(mappedBookings);
        storageService.saveBookings(mappedBookings);
      }

      if (dashboardData?.overdueAttentionList) {
        setOverdueAttentionList(dashboardData.overdueAttentionList as any);
      }

      setBackendSession((prev) => ({
        ...prev,
        isConnected: true,
        lastSyncAt: new Date().toLocaleTimeString(),
        error: null
      }));
    } catch (err: any) {
      console.warn('[API SYNC] Could not refresh from backend, utilizing cached storage:', err);
      setBackendSession((prev) => ({
        ...prev,
        isConnected: false,
        error: err.message || 'API unreachable'
      }));
    }
  }, []);

  // Initialize backend session on startup (Persistent Login / Auto Login)
  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      try {
        setIsLoadingSession(true);
        const account = await api.auth.validateSession();
        if (isMounted) {
          if (account) {
            setSessionAccount(account);
            setIsAuthenticated(true);
            setBackendSession({
              isConnected: true,
              isAuthenticating: false,
              staffEmail: account.identifier,
              hotelName: account.hotelName || 'Oscar Dog Hotel',
              lastSyncAt: new Date().toLocaleTimeString(),
              error: null
            });
            await refreshData();
          } else {
            setSessionAccount(null);
            setIsAuthenticated(false);
            setBackendSession({
              isConnected: false,
              isAuthenticating: false,
              staffEmail: null,
              hotelName: 'Oscar Dog Hotel',
              lastSyncAt: null,
              error: null
            });
          }
        }
      } catch (err: any) {
        if (isMounted) {
          console.warn('[BACKEND AUTH] Session check failed:', err);
          setSessionAccount(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (isMounted) {
          setIsLoadingSession(false);
        }
      }
    }

    initSession();
    return () => {
      isMounted = false;
    };
  }, [refreshData]);

  // Midnight / Periodic refresh to keep TODAY dynamic
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, 60000);
    return () => clearInterval(interval);
  }, [refreshData]);

  const login = async (identifier: string, password: string) => {
    const res = await api.auth.login(identifier, password);
    setSessionAccount(res.account);
    setIsAuthenticated(true);
    setBackendSession({
      isConnected: true,
      isAuthenticating: false,
      staffEmail: res.account.identifier,
      hotelName: res.account.hotelName || 'Oscar Dog Hotel',
      lastSyncAt: new Date().toLocaleTimeString(),
      error: null
    });
    showToast(`Welcome back, ${res.account.displayName}!`, 'success');
    await refreshData();
    navigate('/dashboard');
  };

  const createAccount = async (identifier: string, password: string) => {
    const res = await api.auth.createAccount(identifier, password);
    setSessionAccount(res.account);
    setIsAuthenticated(true);
    setBackendSession({
      isConnected: true,
      isAuthenticating: false,
      staffEmail: res.account.identifier,
      hotelName: 'Personal Account',
      lastSyncAt: new Date().toLocaleTimeString(),
      error: null
    });
    showToast('Account registered successfully!', 'success');
    await refreshData();
    navigate('/dashboard');
  };

  const logout = async () => {
    await api.auth.logout();
    setSessionAccount(null);
    setIsAuthenticated(false);
    setDogs([]);
    setBookings([]);
    showToast('Logged out successfully.', 'info');
  };

  // Realtime multi-device database subscription
  useEffect(() => {
    const channel = supabase
      .channel('oscar-db-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dogs' }, () => {
        refreshData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        refreshData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'owners' }, () => {
        refreshData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'status_history' }, () => {
        refreshData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshData]);

  // Sync route with URL hash
  const navigate = useCallback((route: string, dogId?: string) => {
    let finalRoute = route;
    if (dogId) {
      finalRoute = `/dogs/${dogId}`;
      setSelectedDogId(dogId);
    } else if (route.startsWith('/dogs/') && route !== '/dogs/new') {
      setSelectedDogId(route.replace('/dogs/', ''));
    } else {
      setSelectedDogId(null);
    }

    // Automatically clear search query when switching routes
    setFilterState((prev) => ({ ...prev, searchQuery: '' }));

    setHistoryStack((prev) => [...prev, finalRoute]);
    setCurrentRoute(finalRoute);
    window.location.hash = finalRoute;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const goBack = useCallback(() => {
    // Automatically clear search query when navigating back
    setFilterState((prev) => ({ ...prev, searchQuery: '' }));

    if (historyStack.length > 1) {
      const newStack = [...historyStack];
      newStack.pop();
      const prev = newStack[newStack.length - 1];
      setHistoryStack(newStack);
      setCurrentRoute(prev);
      window.location.hash = prev;
      if (prev.startsWith('/dogs/') && prev !== '/dogs/new') {
        setSelectedDogId(prev.replace('/dogs/', ''));
      }
    } else {
      navigate('/dashboard');
    }
  }, [historyStack, navigate]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash ? window.location.hash.slice(1) : '/dashboard';
      setCurrentRoute(hash);
      setFilterState((prev) => ({ ...prev, searchQuery: '' }));
      if (hash.startsWith('/dogs/') && hash !== '/dogs/new') {
        setSelectedDogId(hash.replace('/dogs/', ''));
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // CRUD Operations connected to REST API
  const addDog = async (
    dogData: Omit<Dog, 'id' | 'createdAt' | 'updatedAt'>,
    confirmExistingOwnerId?: string
  ): Promise<Dog> => {
    try {
      const createdBackendDog = await api.dogs.createDog({
        name: dogData.name,
        breed: dogData.breed,
        dateOfBirth: dogData.dob,
        gender: dogData.gender,
        weightKg: dogData.weightKg,
        avatarId: dogData.avatarId,
        specialNotes: dogData.notes,
        ownerName: dogData.ownerName,
        ownerPhone: dogData.ownerPhone,
        ownerEmail: dogData.ownerEmail,
        confirmExistingOwnerId
      });

      const newDog = mapBackendDogToFrontend(createdBackendDog);
      setDogs((prev) => [newDog, ...prev]);
      showToast(`Dog profile for "${newDog.name}" saved to database!`, 'success');
      await refreshData();
      return newDog;
    } catch (err: any) {
      // Re-throw ApiError so callers (e.g. NewProfilePage) can inspect error code (e.g. OWNER_PHONE_CONFLICT)
      if (err instanceof ApiError) {
        throw err;
      }
      showToast(err.message || 'Failed to create dog', 'error');
      throw err;
    }
  };

  const updateDog = async (id: string, updates: Partial<Dog>) => {
    try {
      await api.dogs.updateDog(id, {
        name: updates.name,
        breed: updates.breed,
        dateOfBirth: updates.dob,
        gender: updates.gender,
        weightKg: updates.weightKg,
        avatarId: updates.avatarId,
        specialNotes: updates.notes
      });
      showToast('Dog information updated in database!', 'success');
      await refreshData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update dog', 'error');
      throw err;
    }
  };

  const updateDogStatus = async (
    id: string,
    newStatus: UniversalStatus,
    effectiveAt: string = new Date().toISOString(),
    notes?: string
  ) => {
    try {
      // Find active booking for this dog
      const activeBooking = bookings.find((b) => b.dogId === id);

      if (activeBooking) {
        await api.bookings.updateBookingStatus(activeBooking.id, newStatus, effectiveAt, notes);
      }
      showToast(`Status updated to "${newStatus.replace('_', ' ')}"`, 'success');
      await refreshData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
      throw err;
    }
  };

  const deleteDog = async (id: string) => {
    try {
      await api.dogs.archiveDog(id, 'Deleted by staff');
      showToast('Dog profile archived successfully.', 'info');
      await refreshData();
      navigate('/dogs');
    } catch (err: any) {
      showToast(err.message || 'Failed to remove dog', 'error');
    }
  };

  const archiveDog = async (id: string, reason?: string) => {
    try {
      await api.dogs.archiveDog(id, reason);
      showToast('Dog profile archived.', 'info');
      await refreshData();
    } catch (err: any) {
      showToast(err.message || 'Failed to archive dog', 'error');
      throw err;
    }
  };

  const restoreDog = async (id: string) => {
    try {
      await api.dogs.restoreDog(id);
      showToast('Dog profile restored successfully!', 'success');
      await refreshData();
    } catch (err: any) {
      showToast(err.message || 'Failed to restore dog', 'error');
      throw err;
    }
  };

  const addBooking = async (
    bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Booking> => {
    try {
      const createdBackendBooking = await api.bookings.createBooking({
        dogId: bookingData.dogId,
        checkInAt: new Date(bookingData.checkInDate).toISOString(),
        checkOutAt: new Date(bookingData.checkOutDate).toISOString(),
        status: bookingData.status,
        services: bookingData.services,
        notes: bookingData.notes
      });

      const newBooking = mapBackendBookingToFrontend(createdBackendBooking);
      setBookings((prev) => [newBooking, ...prev]);
      showToast('Booking reservation confirmed!', 'success');
      await refreshData();
      return newBooking;
    } catch (err: any) {
      if (err instanceof ApiError) {
        throw err;
      }
      showToast(err.message || 'Failed to create booking', 'error');
      throw err;
    }
  };

  const updateBookingStatus = async (
    id: string,
    newStatus: UniversalStatus,
    effectiveAt: string = new Date().toISOString(),
    notes?: string
  ) => {
    try {
      await api.bookings.updateBookingStatus(id, newStatus, effectiveAt, notes);
      showToast(`Booking status updated to "${newStatus}"`, 'success');
      await refreshData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update booking status', 'error');
      throw err;
    }
  };

  const extendBooking = async (id: string, newCheckOutAt: string, notes?: string) => {
    try {
      await api.bookings.extendBooking(id, newCheckOutAt, notes);
      showToast('Stay extended successfully!', 'success');
      await refreshData();
    } catch (err: any) {
      showToast(err.message || 'Failed to extend stay', 'error');
      throw err;
    }
  };

  const confirmOutgoing = async (id: string) => {
    try {
      await api.bookings.confirmOutgoing(id);
      showToast('Departure confirmed for dog!', 'success');
      await refreshData();
    } catch (err: any) {
      showToast(err.message || 'Failed to confirm outgoing', 'error');
      throw err;
    }
  };

  const updateSettings = (updates: Partial<AccountSettings>) => {
    const updated = { ...settings, ...updates };
    setSettings(updated);
    storageService.saveSettings(updated);
    showToast('Account settings updated.', 'success');
  };

  const addRecentSearch = (query: string, type: RecentSearch['type'] = 'General') => {
    if (!query.trim()) return;
    const existing = recentSearches.filter(
      (s) => s.query.toLowerCase() !== query.toLowerCase()
    );
    const newSearch: RecentSearch = {
      id: `search_${Date.now()}`,
      query: query.trim(),
      type,
      timestamp: 'Just now'
    };
    const updated = [newSearch, ...existing].slice(0, 10);
    setRecentSearches(updated);
    storageService.saveRecentSearches(updated);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    storageService.saveRecentSearches([]);
    showToast('Recent searches cleared.', 'info');
  };

  const resetFilters = () => {
    setFilterState(INITIAL_FILTER_STATE);
  };

  const resetAllData = () => {
    showToast('Reset Demo Data is disabled in production mode.', 'info');
  };

  const getDogById = (id: string) => dogs.find((d) => d.id === id);
  const getBookingById = (id: string) => bookings.find((b) => b.id === id);

  // Dynamic real-time statistics
  const stats = useMemo(() => {
    const inHotel = dogs.filter((d) => d.status === 'IN_HOTEL').length;
    const received = dogs.filter((d) => d.status === 'RECEIVED').length;
    const upcoming = dogs.filter((d) => d.status === 'UPCOMING').length;
    const complete = dogs.filter((d) => d.status === 'COMPLETE').length;
    const cancel = dogs.filter((d) => d.status === 'CANCEL').length;
    const outgoing = dogs.filter((d) => d.status === 'OUTGOING').length;

    const checkInToday = dogs.filter(
      (d) => d.status === 'RECEIVED' || d.status === 'IN_HOTEL'
    ).length;
    const checkOutToday = dogs.filter((d) => d.status === 'OUTGOING').length;

    // Total dogs strictly counts dogs currently present: IN_HOTEL + OUTGOING
    const activeTotalDogs = inHotel + outgoing;

    return {
      totalDogs: activeTotalDogs,
      inHotelCount: inHotel,
      todayCheckIn: checkInToday,
      todayCheckOut: checkOutToday,
      upcomingCount: upcoming,
      completeCount: complete,
      cancelCount: cancel,
      outgoingCount: outgoing,
      receivedCount: received,
      overdueAttentionCount: overdueAttentionList.length
    };
  }, [dogs, overdueAttentionList]);

  return (
    <AppContext.Provider
      value={{
        dogs,
        bookings,
        settings,
        recentSearches,
        currentRoute,
        selectedDogId,
        navigate,
        goBack,
        backendSession,
        sessionAccount,
        isAuthenticated,
        isLoadingSession,
        login,
        createAccount,
        logout,
        overdueAttentionList,
        refreshData,
        addDog,
        updateDog,
        updateDogStatus,
        deleteDog,
        archiveDog,
        restoreDog,
        addBooking,
        updateBookingStatus,
        extendBooking,
        confirmOutgoing,
        updateSettings,
        addRecentSearch,
        clearRecentSearches,
        resetAllData,
        toast,
        showToast,
        filterState,
        setFilterState,
        resetFilters,
        stats,
        deviceWidth,
        setDeviceWidth,
        getDogById,
        getBookingById
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
