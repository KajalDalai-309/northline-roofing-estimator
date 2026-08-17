import React, { useState, useEffect } from 'react';
import AdminLogin from './AdminLogin';
import RatesEditor from './RatesEditor';
import LeadsCRM from './LeadsCRM';
import HistoryLog from './HistoryLog';
import { verifyAdminAuth, clearAuthToken } from '../../services/api';
import { Sliders, Users, History, LogOut, ShieldCheck, Sparkles } from 'lucide-react';

export default function OwnerPanel({ onConfigUpdated }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState('rates'); // 'rates' | 'leads' | 'history'
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function check() {
      const res = await verifyAdminAuth();
      setIsAuthenticated(res.valid);
      if (res.valid) {
        setUser({ username: 'admin', name: 'Dale Whitmore (Owner)' });
      }
      setCheckingAuth(false);
    }
    check();
  }, []);

  const handleLoginSuccess = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    clearAuthToken();
    setIsAuthenticated(false);
    setUser(null);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <p className="text-sm font-semibold text-slate-500">Checking credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Top Admin Navigation Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-900 text-sky-300 flex items-center justify-center font-bold text-sm shadow-md">
            DW
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-900">Dale & Marcus Owner Portal</h3>
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <ShieldCheck className="w-3 h-3" /> Authenticated
              </span>
            </div>
            <p className="text-xs text-slate-500">Northline Roofing & Exteriors Management</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold w-full sm:w-auto justify-center">
          <button
            onClick={() => setActiveTab('rates')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition ${
              activeTab === 'rates'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Rates & Questions</span>
          </button>

          <button
            onClick={() => setActiveTab('leads')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition ${
              activeTab === 'leads'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Captured Leads</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition ${
              activeTab === 'history'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit History</span>
          </button>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-rose-600 px-3 py-2 rounded-xl hover:bg-rose-50 transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>

      </div>

      {/* Main Tab Content */}
      <div>
        {activeTab === 'rates' && <RatesEditor onConfigSaved={onConfigUpdated} />}
        {activeTab === 'leads' && <LeadsCRM />}
        {activeTab === 'history' && <HistoryLog />}
      </div>

    </div>
  );
}
