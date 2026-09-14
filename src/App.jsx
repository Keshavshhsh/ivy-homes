import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ListingsView } from './components/ListingsView';
import { RentalsView } from './components/RentalsView';
import { ProjectsView } from './components/ProjectsView';
import { SavedView } from './components/SavedView';
import { InsightsView } from './components/InsightsView';
import { ListingDetailModal } from './components/ListingDetailModal';
import { api, API_KEY } from './services/api';
import { 
  Building2, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

const MainApp = () => {
  const { accessToken, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('listings');
  const [listings, setListings] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [projects, setProjects] = useState([]);
  const [marketStats, setMarketStats] = useState(null);
  const [localitiesData, setLocalitiesData] = useState(null);
  const [findings, setFindings] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedListing, setSelectedListing] = useState(null);

  // Load all initial dataset records
  useEffect(() => {
    const loadAll = async () => {
      setLoadingData(true);
      try {
        const [lData, rData, pData, stats] = await Promise.all([
          api.getAllListings(),
          api.getAllRentals(),
          api.getAllProjects(),
          api.getMarketStats(),
        ]);
        setListings(lData);
        setRentals(rData);
        setProjects(pData);
        setMarketStats(stats);

        // Load findings from submission.json
        try {
          const subRes = await fetch('/submission.json');
          if (subRes.ok) {
            const sub = await subRes.json();
            setFindings(sub.findings || []);
          }
        } catch (e) {
          console.warn('Could not load submission.json findings', e);
        }
      } catch (err) {
        console.error('Failed to load dataset:', err);
      } finally {
        setLoadingData(false);
      }
    };

    loadAll();
  }, []);

  // Fetch live localities data when accessToken is ready
  useEffect(() => {
    if (!accessToken) return;
    const fetchLocalities = async () => {
      const locData = await api.getLocalities(accessToken);
      if (locData) {
        setLocalitiesData(locData);
      }
    };
    fetchLocalities();
  }, [accessToken]);

  // Handle URL hash changes for deep linking (e.g. #listing-100-1000461 or #tab-insights)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#listing-')) {
        const id = hash.replace('#listing-', '');
        if (listings.length > 0) {
          const found = listings.find(l => l.listing_id === id);
          if (found) setSelectedListing(found);
        }
      } else if (hash.startsWith('#tab-')) {
        const tab = hash.replace('#tab-', '');
        if (['listings', 'rentals', 'projects', 'saved', 'insights'].includes(tab)) {
          setActiveTab(tab);
        }
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [listings]);

  const handleSelectListing = (listing) => {
    setSelectedListing(listing);
    if (listing) {
      window.location.hash = `listing-${listing.listing_id}`;
    } else {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  const handleSelectListingById = (id) => {
    const found = listings.find(l => l.listing_id === id);
    if (found) {
      handleSelectListing(found);
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    window.location.hash = `tab-${tabId}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      {/* Navigation Header */}
      <Navbar activeTab={activeTab} setActiveTab={handleTabChange} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'listings' && (
          <ListingsView
            listings={listings}
            loading={loadingData}
            onSelectListing={handleSelectListing}
          />
        )}

        {activeTab === 'rentals' && (
          <RentalsView
            rentals={rentals}
            loading={loadingData}
          />
        )}

        {activeTab === 'projects' && (
          <ProjectsView
            projects={projects}
            listings={listings}
            loading={loadingData}
          />
        )}

        {activeTab === 'saved' && (
          <SavedView
            listings={listings}
            onSelectListing={handleSelectListing}
            onBrowse={() => handleTabChange('listings')}
          />
        )}

        {activeTab === 'insights' && (
          <InsightsView
            marketStats={marketStats}
            localitiesData={localitiesData}
            findings={findings}
            onSelectListingById={handleSelectListingById}
          />
        )}
      </main>

      {/* Listing Detail Modal */}
      {selectedListing && (
        <ListingDetailModal
          listing={selectedListing}
          allListings={listings}
          onClose={() => handleSelectListing(null)}
          onSelectListing={handleSelectListing}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-md bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
              IH
            </div>
            <span className="font-bold text-slate-800">Ivy Homes Assignment</span>
            <span>· Built for Bangalore Real Estate Intelligence</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1 text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              API Key: <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-800">{API_KEY}</code>
            </span>
            <span>·</span>
            <span>Keshav Kumar (MNNIT)</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
