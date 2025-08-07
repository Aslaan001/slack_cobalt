import React from 'react';
import { Header } from './Header';
import { Dashboard } from '../dashboard/Dashboard';

export const DashboardLayout: React.FC = () => {
  return (
    <>
      <Header />
      <Dashboard />
    </>
  );
}; 