import React, { useState, useEffect } from 'react';
import { getCurrentAdmin, AdminUser } from '../services/adminService';
import AdminLogin from './admin/AdminLogin';
import AdminPanel from './admin/AdminPanel';

const AdminApp: React.FC = () => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = () => {
    setIsLoading(true);
    try {
      const currentAdmin = getCurrentAdmin();
      setAdmin(currentAdmin);
    } catch (error) {
      console.error('Failed to check admin auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = (adminUser: AdminUser) => {
    setAdmin(adminUser);
  };

  const handleLogout = () => {
    setAdmin(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  return <AdminPanel admin={admin} onLogout={handleLogout} />;
};

export default AdminApp;
