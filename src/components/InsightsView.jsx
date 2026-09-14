import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Search, 
  Database, 
  MapPin, 
  Coins, 
  Home, 
  Building2, 
  KeyRound, 
  Layers, 
  Filter, 
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const InsightsView = ({ marketStats, localitiesData, findings, corruptIds, fakeIds, onSelectListingById }) => {
  const [activeSubTab, setActiveSubTab] = useState('audit'); // 'audit', 'corrupt', 'fraud', 'localities'
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchAudit, setSearchAudit] = useState('');
  const [expandedFinding, setExpandedFinding] = useState(null);

  const categories = [
    'all', 
    'auth', 
    'pagination', 
    'completeness', 
    'duplicates', 
    'data_quality', 
    'fraud', 
    'units', 
    'timestamps', 
    'missing_endpoint', 
    'undocumented_endpoint', 
    'consistency'
  ];

  const filteredFindings = useMemo(() => {
    if (!findings) return [];
    return findings.filter(f => {
      if (filterCategory !== 'all' && f.category !== filterCategory) return false;
      if (searchAudit.trim()) {
        const q = searchAudit.toLowerCase();
        const matchEp = f.endpoint?.toLowerCase().includes(q);
        const matchDoc = f.documented?.toLowerCase().includes(q);
        const matchAct = f.actual?.toLowerCase().includes(q);
        const matchCat = f.category?.toLowerCase().includes(q);
        if (!matchEp && !matchDoc && !matchAct && !matchCat) return false;
      }
      return true;
    });
  }, [findings, filterCategory, searchAudit]);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3 border border-emerald-500/30">
            <BarChart3 className="w-3.5 h-3.5" /> Market Intelligence & Documentation Audit
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Bangalore Real Estate Data Discoveries
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
            While the original API documentation claimed perfect consistency, comprehensive auditing of 4,700 listings, 1,900 rentals, and 520 projects uncovered 20 documentation discrepancies, 32 physical data corruptions, and 8 enquiry-bait listings.
          </p>
        </div>
      </div>

      {/* Ten Questions Executive KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Q1 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Listings (Q1)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-amber-100 text-amber-800 font-semibold">Docs said 4,348</span>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">4,700</p>
          <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Retrievable to has_more=false</p>
        </div>

        {/* Q2 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Unique Homes (Q2)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-emerald-100 text-emerald-800 font-semibold">Deduped</span>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">4,583</p>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">117 cross-posted pairs found</p>
        </div>

        {/* Q3 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Live Listings (Q3)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-blue-100 text-blue-800 font-semibold">is_live=true</span>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">3,722</p>
          <p className="text-[11px] text-red-500 font-medium mt-0.5">978 inactive exposed by API</p>
        </div>

        {/* Q4 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Corrupt Records (Q4)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-red-100 text-red-800 font-semibold">Impossible</span>
          </div>
          <p className="text-2xl font-black text-red-600 mt-1">32</p>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">4 patterns x 8 listings each</p>
        </div>

        {/* Q5 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Whitefield Rent (Q5)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-emerald-100 text-emerald-800 font-semibold">206 Rentals</span>
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-1">₹71.58 L</p>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">Exact: ₹7,158,600 / month</p>
        </div>

        {/* Q6 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">2BHK Rate/SqFt (Q6)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-purple-100 text-purple-800 font-semibold">Unit-Adjusted</span>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">₹11,496.64</p>
          <p className="text-[11px] text-purple-600 font-medium mt-0.5">MagicHomes converted m²→ft²</p>
        </div>

        {/* Q7 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Costliest Proj (Q7)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-800 font-semibold">P10255</span>
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-1">₹4.89 Cr</p>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">Puravankara Vista (₹48.9M)</p>
        </div>

        {/* Q8 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Past 7 Days (Q8)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-blue-100 text-blue-800 font-semibold">IST Interval</span>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">149</p>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">[Sep 3 00:00, Sep 10 00:00)</p>
        </div>

        {/* Q9 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fake Listings (Q9)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-amber-100 text-amber-800 font-semibold">&lt; ₹17,000</span>
          </div>
          <p className="text-2xl font-black text-amber-600 mt-1">8</p>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">Sale enquiry-bait leads</p>
        </div>

        {/* Q10 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Wrong Proj Count (Q10)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-red-100 text-red-800 font-semibold">Out of Sync</span>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">127</p>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">Projects with desynced total</p>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="border-b border-slate-200 flex items-center space-x-4">
        <button
          onClick={() => setActiveSubTab('audit')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeSubTab === 'audit'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" /> 20 API Discrepancies (Lies Audit)
        </button>

        <button
          onClick={() => setActiveSubTab('localities')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeSubTab === 'localities'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MapPin className="w-4 h-4" /> Bangalore Localities Breakdown
        </button>

        <button
          onClick={() => setActiveSubTab('corrupt')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeSubTab === 'corrupt'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-red-600" /> 32 Corrupt Listings
        </button>

        <button
          onClick={() => setActiveSubTab('fraud')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeSubTab === 'fraud'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-amber-600" /> 8 Fake Listings (Enquiry Bait)
        </button>
      </div>

      {/* Sub-Tab 1: 20 API Discrepancies Hub */}
      {activeSubTab === 'audit' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Category Filter:</span>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 capitalize text-slate-800 focus:outline-emerald-500"
              >
                {categories.map(c => (
                  <option key={c} value={c} className="capitalize">
                    {c === 'all' ? 'All Categories (20)' : c.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search endpoints, impact, finding..."
                value={searchAudit}
                onChange={(e) => setSearchAudit(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredFindings.map((f, idx) => {
              const isExpanded = expandedFinding === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs transition-all hover:border-slate-300"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2.5">
                      <code className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-800 rounded-md">
                        {f.endpoint}
                      </code>
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                        {f.category.replace('_', ' ')}
                      </span>
                    </div>

                    <button
                      onClick={() => setExpandedFinding(isExpanded ? null : idx)}
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 self-start sm:self-auto"
                    >
                      <span>{isExpanded ? 'Hide Evidence' : 'Show Details & Evidence'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-xs leading-relaxed">
                    <div className="bg-red-50/50 p-3 rounded-xl border border-red-100">
                      <span className="font-bold text-red-700 uppercase tracking-wider text-[10px] block mb-1">
                        Documented Claim (What docs promised)
                      </span>
                      <p className="text-slate-700">{f.documented}</p>
                    </div>

                    <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
                      <span className="font-bold text-emerald-700 uppercase tracking-wider text-[10px] block mb-1">
                        Observed Reality (What running API actually does)
                      </span>
                      <p className="text-slate-800 font-medium">{f.actual}</p>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-100 pt-2.5">
                    <div>
                      <span className="font-bold text-slate-500">Methodology: </span>
                      {f.how_found}
                    </div>
                    <div>
                      <span className="font-bold text-slate-500">Impact: </span>
                      <span className="text-slate-700">{f.impact}</span>
                    </div>
                  </div>

                  {/* Expanded Evidence IDs */}
                  {isExpanded && f.evidence && f.evidence.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100 animate-in fade-in">
                      <p className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Evidence Identifiers ({f.evidence.length} samples):
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {f.evidence.map(id => (
                          <span
                            key={id}
                            onClick={() => onSelectListingById && onSelectListingById(id)}
                            className="font-mono text-[11px] px-2 py-0.5 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 text-slate-700 rounded-md transition-colors cursor-pointer"
                            title="Click to view listing"
                          >
                            {id}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Locality Breakdown Chart */}
      {activeSubTab === 'localities' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Bangalore Locality Inventory Distribution</h3>
              <p className="text-xs text-slate-500">Retrieved from undocumented endpoint <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-emerald-700">/v1/localities</code></p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              Sum = 4,700 Listings
            </span>
          </div>

          <div className="space-y-3">
            {localitiesData?.results?.map((item) => {
              const maxCount = 514; // Whitefield max
              const pct = (item.listing_count / maxCount) * 100;
              const isWhitefield = item.locality.toLowerCase() === 'whitefield';

              return (
                <div key={item.locality} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="capitalize flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      {item.locality}
                      {isWhitefield && (
                        <span className="ml-1.5 px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] rounded-sm font-bold uppercase">
                          Assigned Locality
                        </span>
                      )}
                    </span>
                    <span className="text-slate-700 font-bold">{item.listing_count} Listings</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isWhitefield ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-slate-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sub-Tab 3: 32 Corrupt Listings Inspector */}
      {activeSubTab === 'corrupt' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" /> 32 Physically Impossible Listings
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Identified through programmatic domain constraints validation. 4 symmetric groups of exactly 8 listings each.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-red-50/70 border border-red-200 rounded-xl space-y-2">
              <span className="text-xs font-bold text-red-800 uppercase tracking-wider block">1. Floor &gt; Total Floors (8)</span>
              <p className="text-xs text-slate-600">e.g. Unit located on 37th floor in a 22-story building.</p>
              <div className="flex flex-wrap gap-1 pt-1 font-mono text-[11px]">
                {['100-1002884', 'MAG-1000179', 'MAG-1000885', 'MAG-1003269', 'MAG-1003510', 'ZER-1001249', 'ZER-1001334', 'ZER-1002911'].map(id => (
                  <span key={id} onClick={() => onSelectListingById(id)} className="bg-white px-2 py-0.5 rounded border border-red-200 text-red-800 cursor-pointer hover:bg-red-100">{id}</span>
                ))}
              </div>
            </div>

            <div className="p-4 bg-red-50/70 border border-red-200 rounded-xl space-y-2">
              <span className="text-xs font-bold text-red-800 uppercase tracking-wider block">2. Carpet &gt; Super Built-up (8)</span>
              <p className="text-xs text-slate-600">e.g. 2,146 sqft carpet in 1,722 sqft super built-up.</p>
              <div className="flex flex-wrap gap-1 pt-1 font-mono text-[11px]">
                {['100-1001077', '100-1002442', '100-1003117', 'DWE-1003673', 'SQU-1003177', 'ZER-1000500', 'ZER-1002667', 'ZER-1003426'].map(id => (
                  <span key={id} onClick={() => onSelectListingById(id)} className="bg-white px-2 py-0.5 rounded border border-red-200 text-red-800 cursor-pointer hover:bg-red-100">{id}</span>
                ))}
              </div>
            </div>

            <div className="p-4 bg-red-50/70 border border-red-200 rounded-xl space-y-2">
              <span className="text-xs font-bold text-red-800 uppercase tracking-wider block">3. Lat/Lng Swapped (8)</span>
              <p className="text-xs text-slate-600">Latitude 77.61 (in Arabian Sea/China) & Longitude 13.04.</p>
              <div className="flex flex-wrap gap-1 pt-1 font-mono text-[11px]">
                {['100-1000035', '100-1001141', '100-1002600', 'DWE-1002892', 'SQU-1000394', 'SQU-1002298', 'SQU-1003370', 'ZER-1000430'].map(id => (
                  <span key={id} onClick={() => onSelectListingById(id)} className="bg-white px-2 py-0.5 rounded border border-red-200 text-red-800 cursor-pointer hover:bg-red-100">{id}</span>
                ))}
              </div>
            </div>

            <div className="p-4 bg-red-50/70 border border-red-200 rounded-xl space-y-2">
              <span className="text-xs font-bold text-red-800 uppercase tracking-wider block">4. Negative Prices (8)</span>
              <p className="text-xs text-slate-600">e.g. Sale price listed as -₹17,150,000 INR.</p>
              <div className="flex flex-wrap gap-1 pt-1 font-mono text-[11px]">
                {['100-1002346', 'DWE-1001165', 'DWE-1001183', 'DWE-1001909', 'SQU-1000979', 'SQU-1002843', 'ZER-1001207', 'ZER-1002632'].map(id => (
                  <span key={id} onClick={() => onSelectListingById(id)} className="bg-white px-2 py-0.5 rounded border border-red-200 text-red-800 cursor-pointer hover:bg-red-100">{id}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 4: 8 Fake Listings Inspector */}
      {activeSubTab === 'fraud' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600" /> 8 Enquiry-Bait Fake Listings
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              These listings quote sale prices under ₹17,000 to lure leads into calling agents. Real market prices for 2-3 BHK units in Bangalore start above ₹25 Lakhs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { id: '100-1002501', name: 'Nitesh Greens', loc: 'hsr layout', bhk: 2, price: 8250 },
              { id: 'DWE-1002631', name: 'My Home Woods', loc: 'indiranagar', bhk: 2, price: 6720 },
              { id: 'DWE-1003102', name: 'Rohan Vista', loc: 'yelahanka', bhk: 2, price: 10540 },
              { id: 'MAG-1003492', name: 'Mantri Vista', loc: 'electronic city', bhk: 1, price: 6250 },
              { id: 'SQU-1001431', name: 'Godrej Meadows', loc: 'whitefield', bhk: 2, price: 7590 },
              { id: 'SQU-1003524', name: 'Adarsh Boulevard', loc: 'bellandur', bhk: 3, price: 15450 },
              { id: 'ZER-1003652', name: 'Prestige Sanctuary', loc: 'koramangala', bhk: 3, price: 16790 },
              { id: 'ZER-1003813', name: 'Aparna Residency', loc: 'sarjapur road', bhk: 2, price: 6550 },
            ].map(item => (
              <div
                key={item.id}
                onClick={() => onSelectListingById(item.id)}
                className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/60 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-mono text-[11px] font-bold text-amber-900">{item.id}</span>
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-200/80 text-amber-900">Fake Price</span>
                </div>
                <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                <p className="text-xs text-slate-500 capitalize">{item.loc} · {item.bhk} BHK</p>
                <div className="mt-2 text-lg font-black text-amber-700">
                  ₹{item.price.toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-500">(Bait)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
