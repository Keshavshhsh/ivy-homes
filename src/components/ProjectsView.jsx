import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Search, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Info
} from 'lucide-react';

export const ProjectsView = ({ projects, listings, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocality, setSelectedLocality] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('costliest');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Precompute actual live listings per project
  const liveCountByProject = useMemo(() => {
    if (!listings) return {};
    const map = {};
    listings.forEach(l => {
      if (l.project_id && l.is_live) {
        map[l.project_id] = (map[l.project_id] || 0) + 1;
      }
    });
    return map;
  }, [listings]);

  // Convert raw project price to standardized readable string and full INR number
  const formatProjectPrice = (val) => {
    if (val === null || val === undefined) return { label: 'Price on Request', inr: 0 };
    // If < 10, value represents Crores (e.g. 1.04 Cr)
    if (val < 10) {
      return {
        label: `₹${val.toFixed(2)} Cr`,
        inr: Math.round(val * 10000000)
      };
    }
    // If >= 10, value represents Lakhs (e.g. 58.6 L)
    return {
      label: `₹${val.toFixed(1)} L`,
      inr: Math.round(val * 100000)
    };
  };

  const localityOptions = useMemo(() => {
    if (!projects) return [];
    const counts = {};
    projects.forEach(p => {
      const loc = p.locality?.toLowerCase() || 'unknown';
      counts[loc] = (counts[loc] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    return projects.filter(p => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchName = p.apartment_name?.toLowerCase().includes(q);
        const matchDev = p.developer_name?.toLowerCase().includes(q);
        const matchLoc = p.locality?.toLowerCase().includes(q);
        const matchRera = p.rera_number?.toLowerCase().includes(q);
        if (!matchName && !matchDev && !matchLoc && !matchRera) return false;
      }

      if (selectedLocality !== 'all' && p.locality?.toLowerCase() !== selectedLocality.toLowerCase()) {
        return false;
      }

      if (selectedStatus !== 'all' && p.project_status?.toLowerCase() !== selectedStatus.toLowerCase()) {
        return false;
      }

      return true;
    });
  }, [projects, searchTerm, selectedLocality, selectedStatus]);

  const sortedProjects = useMemo(() => {
    const list = [...filteredProjects];
    switch (sortBy) {
      case 'costliest':
        return list.sort((a, b) => {
          const maxA = formatProjectPrice(a.price_max).inr;
          const maxB = formatProjectPrice(b.price_max).inr;
          return maxB - maxA;
        });
      case 'units_desc':
        return list.sort((a, b) => (b.total_units || 0) - (a.total_units || 0));
      case 'launch_desc':
        return list.sort((a, b) => (b.launch_date || '').localeCompare(a.launch_date || ''));
      case 'cheapest':
        return list.sort((a, b) => {
          const minA = formatProjectPrice(a.price_min).inr;
          const minB = formatProjectPrice(b.price_min).inr;
          return minA - minB;
        });
      default:
        return list;
    }
  }, [filteredProjects, sortBy]);

  const totalPages = Math.ceil(sortedProjects.length / pageSize) || 1;
  const currentProjects = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedProjects.slice(start, start + pageSize);
  }, [sortedProjects, page, pageSize]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Building2 className="w-6 h-6 text-emerald-600" /> Builder Projects in Bangalore
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Browsing <span className="font-bold text-slate-900">{filteredProjects.length}</span> developments with unit-corrected Crores/Lakhs pricing and live inventory audits
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search project, developer, RERA..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-emerald-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Locality</label>
            <select
              value={selectedLocality}
              onChange={(e) => { setSelectedLocality(e.target.value); setPage(1); }}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 capitalize focus:outline-emerald-500"
            >
              <option value="all">All Localities ({projects?.length})</option>
              {localityOptions.map(([loc, count]) => (
                <option key={loc} value={loc} className="capitalize">{loc} ({count})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 capitalize focus:outline-emerald-500"
            >
              <option value="all">All Construction Status</option>
              <option value="under construction">Under Construction</option>
              <option value="ready to move">Ready to Move</option>
              <option value="new launch">New Launch</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-emerald-500"
            >
              <option value="costliest">Costliest Projects (Highest Max Price)</option>
              <option value="cheapest">Most Affordable Starting Price</option>
              <option value="units_desc">Total Units: Largest First</option>
              <option value="launch_desc">Launch Date: Newest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentProjects.map(p => {
          const minPriceObj = formatProjectPrice(p.price_min);
          const maxPriceObj = formatProjectPrice(p.price_max);
          const liveListings = liveCountByProject[p.project_id] || 0;
          const reportedListings = p.total_listings ?? 0;
          const isCountMismatched = reportedListings !== liveListings;

          return (
            <div
              key={p.project_id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-xl transition-all p-5 flex flex-col justify-between"
            >
              <div>
                {/* Status & Developer Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
                      {p.project_status || 'Under Construction'}
                    </span>
                    <span className="ml-2 text-xs font-bold text-slate-500">{p.developer_name}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono font-medium">{p.project_id}</span>
                </div>

                {/* Project Name & Locality */}
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {p.apartment_name}
                </h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 capitalize">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  {p.locality}, Bangalore
                </p>

                {/* Corrected Price Range Banner */}
                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block">Price Range (Unit-Corrected)</span>
                    <span className="text-lg font-black text-emerald-700">
                      {minPriceObj.label} – {maxPriceObj.label}
                    </span>
                  </div>
                  <div className="text-right text-xs">
                    <span className="text-slate-400 block text-[10px]">Unit Sizes</span>
                    <span className="font-bold text-slate-700">{p.min_area_sqft} - {p.max_area_sqft} sq.ft.</span>
                  </div>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs mt-3 pt-3 border-t border-slate-100">
                  <div className="p-2 rounded-lg bg-slate-50">
                    <span className="text-[10px] text-slate-400 block">Total Units</span>
                    <span className="font-bold text-slate-800">{p.total_units} Homes</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50">
                    <span className="text-[10px] text-slate-400 block">Towers / Floors</span>
                    <span className="font-bold text-slate-800">{p.total_towers} T / {p.total_floors} F</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50">
                    <span className="text-[10px] text-slate-400 block">Possession</span>
                    <span className="font-bold text-slate-800">{p.possession_date ? p.possession_date.slice(0, 7) : 'Ready'}</span>
                  </div>
                </div>

                {/* Amenities Badges */}
                {p.amenities && p.amenities.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {p.amenities.slice(0, 5).map(a => (
                      <span key={a} className="text-[10px] capitalize px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                        {a}
                      </span>
                    ))}
                    {p.amenities.length > 5 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md text-slate-400">
                        +{p.amenities.length - 5} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Footer: RERA & Listings Count Audit */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <span className="text-[11px] text-slate-400 font-mono truncate max-w-[220px]">
                  RERA: {p.rera_number || 'N/A'}
                </span>

                {/* Live Count Audit Indicator */}
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-700">
                    {liveListings} Live Listings
                  </span>
                  {isCountMismatched && (
                    <span 
                      title={`Reported ${reportedListings} in project metadata, but actual live listings count is ${liveListings}`}
                      className="px-1.5 py-0.5 rounded-sm bg-amber-100 text-amber-800 text-[10px] font-bold cursor-help flex items-center gap-0.5"
                    >
                      <Info className="w-3 h-3 text-amber-600" /> Out of sync ({reportedListings} rep.)
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 flex items-center justify-between shadow-xs">
          <p className="text-xs text-slate-500">
            Page <span className="font-bold text-slate-800">{page}</span> of {totalPages}
          </p>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
