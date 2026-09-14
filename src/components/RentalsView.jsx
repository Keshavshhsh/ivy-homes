import React, { useState, useMemo } from 'react';
import { 
  Search, 
  MapPin, 
  BedDouble, 
  Bath, 
  Maximize2, 
  Layers, 
  KeyRound, 
  ChevronLeft, 
  ChevronRight,
  ShieldAlert,
  Phone,
  CheckCircle2,
  Calendar,
  X
} from 'lucide-react';

export const RentalsView = ({ rentals, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocality, setSelectedLocality] = useState('all');
  const [selectedBhk, setSelectedBhk] = useState('all');
  const [selectedFurnishing, setSelectedFurnishing] = useState('all');
  const [sortBy, setSortBy] = useState('rent_asc');
  const [page, setPage] = useState(1);
  const [selectedRental, setSelectedRental] = useState(null);
  const pageSize = 24;

  const localityOptions = useMemo(() => {
    if (!rentals) return [];
    const counts = {};
    rentals.forEach(r => {
      const loc = r.locality?.toLowerCase() || 'unknown';
      counts[loc] = (counts[loc] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [rentals]);

  const filteredRentals = useMemo(() => {
    if (!rentals) return [];
    return rentals.filter(r => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchTitle = r.title?.toLowerCase().includes(q);
        const matchName = r.apartment_name?.toLowerCase().includes(q);
        const matchLoc = r.locality?.toLowerCase().includes(q);
        if (!matchTitle && !matchName && !matchLoc) return false;
      }

      if (selectedLocality !== 'all' && r.locality?.toLowerCase() !== selectedLocality.toLowerCase()) {
        return false;
      }

      if (selectedBhk !== 'all' && r.bedroom !== Number(selectedBhk)) {
        return false;
      }

      if (selectedFurnishing !== 'all' && r.furnishing?.toLowerCase() !== selectedFurnishing.toLowerCase()) {
        return false;
      }

      return true;
    });
  }, [rentals, searchTerm, selectedLocality, selectedBhk, selectedFurnishing]);

  const sortedRentals = useMemo(() => {
    const list = [...filteredRentals];
    if (sortBy === 'rent_asc') return list.sort((a, b) => (a.price || 0) - (b.price || 0));
    if (sortBy === 'rent_desc') return list.sort((a, b) => (b.price || 0) - (a.price || 0));
    if (sortBy === 'area_desc') return list.sort((a, b) => (b.carpet_area || 0) - (a.carpet_area || 0));
    return list;
  }, [filteredRentals, sortBy]);

  const totalPages = Math.ceil(sortedRentals.length / pageSize) || 1;
  const currentRentals = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedRentals.slice(start, start + pageSize);
  }, [sortedRentals, page, pageSize]);

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <KeyRound className="w-6 h-6 text-emerald-600" /> Rental Properties in Bangalore
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Browsing <span className="font-bold text-slate-900">{filteredRentals.length}</span> verified rental homes with correct deposit and maintenance terms
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search apartment, locality, title..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-emerald-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Locality</label>
            <select
              value={selectedLocality}
              onChange={(e) => { setSelectedLocality(e.target.value); setPage(1); }}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 capitalize focus:outline-emerald-500"
            >
              <option value="all">All Localities ({rentals?.length})</option>
              {localityOptions.map(([loc, count]) => (
                <option key={loc} value={loc} className="capitalize">{loc} ({count})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Bedrooms</label>
            <select
              value={selectedBhk}
              onChange={(e) => { setSelectedBhk(e.target.value); setPage(1); }}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-emerald-500"
            >
              <option value="all">All BHKs</option>
              <option value="1">1 BHK</option>
              <option value="2">2 BHK</option>
              <option value="3">3 BHK</option>
              <option value="4">4 BHK</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Furnishing</label>
            <select
              value={selectedFurnishing}
              onChange={(e) => { setSelectedFurnishing(e.target.value); setPage(1); }}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 capitalize focus:outline-emerald-500"
            >
              <option value="all">All Furnishing</option>
              <option value="unfurnished">Unfurnished</option>
              <option value="semi-furnished">Semi-Furnished</option>
              <option value="fully-furnished">Fully-Furnished</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-emerald-500"
            >
              <option value="rent_asc">Rent: Low to High</option>
              <option value="rent_desc">Rent: High to Low</option>
              <option value="area_desc">Carpet Area: Largest</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rentals Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {currentRentals.map(r => (
          <div
            key={r.listing_id}
            onClick={() => setSelectedRental(r)}
            className="group bg-white rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-xl hover:-translate-y-0.5 transition-all p-4 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
                  {r.bedroom} BHK Rental
                </span>
                <span className="text-xs text-slate-400 capitalize">{r.furnishing}</span>
              </div>

              <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors truncate">
                {r.apartment_name}
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 capitalize">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                {r.locality}
              </p>

              {/* Monthly Rent */}
              <div className="mt-3">
                <div className="text-2xl font-black text-emerald-700">
                  ₹{r.price?.toLocaleString('en-IN')}<span className="text-xs text-slate-500 font-normal"> /month</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 flex gap-2">
                  <span>Deposit: ₹{(r.deposit || 0).toLocaleString('en-IN')}</span>
                  {r.maintenance > 0 && <span>· Maint: ₹{r.maintenance}/mo</span>}
                </div>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-3 gap-1 text-center text-xs bg-slate-50 p-2 rounded-xl border border-slate-100 mt-3">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Baths</span>
                  <span className="font-bold text-slate-700">{r.bathroom}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Carpet</span>
                  <span className="font-bold text-slate-700">{r.carpet_area} ft²</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Floor</span>
                  <span className="font-bold text-slate-700">{r.floor}/{r.total_floors}</span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="capitalize text-[11px]">By {r.posted_by || 'Owner'}</span>
              <span className="text-emerald-600 font-bold group-hover:translate-x-0.5 transition-transform">
                View Terms →
              </span>
            </div>
          </div>
        ))}
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

      {/* Rental Detail Modal */}
      {selectedRental && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{selectedRental.apartment_name}</h3>
                <p className="text-xs text-slate-500 capitalize">{selectedRental.locality}, Bangalore</p>
              </div>
              <button onClick={() => setSelectedRental(null)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Monthly Rent</p>
                <p className="text-2xl font-black text-emerald-700">₹{selectedRental.price?.toLocaleString('en-IN')}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Security Deposit</p>
                <p className="text-lg font-bold text-slate-800">₹{selectedRental.deposit?.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs bg-slate-50 p-3 rounded-xl">
              <div><span className="text-slate-400 block">Bedrooms</span><span className="font-bold">{selectedRental.bedroom} BHK</span></div>
              <div><span className="text-slate-400 block">Bathrooms</span><span className="font-bold">{selectedRental.bathroom} Baths</span></div>
              <div><span className="text-slate-400 block">Carpet Area</span><span className="font-bold">{selectedRental.carpet_area} sq.ft.</span></div>
              <div><span className="text-slate-400 block">Furnishing</span><span className="font-bold capitalize">{selectedRental.furnishing}</span></div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Description</h4>
              <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                {selectedRental.description || selectedRental.title}
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">{selectedRental.posted_by_name || 'Landlord'}</p>
                <p className="text-xs text-slate-500">{selectedRental.posted_by_contact}</p>
              </div>
              <a
                href={`tel:${selectedRental.posted_by_contact}`}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Phone className="w-3.5 h-3.5" /> Call Landlord
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
