import React from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from './Header';
import { BottomNavigation } from './BottomNavigation';
import { Toast } from './Toast';
import { DeviceToolbar } from './DeviceToolbar';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { deviceWidth } = useApp();

  const widthClass = `width-${deviceWidth}`;

  return (
    <div className="app-viewport-wrapper">
      <DeviceToolbar />

      <div className={`device-frame-container ${widthClass}`}>
        <Header />
        <main className="page-content">{children}</main>
        <BottomNavigation />
        <Toast />
      </div>
    </div>
  );
};
