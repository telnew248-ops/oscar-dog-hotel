import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DogAvatar } from '../components/common/DogAvatar';
import { StatusBadge } from '../components/common/StatusBadge';
import { StatusSelector } from '../components/common/StatusSelector';
import { UniversalStatus } from '../types';
import {
  ChevronLeft,
  Phone,
  Mail,
  Calendar,
  User,
  Info,
  Edit3,
  Check,
  Trash2
} from 'lucide-react';

export const DogDetailsPage: React.FC = () => {
  const {
    selectedDogId,
    getDogById,
    updateDog,
    updateDogStatus,
    deleteDog,
    goBack,
    bookings,
    extendBooking,
    confirmOutgoing,
    showToast
  } = useApp();
  const dog = selectedDogId ? getDogById(selectedDogId) : undefined;
  const activeBooking = dog ? bookings.find((b) => b.dogId === dog.id) : undefined;

  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extendCheckOutDate, setExtendCheckOutDate] = useState('');
  const [extendNotes, setExtendNotes] = useState('');
  const [isExtending, setIsExtending] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(dog?.name || '');
  const [editBreed, setEditBreed] = useState(dog?.breed || '');
  const [editAge, setEditAge] = useState(dog?.age || '');
  const [editWeight, setEditWeight] = useState(dog?.weightKg?.toString() || '');
  const [editNotes, setEditNotes] = useState(dog?.notes || '');
  const [editOwnerName, setEditOwnerName] = useState(dog?.ownerName || '');
  const [editOwnerPhone, setEditOwnerPhone] = useState(dog?.ownerPhone || '');
  const [editOwnerEmail, setEditOwnerEmail] = useState(dog?.ownerEmail || '');
  const [currentStatus, setCurrentStatus] = useState<UniversalStatus>(dog?.status || 'IN_HOTEL');

  if (!dog) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '8px' }}>Dog Not Found</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
          The requested dog profile does not exist or may have been removed.
        </p>
        <button type="button" onClick={goBack} className="btn-primary" style={{ maxWidth: '200px', margin: '0 auto' }}>
          Return to Dogs
        </button>
      </div>
    );
  }

  const handleStatusChange = (newStatus: UniversalStatus) => {
    setCurrentStatus(newStatus);
    updateDogStatus(dog.id, newStatus);
  };

  const handleSaveChanges = () => {
    updateDog(dog.id, {
      name: editName.trim() || dog.name,
      breed: editBreed.trim() || dog.breed,
      age: editAge.trim() || dog.age,
      weightKg: editWeight ? parseFloat(editWeight) : dog.weightKg,
      notes: editNotes.trim(),
      ownerName: editOwnerName.trim() || dog.ownerName,
      ownerPhone: editOwnerPhone.trim() || dog.ownerPhone,
      ownerEmail: editOwnerEmail.trim() || dog.ownerEmail,
      status: currentStatus
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${dog.name}'s profile? This action cannot be undone.`)) {
      deleteDog(dog.id);
    }
  };

  const handleExtendStay = async () => {
    if (!activeBooking) {
      showToast('No active stay to extend.', 'error');
      return;
    }
    if (!extendCheckOutDate) {
      showToast('Please select a new check-out date.', 'error');
      return;
    }

    setIsExtending(true);
    try {
      await extendBooking(
        activeBooking.id,
        new Date(extendCheckOutDate).toISOString(),
        extendNotes.trim() || undefined
      );
      setShowExtendModal(false);
      setExtendCheckOutDate('');
      setExtendNotes('');
    } catch (err: any) {
      showToast(err.message || 'Failed to extend stay', 'error');
    } finally {
      setIsExtending(false);
    }
  };

  const handleConfirmDeparture = async () => {
    if (!activeBooking) return;
    try {
      await confirmOutgoing(activeBooking.id);
      setCurrentStatus('OUTGOING');
    } catch (err: any) {
      showToast(err.message || 'Failed to confirm departure', 'error');
    }
  };

  return (
    <div className="dog-details-page" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Page Navigation Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          type="button"
          onClick={goBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            backgroundColor: '#ffffff',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)'
          }}
          aria-label="Back"
        >
          <ChevronLeft size={22} color="var(--color-text-primary)" />
        </button>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1.15 }}>
            Dog Details
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
            View and manage dog information
          </p>
        </div>
      </div>

      {/* Dog Summary Card */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px' }}>
        <DogAvatar avatarId={dog.avatarId} size="xl" />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--color-text-primary)' }}>
              {dog.name}
            </h3>
            <StatusBadge status={dog.status} size="sm" />
          </div>

          <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
            {dog.breed}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
            <span style={{ background: '#edf2fa', padding: '3px 8px', borderRadius: '6px' }}>
              {dog.gender}
            </span>
            <span style={{ background: '#edf2fa', padding: '3px 8px', borderRadius: '6px' }}>
              {dog.age || '3 years old'}
            </span>
            {dog.weightKg && (
              <span style={{ background: '#edf2fa', padding: '3px 8px', borderRadius: '6px' }}>
                {dog.weightKg} kg
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Booking Information Card */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={18} color="var(--color-primary)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            Booking Information
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#f7fbff', padding: '12px', borderRadius: '12px' }}>
          <div>
            <p style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', marginBottom: '2px' }}>Check-In</p>
            <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {dog.checkInDate}
            </p>
            <p style={{ fontSize: '0.76rem', color: 'var(--color-text-secondary)' }}>
              {dog.checkInTime || '10:15 AM'}
            </p>
          </div>

          <div>
            <p style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', marginBottom: '2px' }}>Check-Out</p>
            <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {dog.checkOutDate}
            </p>
            <p style={{ fontSize: '0.76rem', color: 'var(--color-text-secondary)' }}>
              {dog.checkOutTime || '10:00 AM'}
            </p>
          </div>
        </div>
      </div>

      {/* Owner Information Card */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={18} color="var(--color-primary)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            Owner Information
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Owner Name</p>
            <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {dog.ownerName}
            </p>
          </div>

          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Phone Number</p>
            <a
              href={`tel:${dog.ownerPhone}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.92rem',
                fontWeight: 600,
                color: 'var(--color-primary)'
              }}
            >
              <Phone size={14} />
              <span>{dog.ownerPhone}</span>
            </a>
          </div>

          {dog.ownerEmail && (
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Email Address</p>
              <a
                href={`mailto:${dog.ownerEmail}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  color: 'var(--color-primary)'
                }}
              >
                <Mail size={14} />
                <span>{dog.ownerEmail}</span>
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Booking Status Management Panel */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            Booking Status
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
            Update the current status for this booking across all screens
          </p>
        </div>

        <StatusSelector
          currentStatus={dog.status}
          onSelect={handleStatusChange}
        />
      </div>

      {/* Operational Stay Actions */}
      {activeBooking && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            Stay Management
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowExtendModal(true)}
              style={{ padding: '10px', fontSize: '0.85rem' }}
            >
              Extend Stay
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleConfirmDeparture}
              style={{ padding: '10px', fontSize: '0.85rem', backgroundColor: '#1267df' }}
            >
              Confirm Departure
            </button>
          </div>
        </div>
      )}

      {/* Additional Information Card */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Info size={18} color="var(--color-primary)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            Additional Information
          </h3>
        </div>

        {isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                Dog Name
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  fontSize: '0.9rem'
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                Breed
              </label>
              <input
                type="text"
                value={editBreed}
                onChange={(e) => setEditBreed(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  fontSize: '0.9rem'
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                Age
              </label>
              <input
                type="text"
                value={editAge}
                onChange={(e) => setEditAge(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  fontSize: '0.9rem'
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                Weight (kg)
              </label>
              <input
                type="number"
                value={editWeight}
                onChange={(e) => setEditWeight(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  fontSize: '0.9rem'
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                Owner Name
              </label>
              <input
                type="text"
                value={editOwnerName}
                onChange={(e) => setEditOwnerName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  fontSize: '0.9rem'
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                Owner Phone
              </label>
              <input
                type="tel"
                value={editOwnerPhone}
                onChange={(e) => setEditOwnerPhone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  fontSize: '0.9rem'
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                Owner Email
              </label>
              <input
                type="email"
                value={editOwnerEmail}
                onChange={(e) => setEditOwnerEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  fontSize: '0.9rem'
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                Special Notes
              </label>
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Breed</span>
              <span style={{ fontWeight: 600 }}>{dog.breed}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Weight</span>
              <span style={{ fontWeight: 600 }}>{dog.weightKg ? `${dog.weightKg} kg` : 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Age</span>
              <span style={{ fontWeight: 600 }}>{dog.age || '3 years old'}</span>
            </div>
            {dog.notes && (
              <div style={{ marginTop: '6px', padding: '10px', background: '#f7fbff', borderRadius: '8px' }}>
                <p style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '2px' }}>
                  Special Notes
                </p>
                <p style={{ fontSize: '0.84rem', color: 'var(--color-text-primary)' }}>{dog.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
        {isEditing ? (
          <button
            type="button"
            className="btn-primary"
            onClick={handleSaveChanges}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <Check size={18} />
            <span>Save Changes</span>
          </button>
        ) : (
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setIsEditing(true)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <Edit3 size={16} />
            <span>Edit Details</span>
          </button>
        )}

        <button
          type="button"
          onClick={handleDelete}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px',
            color: '#df2145',
            fontSize: '0.88rem',
            fontWeight: 600,
            background: 'transparent'
          }}
        >
          <Trash2 size={16} />
          <span>Delete Profile</span>
        </button>
      </div>

      {/* Extend Stay Modal */}
      {showExtendModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.55)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 9999
        }}>
          <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '24px', backgroundColor: '#ffffff', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
              Extend Stay for {dog.name}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
              Current scheduled checkout: {dog.checkOutDate}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
                  New Check-Out Date *
                </label>
                <input
                  type="date"
                  value={extendCheckOutDate}
                  onChange={(e) => setExtendCheckOutDate(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid var(--color-border)', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
                  Extension Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Flight delay / Owner requested extra days"
                  value={extendNotes}
                  onChange={(e) => setExtendNotes(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid var(--color-border)', fontSize: '0.9rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowExtendModal(false)}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleExtendStay}
                disabled={isExtending}
                style={{ flex: 1.5 }}
              >
                {isExtending ? 'Extending...' : 'Confirm Extension'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
