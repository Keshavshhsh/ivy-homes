import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DEMO_ACCOUNTS } from '../services/api';
import { 
  Building2, 
  Home, 
  KeyRound, 
  Bookmark, 
  BarChart3, 
  UserCheck, 
  LogOut, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  RefreshCw, 
  ChevronDown 
} from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab }) => {
  const { user, profile, logout, switchAccount, savedIds, tokenExpiry } = useAuth();
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  // Live countdown to token refresh
  useEffect(() => {
    if (!tokenExpiry) return;
    const interval = setInterval(() => {
      const diff = Math.max(0, Math.floor((tokenExpiry - Date.now()) / 1000));
      setSecondsLeft(diff);
    }, 1000);
    return () => clearInterval(interval);
  }, [tokenExpiry]);

  const navItems = [
    { id: 'listings', label: 'Buy Listings', icon: Home },
    { id: 'rentals', label: 'Rentals', icon: KeyRound },
    { id: 'projects', label: 'Projects', icon: Building2 },
    { 
      id: 'saved', 
      label: 'Saved', 
      icon: Bookmark, 
      badge: savedIds.size > 0 ? savedIds.size : null 
    },
    { id: 'insights', label: 'Insights & Audit', icon: BarChart3, highlight: true },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & City Badge */}
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setActiveTab('listings')} 
              className="flex items-center space-x-2.5 text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-slate-900 block leading-tight">
                  Ivy<span className="text-emerald-600">Homes</span>
                </span>
                <span className="text-[11px] font-medium text-slate-500 tracking-wider uppercase flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-500" />
                  {profile?.city ? `${profile.city}` : 'Bangalore'} · {profile?.assigned_locality ? profile.assigned_locality : 'Whitefield'}
                </span>
              </div>
            </button>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive 
                      ? item.highlight 
                        ? 'bg-emerald-600 text-white shadow-sm' 
                        : 'bg-emerald-50 text-emerald-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive && !item.highlight ? 'text-emerald-600' : ''}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`ml-1.5 px-1.5 py-0.5 text-xs font-bold rounded-full ${
                      isActive 
                        ? 'bg-emerald-200 text-emerald-900' 
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {item.highlight && !isActive && (
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User & Session Status */}
          <div className="flex items-center space-x-3">
            {/* Live Auto-Refresh Timer Pill */}
            {secondsLeft !== null && (
              <div 
                title="Token automatically auto-refreshes before expiry so session stays alive > 30 minutes without re-login"
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 cursor-help"
              >
                <RefreshCw className="w-3 h-3 text-emerald-600 animate-spin" style={{ animationDuration: '6s' }} />
                <span>Auto-refresh: {Math.floor(secondsLeft / 60)}m {secondsLeft % 60}s</span>
              </div>
            )}

            {/* Account Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white text-slate-800 text-sm font-medium transition-all shadow-2xs"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  {user?.email ? user.email.charAt(4) : '1'}
                </div>
                <span className="hidden sm:inline-block max-w-[130px] truncate">{user?.email || 'demo1@ivy.homes'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {accountMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-1">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Demo User</p>
                    <p className="text-sm font-medium text-slate-900 truncate">{user?.email}</p>
                    <p className="text-xs text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Token Session Active (Survives 30m+)
                    </p>
                  </div>

                  <div className="p-1">
                    <p className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Quick Switch Account</p>
                    {DEMO_ACCOUNTS.map(email => (
                      <button
                        key={email}
                        onClick={() => {
                          switchAccount(email);
                          setAccountMenuOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center justify-between transition-colors ${
                          user?.email === email 
                            ? 'bg-emerald-50 text-emerald-800 font-bold' 
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span>{email}</span>
                        {user?.email === email && <UserCheck className="w-3.5 h-3.5 text-emerald-600" />}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-slate-100 p-1 mt-1">
                    <button
                      onClick={() => {
                        logout();
                        setAccountMenuOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Logout Session
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Nav Tabs */}
        <div className="flex md:hidden overflow-x-auto py-2 border-t border-slate-100 space-x-1 scrollbar-none">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`whitespace-nowrap flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
                  isActive 
                    ? item.highlight 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-emerald-100 text-emerald-800 font-bold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-1 px-1.5 py-0.2 bg-emerald-200 text-emerald-900 rounded-full font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
