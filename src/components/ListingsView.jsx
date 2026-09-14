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
            const propertyImage = item.image || 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80';
            const fallbackPropertyImage = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80';

            return (
              <div
                key={item.listing_id}
                onClick={() => onSelectListing(item)}
                className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500 hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)]"
              >
                <div className="relative overflow-hidden">
                  <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                    <img
                      src={propertyImage}
                      alt={item.apartment_name || 'Property'}
                      loading="lazy"
                      onError={(e) => {
                        if (e.currentTarget.src !== fallbackPropertyImage) {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = fallbackPropertyImage;
                        }
                      }}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  </div>

                  <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
                    <div className="flex flex-wrap gap-1.5">
                      <span className="rounded-full bg-white/90 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-700 shadow-sm backdrop-blur-sm">
                        {item.property_type || 'Apartment'}
                      </span>
                      {!item.is_live && (
                        <span className="rounded-full bg-rose-500/90 px-2 py-1 text-[10px] font-semibold text-white shadow-sm backdrop-blur-sm">
                          Inactive
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSaveListing(item.listing_id);
                      }}
                      className={`rounded-full p-2 shadow-sm transition-all ${
                        isSaved
                          ? 'bg-emerald-500 text-white'
                          : 'bg-white/90 text-slate-500 hover:bg-white hover:text-slate-700'
                      }`}
                      title={isSaved ? 'Remove from saved' : 'Save property'}
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
                    </button>
                  </div>

                  {isEnquiryBait && (
                    <div className="absolute bottom-3 left-3 rounded-full bg-amber-100/95 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-amber-800 shadow-sm">
                      Bait Price
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 transition-colors group-hover:text-emerald-600">
                        {item.apartment_name || 'Independent Flat'}
                      </h3>
                    </div>
                  </div>

                  <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 capitalize">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    {item.locality}
                  </p>

                  <div className="mt-4">
                    <div className="text-2xl font-black tracking-tight text-slate-900">
                      {formatPrice(item.price)}
                    </div>
                    {ratePerSqft && (
                      <p className="mt-1 text-[11px] font-medium text-slate-400">
                        ₹{ratePerSqft.toLocaleString('en-IN')}/sq.ft.
                      </p>
                    )}
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="rounded-xl border border-slate-100 bg-slate-50 px-2 py-2 text-center">
                      <div className="flex items-center justify-center text-slate-400">
                        <BedDouble className="h-3.5 w-3.5" />
                      </div>
                      <div className="mt-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">Beds</div>
                      <div className="text-xs font-bold text-slate-700">{item.bedroom ?? 0} BHK</div>
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-slate-50 px-2 py-2 text-center">
                      <div className="flex items-center justify-center text-slate-400">
                        <Bath className="h-3.5 w-3.5" />
                      </div>
                      <div className="mt-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">Baths</div>
                      <div className="text-xs font-bold text-slate-700">{item.bathroom ?? 0}</div>
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-slate-50 px-2 py-2 text-center">
                      <div className="flex items-center justify-center text-slate-400">
                        <Maximize2 className="h-3.5 w-3.5" />
                      </div>
                      <div className="mt-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">Area</div>
                      <div className="text-xs font-bold text-slate-700">{carpetSqft} ft²</div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                      {item.website}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectListing(item);
                      }}
                      className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-700"
                    >
                      View Details
                    </button>
                  </div>
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
