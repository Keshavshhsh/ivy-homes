import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Bookmark, 
  Trash2, 
  MapPin, 
  BedDouble, 
  Bath, 
  Maximize2, 
  Building2, 
  ExternalLink,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

export const SavedView = ({ listings, onSelectListing, onBrowse }) => {
  const { user, accessToken, savedIds, toggleSaveListing } = useAuth();
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sync saved items using live API /v1/saved and local listings cache
  useEffect(() => {
    const fetchSaved = async () => {
      if (!accessToken) return;
      setLoading(true);
      try {
        const data = await api.getSavedListings(accessToken);
        if (data && data.results) {
          setSavedItems(data.results);
        } else if (listings) {
          // Fallback matching
          setSavedItems(listings.filter(l => savedIds.has(l.listing_id)));
        }
      } catch (err) {
        console.warn('Falling back to local saved items', err);
        if (listings) {
          setSavedItems(listings.filter(l => savedIds.has(l.listing_id)));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSaved();
  }, [accessToken, savedIds, listings]);

  const formatPrice = (price) => {
    if (!price || price < 0) return `₹${price?.toLocaleString('en-IN') || 0}`;
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
    return `₹${price.toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-emerald-600 fill-emerald-600" /> Saved Properties
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Personalized collection for <span className="font-bold text-slate-800">{user?.email || 'Active User'}</span> · Synced with <code className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-mono text-xs">/v1/saved</code>
          </p>
        </div>

        <div className="text-right">
          <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
            {savedItems.length} {savedItems.length === 1 ? 'Property' : 'Properties'} Saved
          </span>
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="py-20 text-center">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-2" />
          <p className="text-sm text-slate-500">Syncing saved properties from /v1/saved...</p>
        </div>
      ) : savedItems.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <Bookmark className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">No saved properties yet</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              Click the bookmark icon on any property in the listings or detail view to save it to your account.
            </p>
          </div>
          <button
            onClick={onBrowse}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-all shadow-md flex items-center gap-2 mx-auto"
          >
            Browse Listings <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {savedItems.map(item => (
            <div
              key={item.listing_id}
              onClick={() => onSelectListing(item)}
              className="group bg-white rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-xl transition-all p-4 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
                    {item.property_type || 'Apartment'}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSaveListing(item.listing_id);
                    }}
                    className="p-1.5 rounded-full text-red-500 hover:bg-red-50 transition-colors"
                    title="Remove from saved"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors truncate">
                  {item.apartment_name || 'Independent Residence'}
                </h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 capitalize">
                  <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                  {item.locality}, Bangalore
                </p>

                <div className="mt-3">
                  <div className="text-xl font-black text-slate-900">
                    {formatPrice(item.price)}
                  </div>
                  <p className="text-[11px] text-slate-400 capitalize">
                    {item.bedroom} BHK · {item.carpet_area} sq.ft. · Floor {item.floor ?? 0}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="capitalize font-medium text-[11px]">{item.website}</span>
                <span className="text-emerald-600 font-bold group-hover:translate-x-0.5 transition-transform">
                  View Specs →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
