import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { DogAvatar } from '../components/common/DogAvatar';
import { StatusBadge } from '../components/common/StatusBadge';
import { UniversalStatus } from '../types';
import { Plus, ChevronLeft, ChevronRight, Phone } from 'lucide-react';

export const BookingsPage: React.FC = () => {
  const { bookings, dogs, navigate } = useApp();

  const [activeStatus, setActiveStatus] = useState<UniversalStatus | 'ALL'>('ALL');
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-12');

  // Link bookings to dogs
  const enrichedBookings = useMemo(() => {
    return bookings.map((b) => {
      const dog = dogs.find((d) => d.id === b.dogId);
      return {
        ...b,
        dog
      };
    });
  }, [bookings, dogs]);

  // Filter based on status
  const filteredBookings = useMemo(() => {
    return enrichedBookings.filter((b) => {
      if (activeStatus === 'ALL') return true;
      return b.status === activeStatus;
    });
  }, [enrichedBookings, activeStatus]);

  // Tab counts
  const counts = useMemo(() => {
    return {
      ALL: bookings.length,
      UPCOMING: bookings.filter((b) => b.status === 'UPCOMING').length,
      IN_HOTEL: bookings.filter((b) => b.status === 'IN_HOTEL').length,
      OUTGOING: bookings.filter((b) => b.status === 'OUTGOING').length,
      CANCEL: bookings.filter((b) => b.status === 'CANCEL').length,
      RECEIVED: bookings.filter((b) => b.status === 'RECEIVED').length,
      COMPLETE: bookings.filter((b) => b.status === 'COMPLETE').length
    };
  }, [bookings]);

  const filterTabs: { label: string; key: UniversalStatus | 'ALL'; count: number }[] = [
    { label: 'All', key: 'ALL', count: counts.ALL },
    { label: 'Upcoming', key: 'UPCOMING', count: counts.UPCOMING },
    { label: 'In Hotel', key: 'IN_HOTEL', count: counts.IN_HOTEL },
    { label: 'Outgoing', key: 'OUTGOING', count: counts.OUTGOING },
    { label: 'Cancel', key: 'CANCEL', count: counts.CANCEL },
    { label: 'Received', key: 'RECEIVED', count: counts.RECEIVED },
    { label: 'Complete', key: 'COMPLETE', count: counts.COMPLETE }
  ];

  const shiftDate = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
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
            {selectedDate === '2026-09-12' ? 'Today, Sep 12, 2026' : selectedDate}
          </p>
          <button
            type="button"
            onClick={() => setSelectedDate('2026-09-12')}
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              color: 'var(--color-primary)',
              textDecoration: 'underline'
            }}
          >
            Jump to Today
          </button>
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
