import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Bookmark, 
  MapPin, 
  BedDouble, 
  Bath, 
  Maximize2, 
  Layers, 
  Compass, 
  Car, 
  Phone, 
  User, 
  ShieldCheck, 
  AlertTriangle, 
  ExternalLink,
  Share2,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export const ListingDetailModal = ({ listing, allListings, onClose, onSelectListing }) => {
  const { savedIds, toggleSaveListing } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!listing) return null;

  const isSaved = savedIds.has(listing.listing_id);

  // Format Price in INR, Lakhs or Crores
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

  // Check MagicHomes unit conversion
  const isMagicHomes = listing.website === 'magichomes' && listing.carpet_area < 300;
  const carpetSqft = isMagicHomes 
    ? Math.round(listing.carpet_area * 10.7639) 
    : listing.carpet_area;
  const superSqft = isMagicHomes && listing.super_built_up_area < 300 
    ? Math.round(listing.super_built_up_area * 10.7639) 
    : listing.super_built_up_area;

  // Rate per sqft
  const pricePerSqft = carpetSqft > 0 && listing.price > 0 
    ? Math.round(listing.price / carpetSqft) 
    : null;

  // Check if listing has known data anomalies (for educational transparency)
  const isCorrupt = 
    listing.price < 0 || 
    (listing.floor > listing.total_floors) || 
    (listing.carpet_area > listing.super_built_up_area && !isMagicHomes) || 
    listing.latitude > 70;
  const isFake = listing.price > 0 && listing.price < 50000;

  // Client-side Similar Listings (backend endpoint /v1/listings/{id}/similar returns 404!)
  const similarListings = React.useMemo(() => {
    if (!allListings || !allListings.length) return [];
    return allListings
      .filter(item => 
        item.listing_id !== listing.listing_id &&
        item.locality?.toLowerCase() === listing.locality?.toLowerCase() &&
        item.bedroom === listing.bedroom &&
        item.is_live &&
        item.price > 100000 &&
        Math.abs(item.price - listing.price) / (listing.price || 1) <= 0.25
      )
      .slice(0, 4);
  }, [allListings, listing]);

  const handleShare = () => {
    const url = `${window.location.origin}${window.location.pathname}#listing-${listing.listing_id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800">
              {listing.property_type || 'Apartment'}
            </span>
            {listing.is_live ? (
              <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-green-50 text-green-700 border border-green-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Active Listing
              </span>
            ) : (
              <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                Inactive / Historical
              </span>
            )}
            {listing.is_verified && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Verified
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors flex items-center gap-1 text-xs font-medium"
              title="Copy link to listing"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? 'Copied Link' : 'Share'}</span>
            </button>
            <button
              onClick={() => toggleSaveListing(listing.listing_id)}
              className={`p-2 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium ${
                isSaved ? 'text-emerald-700 bg-emerald-100' : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-emerald-600' : ''}`} />
              <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* Title & Price Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {listing.apartment_name || 'Independent Residence'}
              </h2>
              <p className="text-sm font-medium text-slate-500 flex items-center gap-1.5 mt-1 capitalize">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                {listing.locality}, Bangalore · Portal: <span className="font-semibold text-slate-700 uppercase">{listing.website}</span>
              </p>
            </div>

            <div className="text-left sm:text-right">
              <div className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">
                {formatPrice(listing.price)}
              </div>
              {pricePerSqft && (
                <p className="text-xs font-semibold text-slate-500 mt-0.5">
                  ₹{pricePerSqft.toLocaleString('en-IN')} / sq.ft.
                </p>
              )}
              <p className="text-[11px] text-slate-400">Total: ₹{listing.price?.toLocaleString('en-IN')}</p>
            </div>
          </div>

          {/* Anomaly Alerts (if applicable) */}
          {isFake && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Enquiry-Bait Warning</span>
                This listing's sale price of ₹{listing.price?.toLocaleString('en-IN')} is unnaturally low compared to Bangalore market rates. It was classified as a lead generation enquiry bait.
              </div>
            </div>
          )}

          {isCorrupt && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Physical Anomaly Flagged</span>
                {listing.price < 0 && 'Negative price detected. '}
                {listing.floor > listing.total_floors && `Unit on floor ${listing.floor} in a ${listing.total_floors}-story building. `}
                {listing.carpet_area > listing.super_built_up_area && 'Carpet area exceeds super built-up area. '}
                {listing.latitude > 70 && 'Latitude and longitude coordinates swapped in record.'}
              </div>
            </div>
          )}

          {/* Key Property Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex items-center space-x-3 p-2">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <BedDouble className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Bedrooms</p>
                <p className="text-sm font-bold text-slate-800">{listing.bedroom || 0} BHK</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-2">
              <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Bath className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Bathrooms</p>
                <p className="text-sm font-bold text-slate-800">{listing.bathroom || 1} Baths</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-2">
              <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <Maximize2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Carpet Area</p>
                <p className="text-sm font-bold text-slate-800">
                  {carpetSqft} sq.ft.
                  {isMagicHomes && <span className="text-[10px] text-purple-600 block font-normal">({listing.carpet_area} m² converted)</span>}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-2">
              <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Floor Level</p>
                <p className="text-sm font-bold text-slate-800">
                  {listing.floor ?? 0} of {listing.total_floors ?? 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Secondary Specifications */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-6 text-sm border-t border-b border-slate-100 py-4">
            <div>
              <span className="text-slate-400 block text-xs">Super Built-up Area</span>
              <span className="font-semibold text-slate-800">{superSqft || 'N/A'} sq.ft.</span>
            </div>
            <div>
              <span className="text-slate-400 block text-xs">Furnishing Status</span>
              <span className="font-semibold text-slate-800 capitalize">{listing.furnishing || 'Unfurnished'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-xs">Facing Direction</span>
              <span className="font-semibold text-slate-800 capitalize flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-slate-500" />
                {listing.facing_direction || 'East'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-xs">Balconies</span>
              <span className="font-semibold text-slate-800">{listing.balcony ?? 1} Balconies</span>
            </div>
            <div>
              <span className="text-slate-400 block text-xs">Covered Parking</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1">
                <Car className="w-3.5 h-3.5 text-slate-500" />
                {listing.covered_parking ? `${listing.covered_parking} Vehicle(s)` : 'Available on street'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-xs">Project Identifier</span>
              <span className="font-semibold text-slate-800">{listing.project_id || 'Individual Listing'}</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Description</h3>
            <div className="text-sm text-slate-600 bg-slate-50/50 p-4 rounded-xl border border-slate-100 leading-relaxed">
              {listing.description || 'No description provided by seller.'}
            </div>
          </div>

          {/* Contact Seller Card */}
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                <User className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-slate-900">{listing.posted_by_name || 'Listing Agent'}</p>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-200/70 text-emerald-900">
                    {listing.posted_by || 'Agent'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3 text-emerald-600" />
                  {listing.posted_by_contact || '+91 200 123 4567'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <a 
                href={`tel:${listing.posted_by_contact}`}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Phone className="w-3.5 h-3.5" /> Call Seller
              </a>
              {listing.listing_url && (
                <a
                  href={listing.listing_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 border border-slate-300 hover:bg-white text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Original Portal
                </a>
              )}
            </div>
          </div>

          {/* Similar Listings Recommendation (Client-side calculated) */}
          {similarListings.length > 0 && (
            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" /> Similar Listings in {listing.locality}
                </h3>
                <span className="text-xs text-slate-400">Same BHK & ±25% Price</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {similarListings.map(sim => (
                  <div
                    key={sim.listing_id}
                    onClick={() => onSelectListing(sim)}
                    className="p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:shadow-md cursor-pointer transition-all bg-white flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-900 truncate max-w-[200px]">{sim.apartment_name}</p>
                      <p className="text-xs text-slate-500 capitalize">{sim.bedroom} BHK · {sim.carpet_area} sq.ft.</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-extrabold text-emerald-700">{formatPrice(sim.price)}</p>
                      <span className="text-[10px] text-slate-400 capitalize">{sim.website}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
