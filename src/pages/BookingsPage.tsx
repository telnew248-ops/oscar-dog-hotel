import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { DogAvatar } from '../components/common/DogAvatar';
import { StatusBadge } from '../components/common/StatusBadge';
import { UniversalStatus } from '../types';
import { Plus, ChevronLeft, ChevronRight, Phone } from 'lucide-react';
import { getTodayDateString, addDaysToDateString, compareDateStrings, formatDisplayDate } from '../utils/date';
import { getStatusConfig } from '../constants/statuses';

export const BookingsPage: React.FC = () => {
  const { bookings, dogs, navigate } = useApp();

  const todayStr = useMemo(() => getTodayDateString(), []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [activeStatus, setActiveStatus] = useState<UniversalStatus | 'ALL'>('ALL');

  // Link bookings to dogs
  const enrichedBookings = useMemo(() => {
    return bookings.map((b) => {
      const dog = dogs.find((d) => d.id === b.dogId) || b.dog;
      return {
        ...b,
        dog
      };
    });
  }, [bookings, dogs]);

  // Date-Aware Status Rules (Requirements 9, 10, 11, 12, 13)
  const allowedStatuses: UniversalStatus[] = useMemo(() => {
    const cmp = compareDateStrings(selectedDate, todayStr);
    if (cmp < 0) {
      // Past dates: ONLY Complete, Cancel, Received
      return ['COMPLETE', 'CANCEL', 'RECEIVED'];
    } else if (cmp > 0) {
      // Future dates: ONLY Upcoming, Outgoing, In Hotel (in exact order: 1. Upcoming, 2. Outgoing, 3. In Hotel)
      return ['UPCOMING', 'OUTGOING', 'IN_HOTEL'];
    } else {
      // Today: All 6 statuses
      return ['UPCOMING', 'OUTGOING', 'IN_HOTEL', 'RECEIVED', 'COMPLETE', 'CANCEL'];
    }
  }, [selectedDate, todayStr]);

  // Reset active status to 'ALL' if it becomes disallowed on date change
  useEffect(() => {
    if (activeStatus !== 'ALL' && !allowedStatuses.includes(activeStatus)) {
      setActiveStatus('ALL');
    }
  }, [allowedStatuses, activeStatus]);

  // Filter based on activeStatus and date-allowed statuses
  const filteredBookings = useMemo(() => {
    return enrichedBookings.filter((b) => {
      if (activeStatus === 'ALL') {
        return allowedStatuses.includes(b.status);
      }
      return b.status === activeStatus;
    });
  }, [enrichedBookings, activeStatus, allowedStatuses]);

  // Dynamic filter tabs respecting allowedStatuses sequence
  const filterTabs = useMemo(() => {
    const tabs: { label: string; key: UniversalStatus | 'ALL'; count: number }[] = [
      { label: 'All', key: 'ALL', count: enrichedBookings.filter((b) => allowedStatuses.includes(b.status)).length }
    ];

    allowedStatuses.forEach((st) => {
      const count = enrichedBookings.filter((b) => b.status === st).length;
      const config = getStatusConfig(st);
      tabs.push({
        label: config.label,
        key: st,
        count
      });
    });

    return tabs;
  }, [allowedStatuses, enrichedBookings]);

  const shiftDate = (days: number) => {
    setSelectedDate((prev) => addDaysToDateString(prev, days));
  };

  return (
    <div className="bookings-page" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1.15 }}>
            Bookings
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            Manage all reservations, check-ins and check-outs
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/bookings/new')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'var(--color-primary)',
            color: '#ffffff',
            padding: '9px 16px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            fontWeight: 700,
            boxShadow: '0 3px 10px rgba(18, 103, 223, 0.25)'
          }}
        >
          <Plus size={16} strokeWidth={3} />
          <span>New Booking</span>
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="filter-tabs-scroll">
        {filterTabs.map((tab) => {
          const isActive = activeStatus === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              className={`filter-tab ${isActive ? 'active' : ''}`}
              onClick={() => setActiveStatus(tab.key)}
            >
              <span>{tab.label}</span>
              <span className="badge-count">{tab.count}</span>
            </button>
          );
        })}
      </div>

      {/* Date Navigator */}
      <div
        className="card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          backgroundColor: '#ffffff'
        }}
      >
        <button
          type="button"
          onClick={() => shiftDate(-1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: '#edf2fa'
          }}
          aria-label="Previous day"
        >
          <ChevronLeft size={20} color="var(--color-text-primary)" />
        </button>

        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            {selectedDate === todayStr ? `Today, ${formatDisplayDate(selectedDate)}` : formatDisplayDate(selectedDate)}
          </p>
          {selectedDate !== todayStr && (
            <button
              type="button"
              onClick={() => setSelectedDate(todayStr)}
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: 'var(--color-primary)',
                textDecoration: 'underline',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '2px 4px'
              }}
            >
              Jump to Today
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => shiftDate(1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: '#edf2fa'
          }}
          aria-label="Next day"
        >
          <ChevronRight size={20} color="var(--color-text-primary)" />
        </button>
      </div>

      {/* Booking Cards List */}
      {filteredBookings.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '36px 20px' }}>
          <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            No bookings found
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            There are no bookings matching the selected status filter.
          </p>
          <button
            type="button"
            onClick={() => setActiveStatus('ALL')}
            className="btn-secondary"
            style={{ marginTop: '12px' }}
          >
            Show All Bookings
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredBookings.map((booking) => {
            const dog = booking.dog;
            return (
              <div
                key={booking.id}
                className="card"
                onClick={() => {
                  if (dog) navigate(`/dogs/${dog.id}`);
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  padding: '16px',
                  cursor: 'pointer'
                }}
              >
                {/* Dog & Owner Info Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <DogAvatar avatarId={dog?.avatarId} size="md" />
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                        {dog?.name || 'Unknown Dog'}
                      </h3>
                      <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                        {dog?.ownerName || 'Unknown Owner'}
                      </p>
                    </div>
                  </div>

                  {dog?.ownerPhone && (
                    <a
                      href={`tel:${dog.ownerPhone}`}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color: 'var(--color-primary)',
                        padding: '6px 10px',
                        background: '#edf2fa',
                        borderRadius: '8px'
                      }}
                    >
                      <Phone size={12} />
                      <span>{dog.ownerPhone}</span>
                    </a>
                  )}
                </div>

                {/* Dates Row */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px',
                    padding: '10px 12px',
                    backgroundColor: '#f7fbff',
                    borderRadius: '10px'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', display: 'block' }}>
                      Check-In
                    </span>
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      {booking.checkInDate}
                    </span>
                    <span style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', display: 'block' }}>
                      {booking.checkInTime || '10:00 AM'}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', display: 'block' }}>
                      Check-Out
                    </span>
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      {booking.checkOutDate}
                    </span>
                    <span style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', display: 'block' }}>
                      {booking.checkOutTime || '12:00 PM'}
                    </span>
                  </div>
                </div>

                {/* Footer status & duration */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px' }}>
                  <StatusBadge status={booking.status} size="sm" />
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                    {booking.durationNights === 0
                      ? 'Same day'
                      : `${booking.durationNights} ${booking.durationNights === 1 ? 'night' : 'nights'}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
