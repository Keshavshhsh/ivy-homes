import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  Filter, 
  MapPin, 
  BedDouble, 
  Bath, 
  Maximize2, 
  Bookmark, 
  Layers, 
  ChevronLeft, 
  ChevronRight, 
  SlidersHorizontal,
  Check,
  AlertCircle,
  Sparkles,
  ArrowUpDown,
  RefreshCw
} from 'lucide-react';

export const ListingsView = ({ listings, loading, onSelectListing }) => {
  const { savedIds, toggleSaveListing } = useAuth();

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocality, setSelectedLocality] = useState('all');
  const [selectedBhk, setSelectedBhk] = useState('all');
  const [selectedFurnishing, setSelectedFurnishing] = useState('all');
  const [selectedPropType, setSelectedPropType] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [onlyLive, setOnlyLive] = useState(true);
  const [convertSqm, setConvertSqm] = useState(true);
  const [sortBy, setSortBy] = useState('posted_desc');
  const [page, setPage] = useState(1);
  const pageSize = 24;

  // Reset to page 1 on filter change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedLocality, selectedBhk, selectedFurnishing, selectedPropType, priceRange, onlyLive, sortBy]);

  // Unique Localities with counts
  const localityOptions = useMemo(() => {
    if (!listings) return [];
    const counts = {};
    listings.forEach(l => {
      const loc = l.locality?.toLowerCase() || 'unknown';
      counts[loc] = (counts[loc] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [listings]);

  // Resilient Client-Side Filtering (guarantees filtering works even when server ignores parameters)
  const filteredListings = useMemo(() => {
    if (!listings) return [];

    return listings.filter(item => {
      // 1. Live status filter
      if (onlyLive && !item.is_live) return false;

      // 2. Search term (apartment name, locality, description)
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchName = item.apartment_name?.toLowerCase().includes(q);
        const matchLoc = item.locality?.toLowerCase().includes(q);
        const matchDesc = item.description?.toLowerCase().includes(q);
        if (!matchName && !matchLoc && !matchDesc) return false;
      }

      // 3. Locality filter
      if (selectedLocality !== 'all' && item.locality?.toLowerCase() !== selectedLocality.toLowerCase()) {
        return false;
      }

      // 4. Bedroom count
      if (selectedBhk !== 'all') {
        const bhk = Number(selectedBhk);
        if (bhk === 4) {
          if (item.bedroom < 4) return false;
        } else {
          if (item.bedroom !== bhk) return false;
        }
      }

      // 5. Furnishing
      if (selectedFurnishing !== 'all' && item.furnishing?.toLowerCase() !== selectedFurnishing.toLowerCase()) {
        return false;
      }

      // 6. Property Type
      if (selectedPropType !== 'all' && item.property_type?.toLowerCase() !== selectedPropType.toLowerCase()) {
        return false;
      }

      // 7. Price range
      if (priceRange !== 'all') {
        const p = item.price || 0;
        if (priceRange === 'under50L' && (p <= 0 || p > 5000000)) return false;
        if (priceRange === '50L-1Cr' && (p < 5000000 || p > 10000000)) return false;
        if (priceRange === '1Cr-2Cr' && (p < 10000000 || p > 20000000)) return false;
        if (priceRange === 'above2Cr' && p < 20000000) return false;
      }

      return true;
    });
  }, [listings, onlyLive, searchTerm, selectedLocality, selectedBhk, selectedFurnishing, selectedPropType, priceRange]);

  // Sorting
  const sortedListings = useMemo(() => {
    const list = [...filteredListings];
    switch (sortBy) {
      case 'price_asc':
        return list.sort((a, b) => (a.price || 0) - (b.price || 0));
      case 'price_desc':
        return list.sort((a, b) => (b.price || 0) - (a.price || 0));
      case 'area_desc':
        return list.sort((a, b) => {
          const areaA = (convertSqm && a.website === 'magichomes' && a.carpet_area < 300) ? a.carpet_area * 10.7639 : a.carpet_area || 0;
          const areaB = (convertSqm && b.website === 'magichomes' && b.carpet_area < 300) ? b.carpet_area * 10.7639 : b.carpet_area || 0;
          return areaB - areaA;
        });
      case 'posted_desc':
      default:
        return list.sort((a, b) => (b.posted_at || '').localeCompare(a.posted_at || ''));
    }
  }, [filteredListings, sortBy, convertSqm]);

  // Pagination Slice
  const totalPages = Math.ceil(sortedListings.length / pageSize) || 1;
  const currentListings = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedListings.slice(start, start + pageSize);
  }, [sortedListings, page, pageSize]);

  const formatPrice = (price) => {
    if (!price || price < 0) return `₹${price?.toLocaleString('en-IN') || 0}`;
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    }
    if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} L`;
    }
    return `₹${price.toLocaleString('en-IN')}`;
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
        <p className="text-slate-600 font-medium">Loading Bangalore listings data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Controls */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Properties for Sale in Bangalore
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Showing <span className="font-bold text-slate-900">{filteredListings.length.toLocaleString('en-IN')}</span> verified homes across {localityOptions.length} localities
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search apartment, locality, project..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-emerald-500 focus:bg-white transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Filters Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {/* Locality Filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Locality</label>
            <select
              value={selectedLocality}
              onChange={(e) => setSelectedLocality(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 capitalize focus:outline-emerald-500"
            >
              <option value="all">All Localities ({listings?.length})</option>
              {localityOptions.map(([loc, count]) => (
                <option key={loc} value={loc} className="capitalize">
                  {loc} ({count})
                </option>
              ))}
            </select>
          </div>

          {/* Bedrooms Filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Bedrooms</label>
            <select
              value={selectedBhk}
              onChange={(e) => setSelectedBhk(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-emerald-500"
            >
              <option value="all">All BHKs</option>
              <option value="1">1 BHK</option>
              <option value="2">2 BHK</option>
              <option value="3">3 BHK</option>
              <option value="4">4+ BHK</option>
            </select>
          </div>

          {/* Price Range Filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Price Range</label>
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-emerald-500"
            >
              <option value="all">All Prices</option>
              <option value="under50L">Under ₹50 Lakhs</option>
              <option value="50L-1Cr">₹50 Lakhs - ₹1 Crore</option>
              <option value="1Cr-2Cr">₹1 Crore - ₹2 Crores</option>
              <option value="above2Cr">Above ₹2 Crores</option>
            </select>
          </div>

          {/* Furnishing Filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Furnishing</label>
            <select
              value={selectedFurnishing}
              onChange={(e) => setSelectedFurnishing(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 capitalize focus:outline-emerald-500"
            >
              <option value="all">All Furnishing</option>
              <option value="unfurnished">Unfurnished</option>
              <option value="semi-furnished">Semi-Furnished</option>
              <option value="fully-furnished">Fully-Furnished</option>
            </select>
          </div>

          {/* Property Type */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Type</label>
            <select
              value={selectedPropType}
              onChange={(e) => setSelectedPropType(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 capitalize focus:outline-emerald-500"
            >
              <option value="all">All Types</option>
              <option value="apartment">Apartment</option>
              <option value="villa">Villa</option>
              <option value="independent house">Independent House</option>
              <option value="builder floor">Builder Floor</option>
              <option value="plot">Plot</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-emerald-500"
            >
              <option value="posted_desc">Latest Posted</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="area_desc">Carpet Area: Largest</option>
            </select>
          </div>
        </div>

        {/* Toggles Strip */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-4">
            {/* Live Only Toggle */}
            <label className="flex items-center space-x-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyLive}
                onChange={(e) => setOnlyLive(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
              />
              <span className="font-semibold text-slate-700">Filter Live Only (Exclude Inactive)</span>
            </label>

            {/* MagicHomes SQM -> SQFT Toggle */}
            <label className="flex items-center space-x-2 cursor-pointer select-none" title="MagicHomes reports areas in m²; this converts them to standard ft² (x10.7639)">
              <input
                type="checkbox"
                checked={convertSqm}
                onChange={(e) => setConvertSqm(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
              />
              <span className="font-semibold text-slate-700">Normalize MagicHomes m² to ft²</span>
            </label>
          </div>

          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedLocality('all');
              setSelectedBhk('all');
              setSelectedFurnishing('all');
              setSelectedPropType('all');
              setPriceRange('all');
              setOnlyLive(true);
              setSortBy('posted_desc');
            }}
            className="text-emerald-700 hover:text-emerald-900 font-bold hover:underline"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Grid of Listings */}
      {currentListings.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No properties matched your criteria</h3>
          <p className="text-sm text-slate-500 mt-1">Try relaxing filters or adjusting your price search range.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {currentListings.map(item => {
            const isSaved = savedIds.has(item.listing_id);
            const isMagic = item.website === 'magichomes' && item.carpet_area < 300;
            const carpetSqft = (convertSqm && isMagic) 
              ? Math.round(item.carpet_area * 10.7639) 
              : item.carpet_area;
            const ratePerSqft = carpetSqft > 0 && item.price > 0 ? Math.round(item.price / carpetSqft) : null;
            const isEnquiryBait = item.price > 0 && item.price < 50000;

            return (
              <div
                key={item.listing_id}
                onClick={() => onSelectListing(item)}
                className="group bg-white rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden"
              >
                <div>
                  {/* Top Card Bar */}
                  <div className="p-4 pb-2 flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {item.property_type || 'Apartment'}
                      </span>
                      {isEnquiryBait && (
                        <span className="ml-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                          Bait Price
                        </span>
                      )}
                      {!item.is_live && (
                        <span className="ml-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200">
                          Inactive
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSaveListing(item.listing_id);
                      }}
                      className={`p-1.5 rounded-full transition-colors ${
                        isSaved ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                      }`}
                      title={isSaved ? 'Remove from saved' : 'Save property'}
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-emerald-600' : ''}`} />
                    </button>
                  </div>

                  {/* Apartment Name & Locality */}
                  <div className="px-4">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors truncate">
                      {item.apartment_name || 'Independent Flat'}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 capitalize">
                      <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                      {item.locality}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="px-4 mt-3">
                    <div className="text-xl font-extrabold text-slate-900 tracking-tight">
                      {formatPrice(item.price)}
                    </div>
                    {ratePerSqft && (
                      <p className="text-[11px] font-medium text-slate-400">
                        ₹{ratePerSqft.toLocaleString('en-IN')}/sq.ft.
                      </p>
                    )}
                  </div>

                  {/* Specs Pill Strip */}
                  <div className="px-4 py-3 grid grid-cols-3 gap-1 text-center text-xs border-t border-slate-100 mt-3">
                    <div className="bg-slate-50 py-1.5 rounded-lg">
                      <span className="text-[10px] text-slate-400 block font-medium">BHK</span>
                      <span className="font-bold text-slate-700">{item.bedroom ?? 0} BHK</span>
                    </div>
                    <div className="bg-slate-50 py-1.5 rounded-lg">
                      <span className="text-[10px] text-slate-400 block font-medium">Carpet</span>
                      <span className="font-bold text-slate-700">{carpetSqft} ft²</span>
                    </div>
                    <div className="bg-slate-50 py-1.5 rounded-lg">
                      <span className="text-[10px] text-slate-400 block font-medium">Floor</span>
                      <span className="font-bold text-slate-700">{item.floor ?? 0}/{item.total_floors ?? 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Portal Badge */}
                <div className="px-4 py-2 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="capitalize font-medium">Source: {item.website}</span>
                  <span className="text-emerald-700 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    View Details →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <p className="text-xs text-slate-500">
            Page <span className="font-bold text-slate-800">{page}</span> of <span className="font-bold text-slate-800">{totalPages}</span> · ({filteredListings.length.toLocaleString('en-IN')} total results)
          </p>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            {/* Jump buttons */}
            <div className="hidden sm:flex items-center space-x-1">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                let pageNum = page - 2 + i;
                if (pageNum < 1) pageNum = i + 1;
                if (pageNum > totalPages) return null;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                      page === pageNum 
                        ? 'bg-emerald-600 text-white' 
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
