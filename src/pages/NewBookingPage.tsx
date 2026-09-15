import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { DogAvatar } from '../components/common/DogAvatar';
import { StatusSelector } from '../components/common/StatusSelector';
import { UniversalStatus } from '../types';
import { Plus, Check, Scissors, Pill, UtensilsCrossed, Footprints, Award, ShowerHead } from 'lucide-react';

export const NewBookingPage: React.FC = () => {
  const { dogs, addBooking, navigate, showToast } = useApp();

  const [selectedDogId, setSelectedDogId] = useState<string>(dogs[0]?.id || '');
  const [checkInDate, setCheckInDate] = useState<string>('2026-09-12');
  const [checkInTime, setCheckInTime] = useState<string>('10:15 AM');
  const [checkOutDate, setCheckOutDate] = useState<string>('2026-09-15');
  const [checkOutTime, setCheckOutTime] = useState<string>('10:00 AM');
  const [bookingStatus, setBookingStatus] = useState<UniversalStatus>('UPCOMING');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const selectedDog = useMemo(() => {
    return dogs.find((d) => d.id === selectedDogId) || dogs[0];
  }, [dogs, selectedDogId]);

  // Duration calculation
  const durationNights = useMemo(() => {
    if (!checkInDate || !checkOutDate) return 0;
    const d1 = new Date(checkInDate).getTime();
    const d2 = new Date(checkOutDate).getTime();
    const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
    return diff >= 0 ? diff : 0;
  }, [checkInDate, checkOutDate]);

  const servicesList = [
    { id: 'bathing', label: 'Bathing', icon: ShowerHead },
    { id: 'grooming', label: 'Grooming', icon: Scissors },
    { id: 'medication', label: 'Medication', icon: Pill },
    { id: 'special_food', label: 'Special Food', icon: UtensilsCrossed },
    { id: 'extra_walks', label: 'Extra Walks', icon: Footprints },
    { id: 'training', label: 'Training', icon: Award }
  ];

  const toggleService = (serviceId: string) => {
    if (selectedServices.includes(serviceId)) {
      setSelectedServices(selectedServices.filter((s) => s !== serviceId));
    } else {
      setSelectedServices([...selectedServices, serviceId]);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);

    if (!selectedDog) {
      showToast('Please select a dog for this booking.', 'error');
      return;
    }
    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      showToast('Check-out date must be after check-in date.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await addBooking({
        dogId: selectedDog.id,
        checkInDate,
        checkInTime,
        checkOutDate,
        checkOutTime,
        status: bookingStatus,
        services: selectedServices,
        notes: notes.trim() || undefined,
        durationNights
      });

      navigate('/bookings');
    } catch (err: any) {
      if (err.code === 'BOOKING_OVERLAP') {
        setBookingError('Schedule Conflict: This dog already has an active booking that overlaps with these dates.');
      } else if (err.code === 'BOOKING_ARCHIVED_DOG_BLOCKED') {
        setBookingError('Archived Dog: Cannot create bookings for archived profiles. Please restore the profile first.');
      } else {
        setBookingError(err.message || 'Failed to create booking');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="new-booking-page" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Page Header */}
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1.15 }}>
          New Booking
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
          Create a new reservation
        </p>
      </div>

      <form onSubmit={handleCreateBooking} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Select Dog Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                Select Dog
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                Choose from existing dog profiles
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/dogs/new')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: 'var(--color-primary)',
                color: '#ffffff',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 700
              }}
            >
              <Plus size={14} />
              <span>Add New Dog</span>
            </button>
          </div>

          {/* Dog Selector dropdown */}
          <div style={{ position: 'relative' }}>
            <select
              value={selectedDogId}
              onChange={(e) => setSelectedDogId(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1.5px solid var(--color-border)',
                backgroundColor: '#ffffff',
                fontSize: '0.92rem',
                fontWeight: 600,
                color: 'var(--color-text-primary)'
              }}
            >
              {dogs.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.breed} - {d.ownerName})
                </option>
              ))}
            </select>
          </div>

          {/* Selected Dog Preview Card */}
          {selectedDog && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                backgroundColor: '#f7fbff',
                borderRadius: '12px',
                border: '1px solid var(--color-border-subtle)'
              }}
            >
              <DogAvatar avatarId={selectedDog.avatarId} size="md" />
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                  {selectedDog.name}
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                  {selectedDog.breed} • {selectedDog.age || '2 yrs'} • {selectedDog.gender}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Booking Dates Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
              Booking Dates
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
              Select check-in and check-out dates
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                Check-In Date *
              </label>
              <input
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1.5px solid var(--color-border)',
                  fontSize: '0.88rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                Check-Out Date *
              </label>
              <input
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1.5px solid var(--color-border)',
                  fontSize: '0.88rem'
                }}
              />
            </div>
          </div>

          {/* Time pickers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                Check-In Time
              </label>
              <input
                type="text"
                value={checkInTime}
                onChange={(e) => setCheckInTime(e.target.value)}
                placeholder="10:15 AM"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                Check-Out Time
              </label>
              <input
                type="text"
                value={checkOutTime}
                onChange={(e) => setCheckOutTime(e.target.value)}
                placeholder="10:00 AM"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          </div>

          {/* Duration Badge banner */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              backgroundColor: '#eaf2ff',
              borderRadius: '10px',
              border: '1px solid #c7dcff'
            }}
          >
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#07133d' }}>
              Total Duration:
            </span>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1267df' }}>
              {durationNights} {durationNights === 1 ? 'night' : 'nights'} stay
            </span>
          </div>
        </div>

        {/* Initial Status Selection */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
              Booking Status
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
              Set the reservation status
            </p>
          </div>

          <StatusSelector
            currentStatus={bookingStatus}
            onSelect={(st) => setBookingStatus(st)}
          />
        </div>

        {/* Additional Services Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
              Additional Services
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
              Select any extra services (optional)
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '10px'
            }}
          >
            {servicesList.map((srv) => {
              const isSelected = selectedServices.includes(srv.id);
              const Icon = srv.icon;
              return (
                <button
                  key={srv.id}
                  type="button"
                  onClick={() => toggleService(srv.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px',
                    borderRadius: '10px',
                    border: `1.5px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    backgroundColor: isSelected ? '#eaf2ff' : '#ffffff',
                    color: isSelected ? 'var(--color-primary)' : 'var(--color-text-primary)',
                    fontSize: '0.86rem',
                    fontWeight: isSelected ? 700 : 500,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Icon size={18} color={isSelected ? 'var(--color-primary)' : '#71809d'} />
                  <span>{srv.label}</span>
                  {isSelected && <Check size={14} style={{ marginLeft: 'auto' }} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes (Optional) */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '16px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                Notes (Optional)
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                {notes.length}/500
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
              Add any special instructions
            </p>
          </div>

          <textarea
            placeholder="e.g. Dietary needs, behavior notes, medication details..."
            rows={3}
            maxLength={500}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: '8px',
              border: '1.5px solid var(--color-border)',
              fontSize: '0.9rem',
              resize: 'vertical'
            }}
          />
        </div>

        {/* Error Banner */}
        {bookingError && (
          <div style={{
            backgroundColor: '#fdebee',
            border: '1px solid #f9cbd2',
            color: '#c2233f',
            padding: '12px 14px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>⚠️</span>
            <span>{bookingError}</span>
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          className="btn-primary"
          style={{ marginTop: '4px', height: '50px' }}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating Booking...' : 'Create Booking'}
        </button>
      </form>
    </div>
  );
};
