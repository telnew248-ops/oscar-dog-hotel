import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { storageService } from '../services/storage';
import { api } from '../services/api';
import { Download, LogOut, Code, Camera, Check, Cloud, Database, Mail, Image as ImageIcon, Upload } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, showToast, backendSession, refreshData, sessionAccount, logout } = useApp();

  const [fullName, setFullName] = useState(settings.adminName || 'MD Sakib');
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      showToast('Display name cannot be empty.', 'error');
      return;
    }
    updateSettings({ adminName: fullName.trim() });
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Selected image must be less than 5MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      if (base64) {
        updateSettings({ adminAvatar: base64 });
        showToast('Profile picture updated from gallery!', 'success');
        setIsPhotoModalOpen(false);
      }
    };
    reader.onerror = () => {
      showToast('Failed to load image from gallery', 'error');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleExportData = () => {
    const jsonString = storageService.exportData();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `oscar_dog_hotel_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Data exported successfully!', 'success');
  };

  const handleTriggerCloudBackup = async () => {
    setIsBackingUp(true);
    try {
      const res = await api.backups.triggerBackup();
      showToast(`Encrypted database backup created! (${res.backup.identifier})`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to trigger backup', 'error');
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleExit = async () => {
    if (window.confirm('Are you sure you want to log out of your session?')) {
      await logout();
    }
  };

  const avatarOptions = [
    '/assets/user_avatar.png',
    '/assets/dog_avatar_1.png',
    '/assets/dog_avatar_2.png',
    '/assets/dog_avatar_3.png',
    '/assets/dog_avatar_4.png',
    '/assets/dog_avatar_5.png'
  ];

  return (
    <div className="settings-page" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1.15 }}>
          Account Settings
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
          Manage your account details
        </p>
      </div>

      {/* Profile Picture Section */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            Profile Picture
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
            Update your profile picture from gallery or preset avatars
          </p>
        </div>

        {/* Hidden gallery file input */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleGalleryUpload}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '4px', flexWrap: 'wrap' }}>
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '2.5px solid #ffffff',
              boxShadow: 'var(--shadow-md)',
              backgroundColor: '#eaf1fb',
              flexShrink: 0
            }}
          >
            <img
              src={settings.adminAvatar || '/assets/user_avatar.png'}
              alt={settings.adminName}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/user_avatar.png';
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {/* Choose from Gallery Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#ffffff',
                fontSize: '0.88rem',
                fontWeight: 700,
                padding: '9px 14px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-primary)',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(18, 103, 223, 0.25)'
              }}
            >
              <ImageIcon size={16} />
              <span>Choose from Gallery</span>
            </button>

            {/* Toggle Preset Avatars Button */}
            <button
              type="button"
              onClick={() => setIsPhotoModalOpen(!isPhotoModalOpen)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--color-primary)',
                fontSize: '0.88rem',
                fontWeight: 700,
                padding: '9px 14px',
                borderRadius: '8px',
                backgroundColor: '#e7f1ff',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <Camera size={16} />
              <span>{isPhotoModalOpen ? 'Hide Avatars' : 'Preset Avatars'}</span>
            </button>
          </div>
        </div>

        {/* Photo Selection Tray */}
        {isPhotoModalOpen && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', padding: '12px', background: '#f7fbff', borderRadius: '10px', border: '1px solid #dce7f5', flexWrap: 'wrap' }}>
            {/* Upload Tile */}
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                border: '1.5px dashed var(--color-primary)',
                backgroundColor: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--color-primary)'
              }}
              title="Upload custom image from gallery"
            >
              <Upload size={16} />
            </div>

            {avatarOptions.map((opt, i) => (
              <div
                key={i}
                onClick={() => {
                  updateSettings({ adminAvatar: opt });
                  setIsPhotoModalOpen(false);
                }}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: settings.adminAvatar === opt ? '2.5px solid #1267df' : '1px solid #cbd4e1',
                  boxShadow: settings.adminAvatar === opt ? '0 0 0 2px rgba(18, 103, 223, 0.2)' : 'none'
                }}
              >
                <img src={opt} alt="Option" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Name Section */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            Name
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
            Update your display name
          </p>
        </div>

        <form onSubmit={handleSaveName} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1.5px solid var(--color-border)',
                fontSize: '0.92rem'
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: '#ffffff',
              padding: '10px 18px',
              borderRadius: '8px',
              fontSize: '0.88rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              height: '42px'
            }}
          >
            <Check size={16} />
            <span>Save</span>
          </button>
        </form>
      </div>

      {/* Data Export / Backup */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            Data Export / Backup
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
            Download a copy of your data
          </p>
        </div>

        <p style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)' }}>
          Export your dogs, bookings and other important data as a backup file.
        </p>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleTriggerCloudBackup}
            disabled={isBackingUp}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#f0edff',
              color: '#5336df',
              border: '1px solid #5336df44',
              padding: '10px 16px',
              borderRadius: '8px',
              fontSize: '0.88rem',
              fontWeight: 700
            }}
          >
            <Cloud size={16} />
            <span>{isBackingUp ? 'Encrypting...' : 'Cloud Backup (AES-256)'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportData}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#e6f7f0',
              color: '#16a36a',
              border: '1px solid #16a36a44',
              padding: '10px 16px',
              borderRadius: '8px',
              fontSize: '0.88rem',
              fontWeight: 700
            }}
          >
            <Download size={16} />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {/* Backend & Database Server Status */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database size={18} color="var(--color-primary)" />
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
              Cloud Database & Session
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
              Supabase Cloud PostgreSQL & live synchronization
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: 'var(--color-surface)', padding: '12px', borderRadius: '8px', fontSize: '0.82rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Connection Status</span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 700,
              color: backendSession.isConnected ? '#219763' : '#df2145'
            }}>
              ● {backendSession.isConnected ? 'Connected (Supabase Cloud)' : 'Offline / Standalone'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Logged-in Account</span>
            <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {sessionAccount?.identifier || backendSession.staffEmail || 'Staff Member'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Organization / Hotel</span>
            <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {sessionAccount?.hotelName || 'Oscar Dog Hotel'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Account Type</span>
            <span style={{ fontWeight: 600, color: '#1267df' }}>
              {sessionAccount?.role === 'STAFF' ? 'Staff (Shared Hotel Access)' : 'Personal Customer Account'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Hotel Timezone</span>
            <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
              Europe/Nicosia (UTC+3)
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Last Synchronized</span>
            <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {backendSession.lastSyncAt || 'Just now'}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="btn-secondary"
          onClick={() => refreshData()}
          style={{ width: '100%', padding: '10px', fontSize: '0.85rem' }}
        >
          Sync Data Now
        </button>
      </div>

      {/* Developer Information */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Code size={18} color="#5336df" />
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
              Developer Information
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
              App version and system details
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.86rem', marginTop: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--color-border-subtle)' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Developer Contact</span>
            <a
              href="mailto:info.sakib.manager@gmail.com"
              style={{
                fontWeight: 700,
                color: 'var(--color-primary)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Mail size={14} />
              <span>info.sakib.manager@gmail.com</span>
            </a>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--color-border-subtle)' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Version</span>
            <span style={{ fontWeight: 600 }}>{settings.version || '1.0.0'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--color-border-subtle)' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Build</span>
            <span style={{ fontWeight: 600 }}>{settings.build || '20260913'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--color-border-subtle)' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Environment</span>
            <span style={{ fontWeight: 600, color: '#16a36a' }}>{settings.environment || 'Production'}</span>
          </div>

          <a
            href="mailto:info.sakib.manager@gmail.com?subject=Oscar%20Dog%20Hotel%20-%20Support%20Inquiry"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 14px',
              marginTop: '6px',
              borderRadius: '8px',
              backgroundColor: '#eff6ff',
              color: '#1267df',
              border: '1px solid #bfdbfe',
              textDecoration: 'none',
              fontSize: '0.86rem',
              fontWeight: 700
            }}
          >
            <Mail size={16} />
            <span>Contact Developer (info.sakib.manager@gmail.com)</span>
          </a>
        </div>
      </div>

      {/* Log Out Action */}
      <button
        type="button"
        onClick={handleExit}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '14px',
          color: '#df2145',
          border: '1.5px solid #df214533',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.95rem',
          fontWeight: 700,
          marginTop: '6px',
          cursor: 'pointer'
        }}
      >
        <LogOut size={18} />
        <span>Log Out</span>
      </button>
    </div>
  );
};
